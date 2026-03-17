import { NextRequest, NextResponse } from "next/server";
import { findStoredSubmissionById, appendSubmission, submissionFromWebhookPayload } from "@/lib/typeform-lead-score";
import { syncTypeformSubmissionToGhl } from "@/lib/typeform-ghl";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Typeform webhook route is ready",
    expects: "POST a Typeform webhook payload to store a normalized submission",
    ghlSync: {
      envFlags: ["TYPEFORM_GHL_SYNC_ENABLED", "TYPEFORM_GHL_SYNC_DRY_RUN"],
      notes: [
        "Default behavior is safe local preparation only.",
        "Set TYPEFORM_GHL_SYNC_ENABLED=true to enable the GHL sync branch.",
        "Set TYPEFORM_GHL_SYNC_DRY_RUN=false to perform live local sync calls.",
      ],
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const submission = submissionFromWebhookPayload(payload);
    const existingSubmission = await findStoredSubmissionById(submission.id);
    const storedSubmission = existingSubmission ?? (await appendSubmission(submission));
    const ghlSync = await syncTypeformSubmissionToGhl(storedSubmission);

    return NextResponse.json({
      ok: true,
      stored: true,
      duplicateSubmission: Boolean(existingSubmission),
      id: storedSubmission.id,
      submittedAt: storedSubmission.submittedAt,
      score: storedSubmission.score,
      leadGrade: storedSubmission.leadGrade,
      respondent: {
        name: storedSubmission.respondentName ?? null,
        email: storedSubmission.email ?? null,
        phone: storedSubmission.phone ?? null,
      },
      ghlSync,
    });
  } catch (error) {
    console.error("Typeform webhook error", error);
    return NextResponse.json(
      {
        ok: false,
        stored: false,
        error: error instanceof Error ? error.message : "Failed to process webhook payload",
      },
      { status: 400 },
    );
  }
}
