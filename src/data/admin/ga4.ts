/**
 * F.Horn Self Storage — Google Analytics 4 Data API integration.
 *
 * Uses a service account to fetch analytics data from GA4.
 * Credentials via environment variables: GA_CLIENT_EMAIL, GA_PRIVATE_KEY, GA_PROPERTY_ID.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let client: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
  if (!client) {
    // Try keyFile first (ga-credentials.json in project root)
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const keyFile = path.resolve(__dirname, '..', '..', '..', 'ga-credentials.json');

    try {
      client = new BetaAnalyticsDataClient({ keyFilename: keyFile });
    } catch {
      throw new Error('ga-credentials.json not found in project root');
    }
  }
  return client;
}

function getPropertyId(): string {
  return import.meta.env?.GA_PROPERTY_ID || process.env.GA_PROPERTY_ID || '';
}

export interface GA4Summary {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  activeUsers: number;
  topPages: { path: string; count: number }[];
  viewsByDay: { date: string; count: number }[];
}

/** Fetch analytics summary from GA4 Data API. */
export async function getGA4Summary(): Promise<GA4Summary> {
  const analyticsClient = getClient();
  const propertyId = getPropertyId();

  // Views by day (last 30 days)
  const [dailyResponse] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ dimension: { dimensionName: 'date', orderType: 'ALPHANUMERIC' } }],
  });

  const viewsByDay: { date: string; count: number }[] = [];
  let totalViews = 0;

  // Build a map of dates with data
  const dayData = new Map<string, number>();
  for (const row of dailyResponse.rows ?? []) {
    const rawDate = row.dimensionValues?.[0]?.value ?? '';
    const count = parseInt(row.metricValues?.[0]?.value ?? '0', 10);
    const formatted = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
    dayData.set(formatted, count);
    totalViews += count;
  }

  // Fill all 30 days (including zeros)
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    viewsByDay.push({ date: key, count: dayData.get(key) ?? 0 });
  }

  // Today, week, month counts
  const todayStr = today.toISOString().slice(0, 10);
  const viewsToday = dayData.get(todayStr) ?? 0;

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  let viewsThisWeek = 0;
  let viewsThisMonth = 0;
  for (const [date, count] of dayData) {
    if (date >= weekAgo.toISOString().slice(0, 10)) viewsThisWeek += count;
    viewsThisMonth += count;
  }

  // Top pages
  const [pagesResponse] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10,
  });

  const topPages = (pagesResponse.rows ?? []).map((row) => ({
    path: row.dimensionValues?.[0]?.value ?? '',
    count: parseInt(row.metricValues?.[0]?.value ?? '0', 10),
  }));

  // Active users (last 30 days)
  const [usersResponse] = await analyticsClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }],
  });

  const activeUsers = parseInt(usersResponse.rows?.[0]?.metricValues?.[0]?.value ?? '0', 10);

  return {
    totalViews,
    viewsToday,
    viewsThisWeek,
    viewsThisMonth,
    activeUsers,
    topPages,
    viewsByDay,
  };
}
