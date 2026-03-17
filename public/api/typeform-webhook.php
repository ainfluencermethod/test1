<?php
/**
 * Typeform Webhook Receiver
 * Accepts POST from Typeform, scores leads, saves to JSONL, pushes to GHL
 */

// Handle GET - status page
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ok', 'service' => 'typeform-webhook', 'method' => 'GET', 'ghl' => 'enabled']);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$logFile = __DIR__ . '/typeform-errors.log';
$dataFile = __DIR__ . '/typeform-submissions.jsonl';

// GHL Configuration
$GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';
$GHL_API_TOKEN = 'pit-47d8c7d6-5d01-46b2-802a-93c4ef1aba70';
$GHL_LOCATION_ID = 'TGsyH70nsz7y3hijuqTn';
$GHL_API_VERSION = '2021-07-28';

function pushToGHL($record, $GHL_API_URL, $GHL_API_TOKEN, $GHL_LOCATION_ID, $GHL_API_VERSION, $logFile) {
    $ghlResult = ['attempted' => true, 'success' => false];

    // Build contact payload with custom fields
    $contactPayload = [
        'firstName' => $record['name'] ?: 'Unknown',
        'email' => $record['email'],
        'locationId' => $GHL_LOCATION_ID,
        'tags' => [
            'source:typeform',
            'source:ai-universa-apr2026',
            'lead-grade:' . $record['grade'],
        ],
    ];

    if (!empty($record['phone'])) {
        $contactPayload['phone'] = $record['phone'];
    }

    // Add custom fields
    $customFields = [];
    $fieldMap = [
        'lead_score' => (string)$record['score'],
        'lead_grade' => $record['grade'],
        'ai_interest' => $record['interest'],
        'ai_level' => $record['ai_level'],
        'budget' => $record['budget'],
        'urgency' => $record['urgency'],
    ];

    // Add UTM fields
    $utm = $record['utm'] ?? [];
    if (!empty($utm['utm_source'])) $fieldMap['utm_source'] = $utm['utm_source'];
    if (!empty($utm['utm_medium'])) $fieldMap['utm_medium'] = $utm['utm_medium'];
    if (!empty($utm['utm_campaign'])) $fieldMap['utm_campaign'] = $utm['utm_campaign'];

    foreach ($fieldMap as $key => $value) {
        if (!empty($value)) {
            $customFields[] = ['key' => $key, 'field_value' => $value];
        }
    }

    if (!empty($customFields)) {
        $contactPayload['customFields'] = $customFields;
    }

    // First attempt: full payload with custom fields
    $ch = curl_init($GHL_API_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $GHL_API_TOKEN,
            'Version: ' . $GHL_API_VERSION,
        ],
        CURLOPT_POSTFIELDS => json_encode($contactPayload),
        CURLOPT_TIMEOUT => 15,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        $ghlResult['success'] = true;
        $ghlResult['http_code'] = $httpCode;
        $ghlResult['response'] = json_decode($response, true);
        return $ghlResult;
    }

    // Log full payload error
    $errorMsg = date('c') . " GHL full payload failed (HTTP $httpCode): $response | curl: $curlError\n";
    file_put_contents($logFile, $errorMsg, FILE_APPEND);

    // Fallback: basic contact with tags only (no custom fields)
    $fallbackPayload = [
        'firstName' => $record['name'] ?: 'Unknown',
        'email' => $record['email'],
        'locationId' => $GHL_LOCATION_ID,
        'tags' => $contactPayload['tags'],
    ];

    if (!empty($record['phone'])) {
        $fallbackPayload['phone'] = $record['phone'];
    }

    $ch2 = curl_init($GHL_API_URL);
    curl_setopt_array($ch2, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $GHL_API_TOKEN,
            'Version: ' . $GHL_API_VERSION,
        ],
        CURLOPT_POSTFIELDS => json_encode($fallbackPayload),
        CURLOPT_TIMEOUT => 15,
    ]);

    $response2 = curl_exec($ch2);
    $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    $curlError2 = curl_error($ch2);
    curl_close($ch2);

    if ($httpCode2 >= 200 && $httpCode2 < 300) {
        $ghlResult['success'] = true;
        $ghlResult['fallback'] = true;
        $ghlResult['http_code'] = $httpCode2;
        $ghlResult['response'] = json_decode($response2, true);
    } else {
        $errorMsg2 = date('c') . " GHL fallback also failed (HTTP $httpCode2): $response2 | curl: $curlError2\n";
        file_put_contents($logFile, $errorMsg2, FILE_APPEND);
        $ghlResult['error'] = "Both full and fallback GHL push failed";
        $ghlResult['http_code'] = $httpCode2;
    }

    return $ghlResult;
}

try {
    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);

    if (!$payload || !isset($payload['form_response'])) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Invalid Typeform payload']);
        exit;
    }

    $formResponse = $payload['form_response'];
    $answers = $formResponse['answers'] ?? [];
    $hiddenFields = $formResponse['hidden'] ?? [];
    $variables = $formResponse['variables'] ?? [];

    // Extract hidden fields
    $utm = [
        'utm_source' => $hiddenFields['utm_source'] ?? '',
        'utm_medium' => $hiddenFields['utm_medium'] ?? '',
        'utm_campaign' => $hiddenFields['utm_campaign'] ?? '',
        'utm_content' => $hiddenFields['utm_content'] ?? '',
        'utm_term' => $hiddenFields['utm_term'] ?? '',
        'fbclid' => $hiddenFields['fbclid'] ?? '',
        'gclid' => $hiddenFields['gclid'] ?? '',
    ];

    // Parse answers
    $parsed = [];
    $fieldMap = [];
    foreach ($answers as $answer) {
        $field = $answer['field'] ?? [];
        $fieldRef = $field['ref'] ?? ($field['id'] ?? '');
        $fieldType = $answer['type'] ?? '';
        $value = '';

        switch ($fieldType) {
            case 'text':
                $value = $answer['text'] ?? '';
                break;
            case 'email':
                $value = $answer['email'] ?? '';
                break;
            case 'phone_number':
                $value = $answer['phone_number'] ?? '';
                break;
            case 'choice':
                $value = $answer['choice']['label'] ?? ($answer['choice']['other'] ?? '');
                break;
            case 'choices':
                $labels = [];
                foreach (($answer['choices']['labels'] ?? []) as $l) {
                    $labels[] = $l;
                }
                if (!empty($answer['choices']['other'])) {
                    $labels[] = $answer['choices']['other'];
                }
                $value = implode(', ', $labels);
                break;
            case 'number':
                $value = $answer['number'] ?? 0;
                break;
            case 'boolean':
                $value = $answer['boolean'] ? 'Yes' : 'No';
                break;
            case 'date':
                $value = $answer['date'] ?? '';
                break;
            case 'url':
                $value = $answer['url'] ?? '';
                break;
            default:
                $value = json_encode($answer);
        }

        $parsed[] = [
            'field_ref' => $fieldRef,
            'field_type' => $fieldType,
            'value' => $value,
        ];
        $fieldMap[$fieldRef] = $value;
    }

    // Try to extract known fields by common patterns
    $name = '';
    $email = '';
    $phone = '';
    $interest = '';
    $aiLevel = '';
    $budget = '';
    $urgency = '';
    $intent = '';
    $blocker = '';
    $role = '';
    $longTexts = [];

    foreach ($answers as $answer) {
        $field = $answer['field'] ?? [];
        $fieldRef = strtolower($field['ref'] ?? '');
        $fieldType = $answer['type'] ?? '';
        $value = '';

        switch ($fieldType) {
            case 'text':
                $value = $answer['text'] ?? '';
                break;
            case 'email':
                $value = $answer['email'] ?? '';
                break;
            case 'phone_number':
                $value = $answer['phone_number'] ?? '';
                break;
            case 'choice':
                $value = $answer['choice']['label'] ?? ($answer['choice']['other'] ?? '');
                break;
            case 'choices':
                $labels = [];
                foreach (($answer['choices']['labels'] ?? []) as $l) $labels[] = $l;
                if (!empty($answer['choices']['other'])) $labels[] = $answer['choices']['other'];
                $value = implode(', ', $labels);
                break;
            default:
                $value = '';
        }

        // Map by field type and ref
        if ($fieldType === 'email') {
            $email = $value;
        } elseif ($fieldType === 'phone_number') {
            $phone = $value;
        } elseif ($fieldType === 'text' && (strpos($fieldRef, 'name') !== false || strpos($fieldRef, 'ime') !== false)) {
            $name = $value;
        } elseif ($fieldType === 'text' && $name === '' && $email === '') {
            // First text field is likely name
            $name = $value;
        }

        // Score fields - match by value content
        if ($fieldType === 'choice' || $fieldType === 'choices') {
            // Interest
            if (strpos($value, 'Avtomatizacija') !== false || strpos($value, 'prodaje') !== false ||
                strpos($value, 'vsebin') !== false || strpos($value, 'Produktivnost') !== false ||
                strpos($value, 'raziskujem') !== false) {
                $interest = $value;
            }
            // AI Level
            if (strpos($value, 'začetnik') !== false || strpos($value, 'testiral') !== false ||
                strpos($value, 'Redno uporabl') !== false || strpos($value, 'za posel') !== false) {
                $aiLevel = $value;
            }
            // Budget
            if (strpos($value, 'Trenutno nič') !== false || strpos($value, 'Do 100') !== false ||
                strpos($value, '100€ do 500') !== false || strpos($value, '500€ do 2') !== false ||
                strpos($value, '2.000€+') !== false || strpos($value, '2.000') !== false) {
                $budget = $value;
            }
            // Urgency
            if (strpos($value, 'Takoj') !== false || strpos($value, 'naslednjih 30') !== false ||
                strpos($value, 'naslednjih 3 mesecih') !== false || strpos($value, 'zbiram informacije') !== false) {
                $urgency = $value;
            }
            // Intent
            if (strpos($value, 'čim prej') !== false || strpos($value, 'Verjetno ja') !== false ||
                strpos($value, 'Mogoče') !== false || strpos($value, 'Samo gledam') !== false) {
                $intent = $value;
            }
            // Role (if present)
            if (strpos($fieldRef, 'role') !== false || strpos($fieldRef, 'vloga') !== false) {
                $role = $value;
            }
            // Blocker (if present)
            if (strpos($fieldRef, 'blocker') !== false || strpos($fieldRef, 'ovira') !== false ||
                strpos($fieldRef, 'challenge') !== false || strpos($fieldRef, 'izziv') !== false) {
                $blocker = $value;
            }
        }

        if ($fieldType === 'text' && strlen($value) > 50) {
            $longTexts[] = $value;
        }
    }

    // Scoring
    $interestScores = [
        'Avtomatizacija biznisa' => 4,
        'Več prodaje in leadov' => 4,
        'Ustvarjanje vsebin' => 3,
        'Produktivnost in prihranek časa' => 2,
        'Še raziskujem' => 1,
    ];
    $aiLevelScores = [
        'Popoln začetnik' => 1,
        'Malo sem že testiral' => 2,
        'Redno uporabljam AI' => 3,
        'AI že uporabljam za posel' => 4,
    ];
    $budgetScores = [
        'Trenutno nič' => 0,
        'Do 100€' => 1,
        '100€ do 500€' => 2,
        '500€ do 2.000€' => 3,
        '2.000€+' => 4,
    ];
    $urgencyScores = [
        'Takoj, zdaj rabim sistem' => 4,
        'V naslednjih 30 dneh' => 3,
        'V naslednjih 3 mesecih' => 2,
        'Samo zbiram informacije' => 0,
    ];
    $intentScores = [
        'Ja, čim prej' => 4,
        'Verjetno ja' => 3,
        'Mogoče' => 1,
        'Samo gledam' => 0,
    ];

    $score = 0;
    $scoreBreakdown = [];

    // Score interest (check for partial match)
    foreach ($interestScores as $key => $pts) {
        if (strpos($interest, $key) !== false) {
            $score += $pts;
            $scoreBreakdown['interest'] = $pts;
            break;
        }
    }
    foreach ($aiLevelScores as $key => $pts) {
        if (strpos($aiLevel, $key) !== false) {
            $score += $pts;
            $scoreBreakdown['ai_level'] = $pts;
            break;
        }
    }
    foreach ($budgetScores as $key => $pts) {
        if (strpos($budget, $key) !== false) {
            $score += $pts;
            $scoreBreakdown['budget'] = $pts;
            break;
        }
    }
    foreach ($urgencyScores as $key => $pts) {
        if (strpos($urgency, $key) !== false) {
            $score += $pts;
            $scoreBreakdown['urgency'] = $pts;
            break;
        }
    }
    foreach ($intentScores as $key => $pts) {
        if (strpos($intent, $key) !== false) {
            $score += $pts;
            $scoreBreakdown['intent'] = $pts;
            break;
        }
    }

    // Grade
    if ($score >= 15) $grade = 'A';
    elseif ($score >= 11) $grade = 'B';
    elseif ($score >= 7) $grade = 'C';
    else $grade = 'D';

    // Build record
    $record = [
        'timestamp' => date('c'),
        'form_id' => $formResponse['form_id'] ?? '',
        'response_id' => $formResponse['token'] ?? '',
        'landed_at' => $formResponse['landed_at'] ?? '',
        'submitted_at' => $formResponse['submitted_at'] ?? '',
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'interest' => $interest,
        'ai_level' => $aiLevel,
        'budget' => $budget,
        'urgency' => $urgency,
        'intent' => $intent,
        'blocker' => $blocker,
        'role' => $role,
        'score' => $score,
        'score_breakdown' => $scoreBreakdown,
        'grade' => $grade,
        'utm' => $utm,
        'all_answers' => $parsed,
        'long_texts' => $longTexts,
    ];

    // Append to JSONL
    $line = json_encode($record, JSON_UNESCAPED_UNICODE) . "\n";
    $written = file_put_contents($dataFile, $line, FILE_APPEND | LOCK_EX);

    if ($written === false) {
        throw new Exception('Failed to write to JSONL file');
    }

    // Push to GoHighLevel CRM
    $ghlResult = ['attempted' => false];
    if (!empty($email)) {
        $ghlResult = pushToGHL($record, $GHL_API_URL, $GHL_API_TOKEN, $GHL_LOCATION_ID, $GHL_API_VERSION, $logFile);
    } else {
        $ghlResult['skipped'] = 'No email address';
    }

    // Append GHL result to record for logging
    $ghlLogLine = json_encode(['timestamp' => date('c'), 'email' => $email, 'ghl' => $ghlResult], JSON_UNESCAPED_UNICODE) . "\n";
    file_put_contents(__DIR__ . '/ghl-push.log', $ghlLogLine, FILE_APPEND | LOCK_EX);

    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ok', 'grade' => $grade, 'score' => $score, 'ghl' => $ghlResult['success'] ?? false]);

} catch (Exception $e) {
    $errorMsg = date('c') . ' ERROR: ' . $e->getMessage() . "\n";
    file_put_contents($logFile, $errorMsg, FILE_APPEND);

    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Internal server error']);
}
