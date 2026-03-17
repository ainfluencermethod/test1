import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

// ============================================================================
// GA4 Real-Time API — Returns live visitor data
// Uses runRealtimeReport (v1beta) for instant metrics
// 30-second server-side cache to respect rate limits
// ============================================================================

const PROPERTIES = {
  aiuniversa: { id: '527926974', label: 'AI Universa' },
  aib: { id: '503840321', label: 'AI Influencer Blueprint' },
} as const;

type PropertyKey = keyof typeof PROPERTIES;

// --- Types ---

interface RealtimePageEntry {
  page: string;
  activeUsers: number;
}

interface RealtimeSourceEntry {
  source: string;
  activeUsers: number;
}

interface RealtimeDeviceEntry {
  category: string;
  activeUsers: number;
}

interface RealtimeCountryEntry {
  country: string;
  activeUsers: number;
}

interface RealtimeData {
  activeUsers: number;
  topPages: RealtimePageEntry[];
  sources: RealtimeSourceEntry[];
  devices: RealtimeDeviceEntry[];
  countries: RealtimeCountryEntry[];
}

interface CacheEntry {
  data: RealtimeData;
  timestamp: number;
}

// --- 30s TTL Cache ---
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30_000;

function getCached(key: string): RealtimeData | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  return null;
}

function setCache(key: string, data: RealtimeData): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// --- Auth (mirrors existing ga4/route.ts pattern) ---

function getAuthForProperty(property: PropertyKey) {
  const adcPath = property === 'aib'
    ? join(process.cwd(), 'ga4-aib-adc.json')
    : join(process.env.HOME || '', '.config/gcloud/application_default_credentials.json');

  try {
    const adc = JSON.parse(readFileSync(adcPath, 'utf-8'));
    const oauth2 = new google.auth.OAuth2(adc.client_id, adc.client_secret);
    oauth2.setCredentials({ refresh_token: adc.refresh_token });
    return oauth2;
  } catch {
    return new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
  }
}

// --- Realtime Query ---

async function queryRealtime(property: PropertyKey): Promise<RealtimeData> {
  const config = PROPERTIES[property];
  const auth = getAuthForProperty(property);
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const propertyPath = `properties/${config.id}`;

  // Run all realtime queries in parallel
  const [activeUsersRes, pagesRes, sourcesRes, devicesRes, countriesRes] = await Promise.all([
    // Total active users
    analyticsData.properties.runRealtimeReport({
      property: propertyPath,
      requestBody: {
        metrics: [{ name: 'activeUsers' }],
      },
    }),
    // Top pages
    analyticsData.properties.runRealtimeReport({
      property: propertyPath,
      requestBody: {
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'unifiedScreenName' }],
        limit: '10',
      },
    }),
    // Traffic sources
    analyticsData.properties.runRealtimeReport({
      property: propertyPath,
      requestBody: {
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'sessionSource' }],
        limit: '10',
      },
    }),
    // Device categories
    analyticsData.properties.runRealtimeReport({
      property: propertyPath,
      requestBody: {
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'deviceCategory' }],
      },
    }),
    // Countries
    analyticsData.properties.runRealtimeReport({
      property: propertyPath,
      requestBody: {
        metrics: [{ name: 'activeUsers' }],
        dimensions: [{ name: 'country' }],
        limit: '10',
      },
    }),
  ]);

  // Parse active users
  const activeUsers = parseInt(
    activeUsersRes.data.rows?.[0]?.metricValues?.[0]?.value || '0',
    10
  );

  // Parse pages
  const topPages: RealtimePageEntry[] = (pagesRes.data.rows || []).map((row) => ({
    page: row.dimensionValues?.[0]?.value || '(unknown)',
    activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
  })).sort((a, b) => b.activeUsers - a.activeUsers);

  // Parse sources
  const sources: RealtimeSourceEntry[] = (sourcesRes.data.rows || []).map((row) => ({
    source: row.dimensionValues?.[0]?.value || '(direct)',
    activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
  })).sort((a, b) => b.activeUsers - a.activeUsers);

  // Parse devices
  const devices: RealtimeDeviceEntry[] = (devicesRes.data.rows || []).map((row) => ({
    category: row.dimensionValues?.[0]?.value || 'unknown',
    activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
  })).sort((a, b) => b.activeUsers - a.activeUsers);

  // Parse countries
  const countries: RealtimeCountryEntry[] = (countriesRes.data.rows || []).map((row) => ({
    country: row.dimensionValues?.[0]?.value || '(unknown)',
    activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
  })).sort((a, b) => b.activeUsers - a.activeUsers);

  return { activeUsers, topPages, sources, devices, countries };
}

// --- Route Handler ---

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const property = (searchParams.get('property') || 'aib') as string;

  if (!(property in PROPERTIES)) {
    return NextResponse.json({
      success: false,
      error: `Unknown property: ${property}. Use ?property=aiuniversa or ?property=aib`,
    }, { status: 400 });
  }

  const propertyKey = property as PropertyKey;
  const cacheKey = `realtime_${propertyKey}`;

  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached,
      cached: true,
      lastUpdated: new Date(cache.get(cacheKey)!.timestamp).toISOString(),
    });
  }

  try {
    const data = await queryRealtime(propertyKey);
    setCache(cacheKey, data);

    return NextResponse.json({
      success: true,
      data,
      cached: false,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    // Return graceful fallback so frontend doesn't crash
    return NextResponse.json({
      success: false,
      error: `GA4 Realtime API error for ${PROPERTIES[propertyKey].label}: ${message}`,
      data: null,
      action: 'Ensure GA4 credentials are configured. See GA4_SETUP.md for details.',
    }, { status: 500 });
  }
}
