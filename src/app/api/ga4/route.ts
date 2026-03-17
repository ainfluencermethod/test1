import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

// Two GA4 properties on different accounts
const PROPERTIES = {
  aiuniversa: { id: '527926974', credFile: 'ga4-desktop-credentials.json', label: 'AI Universa' },
  aib: { id: '503840321', credFile: 'ga4-aib-credentials.json', label: 'AI Influencer Blueprint' },
};

// Build OAuth2 client from a Desktop app credentials JSON + stored refresh token
function getAuthForProperty(property: 'aiuniversa' | 'aib') {
  const config = PROPERTIES[property];
  
  // Try stored ADC files with refresh tokens
  const adcPath = property === 'aib' 
    ? join(process.cwd(), 'ga4-aib-adc.json')
    : join(process.env.HOME || '', '.config/gcloud/application_default_credentials.json');
  
  try {
    const adc = JSON.parse(readFileSync(adcPath, 'utf-8'));
    const oauth2 = new google.auth.OAuth2(adc.client_id, adc.client_secret);
    oauth2.setCredentials({ refresh_token: adc.refresh_token });
    return oauth2;
  } catch {
    // Fallback to Application Default Credentials
    return new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    });
  }
}

interface DailyEntry {
  date: string;
  activeUsers: number;
  sessions: number;
  pageViews: number;
  newUsers: number;
  bounceRate: number;
}

interface TrafficSourceEntry {
  channel: string;
  sessions: number;
  activeUsers: number;
}

async function queryProperty(property: 'aiuniversa' | 'aib') {
  const config = PROPERTIES[property];
  const auth = getAuthForProperty(property);
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

  // Daily metrics
  const dailyReport = await analyticsData.properties.runReport({
    property: `properties/${config.id}`,
    requestBody: {
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'newUsers' },
        { name: 'bounceRate' },
      ],
      dimensions: [{ name: 'date' }],
    },
  });

  const dailyData: DailyEntry[] = (dailyReport.data.rows || []).map((row) => ({
    date: row.dimensionValues?.[0]?.value || '',
    activeUsers: parseInt(row.metricValues?.[0]?.value || '0', 10),
    sessions: parseInt(row.metricValues?.[1]?.value || '0', 10),
    pageViews: parseInt(row.metricValues?.[2]?.value || '0', 10),
    newUsers: parseInt(row.metricValues?.[3]?.value || '0', 10),
    bounceRate: parseFloat(row.metricValues?.[4]?.value || '0'),
  })).sort((a, b) => a.date.localeCompare(b.date));

  const totals = dailyData.reduce(
    (acc, day) => ({
      activeUsers: acc.activeUsers + day.activeUsers,
      sessions: acc.sessions + day.sessions,
      pageViews: acc.pageViews + day.pageViews,
      newUsers: acc.newUsers + day.newUsers,
    }),
    { activeUsers: 0, sessions: 0, pageViews: 0, newUsers: 0 }
  );
  const avgBounceRate = dailyData.length > 0
    ? dailyData.reduce((sum, d) => sum + d.bounceRate, 0) / dailyData.length
    : 0;

  // Traffic sources
  let trafficSources: TrafficSourceEntry[] = [];
  try {
    const sourceReport = await analyticsData.properties.runReport({
      property: `properties/${config.id}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
      },
    });
    if (sourceReport.data.rows) {
      trafficSources = sourceReport.data.rows.map((row) => ({
        channel: row.dimensionValues?.[0]?.value || 'Unknown',
        sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
        activeUsers: parseInt(row.metricValues?.[1]?.value || '0', 10),
      })).sort((a, b) => b.sessions - a.sessions);
    }
  } catch { /* continue */ }

  // UTM Attribution (source + medium, campaign optional)
  let utmAttribution: Array<{ source: string; medium: string; campaign: string; sessions: number; users: number }> = [];
  try {
    const utmReport = await analyticsData.properties.runReport({
      property: `properties/${config.id}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      },
    });
    if (utmReport.data.rows) {
      utmAttribution = utmReport.data.rows.map((row) => ({
        source: row.dimensionValues?.[0]?.value || '(direct)',
        medium: row.dimensionValues?.[1]?.value || '(none)',
        campaign: '(not set)',
        sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
        users: parseInt(row.metricValues?.[1]?.value || '0', 10),
      })).sort((a, b) => b.sessions - a.sessions);
    }
  } catch { /* continue */ }

  return {
    label: config.label,
    propertyId: config.id,
    totals: { ...totals, avgBounceRate: Math.round(avgBounceRate * 100) / 100 },
    daily: dailyData,
    trafficSources,
    utmAttribution,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const property = (searchParams.get('property') || 'aiuniversa') as 'aiuniversa' | 'aib';

  if (!PROPERTIES[property]) {
    return NextResponse.json({ success: false, error: `Unknown property: ${property}. Use ?property=aiuniversa or ?property=aib` });
  }

  try {
    const data = await queryProperty(property);
    return NextResponse.json({ success: true, data, lastUpdated: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: `GA4 API error for ${PROPERTIES[property].label}: ${message}`,
      property,
      action: 'Re-run gcloud auth for this property account.',
      data: null,
    });
  }
}
