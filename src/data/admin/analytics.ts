/**
 * F.Horn Self Storage — Analytics tracking and summaries (MariaDB).
 */

import { randomUUID } from 'node:crypto';
import { query } from './db.js';
import type { PageView } from './types.js';

/** Record a page view. */
export async function trackPageView(data: {
  path: string;
  referrer: string;
  userAgent: string;
}): Promise<PageView> {
  const id = randomUUID();
  const now = new Date();

  await query(
    `INSERT INTO page_views (id, path, referrer, user_agent, timestamp)
     VALUES (?, ?, ?, ?, ?)`,
    [id, data.path, data.referrer, data.userAgent, now],
  );

  return {
    id,
    path: data.path,
    referrer: data.referrer,
    userAgent: data.userAgent,
    timestamp: now.toISOString(),
  };
}

export interface AnalyticsSummary {
  totalViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  topPages: { path: string; count: number }[];
  viewsByDay: { date: string; count: number }[];
}

/** Build an analytics summary using SQL aggregations. */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  // Total views
  const [totalRows] = await query<any[]>(
    'SELECT COUNT(*) AS cnt FROM page_views',
  );
  const totalViews = totalRows[0].cnt;

  // Views today
  const [todayRows] = await query<any[]>(
    'SELECT COUNT(*) AS cnt FROM page_views WHERE DATE(timestamp) = CURDATE()',
  );
  const viewsToday = todayRows[0].cnt;

  // Views this week (last 7 days)
  const [weekRows] = await query<any[]>(
    'SELECT COUNT(*) AS cnt FROM page_views WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)',
  );
  const viewsThisWeek = weekRows[0].cnt;

  // Views this month (last 30 days)
  const [monthRows] = await query<any[]>(
    'SELECT COUNT(*) AS cnt FROM page_views WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
  );
  const viewsThisMonth = monthRows[0].cnt;

  // Top 10 pages
  const [topRows] = await query<any[]>(
    `SELECT path, COUNT(*) AS cnt
     FROM page_views
     GROUP BY path
     ORDER BY cnt DESC
     LIMIT 10`,
  );
  const topPages = topRows.map((row: any) => ({
    path: row.path as string,
    count: row.cnt as number,
  }));

  // Views by day (last 30 days)
  const [dayRows] = await query<any[]>(
    `SELECT DATE(timestamp) AS day, COUNT(*) AS cnt
     FROM page_views
     WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
     GROUP BY DATE(timestamp)
     ORDER BY day`,
  );

  // Build the full 30-day array, filling missing days with 0
  const dayCounts = new Map<string, number>();
  for (const row of dayRows) {
    const dateStr = row.day instanceof Date
      ? row.day.toISOString().slice(0, 10)
      : String(row.day).slice(0, 10);
    dayCounts.set(dateStr, row.cnt as number);
  }

  const viewsByDay: { date: string; count: number }[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 29);

  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    viewsByDay.push({ date: key, count: dayCounts.get(key) ?? 0 });
  }

  return {
    totalViews,
    viewsToday,
    viewsThisWeek,
    viewsThisMonth,
    topPages,
    viewsByDay,
  };
}
