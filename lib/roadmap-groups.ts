/**
 * Nhóm 290 phiên của lộ trình thành các khối hiển thị được trên `/roadmap`.
 *
 * Vì sao cần module riêng (APP-P1-01): ba phiên Finale có `week: null` theo đúng
 * mô hình dữ liệu — chúng nằm sau tuần 41 nên không thuộc tuần nào. Trước đây UI
 * chỉ duyệt 41 tuần và lọc `session.week === week.week`, nên ba phiên đó không
 * bao giờ hiện ra, trong khi mẫu số tiến độ vẫn là 290. Người học chỉ đạt tối đa
 * 287/290.
 *
 * Cách sửa giữ nguyên `week: null` (không bịa một tuần giả) và thay vào đó tách
 * hàm nhóm phiên ra đây để:
 * - UI dùng đúng một nguồn nhóm duy nhất cho cả hiển thị lẫn bộ đếm;
 * - có cổng kiểm tra chạy lúc import, làm hỏng bản dựng nếu roadmap bỏ sót phiên.
 */

import type { CurriculumSession, WeekPlan } from "../content/curriculum";
import { CURRICULUM_SESSIONS, WEEKLY_CURRICULUM } from "../content/curriculum";

export type RoadmapGroup =
  | { kind: "week"; key: string; week: WeekPlan; sessions: readonly CurriculumSession[] }
  | { kind: "finale"; key: string; week: null; sessions: readonly CurriculumSession[] };

export const FINALE_GROUP_KEY = "finale";

/** Nhóm phiên theo tuần, và gom mọi phiên không thuộc tuần nào vào khối Finale. */
export function buildRoadmapGroups(
  weeks: readonly WeekPlan[],
  sessions: readonly CurriculumSession[],
): RoadmapGroup[] {
  const byWeek = new Map<number, CurriculumSession[]>();
  const unscheduled: CurriculumSession[] = [];

  for (const session of sessions) {
    if (session.week === null) {
      unscheduled.push(session);
      continue;
    }
    const bucket = byWeek.get(session.week);
    if (bucket) bucket.push(session);
    else byWeek.set(session.week, [session]);
  }

  const groups: RoadmapGroup[] = weeks.map((week) => ({
    kind: "week",
    key: `week-${week.week}`,
    week,
    sessions: byWeek.get(week.week) ?? [],
  }));

  if (unscheduled.length > 0) {
    groups.push({ kind: "finale", key: FINALE_GROUP_KEY, week: null, sessions: unscheduled });
  }
  return groups;
}

export interface RoadmapGroupsSummary {
  groups: number;
  weekGroups: number;
  finaleSessions: number;
  sessionsCovered: number;
  sessionsTotal: number;
}

/**
 * Cổng bất biến: mọi phiên phải xuất hiện đúng một lần trong đúng một khối.
 * Thiếu hoặc trùng đều làm hỏng bản dựng thay vì âm thầm chặn người học ở 99%.
 */
export function validateRoadmapGroups(
  weeks: readonly WeekPlan[] = WEEKLY_CURRICULUM,
  sessions: readonly CurriculumSession[] = CURRICULUM_SESSIONS,
): RoadmapGroupsSummary {
  const groups = buildRoadmapGroups(weeks, sessions);
  const seen = new Set<string>();

  for (const group of groups) {
    for (const session of group.sessions) {
      if (seen.has(session.id)) {
        throw new Error(`Phiên ${session.id} xuất hiện ở nhiều hơn một khối roadmap.`);
      }
      seen.add(session.id);
    }
  }

  if (seen.size !== sessions.length) {
    const missing = sessions.filter((session) => !seen.has(session.id)).map((session) => session.id);
    throw new Error(
      `Roadmap chỉ hiển thị ${seen.size}/${sessions.length} phiên. Thiếu: ${missing.slice(0, 5).join(", ")}`,
    );
  }

  return {
    groups: groups.length,
    weekGroups: groups.filter((group) => group.kind === "week").length,
    finaleSessions: groups.find((group) => group.kind === "finale")?.sessions.length ?? 0,
    sessionsCovered: seen.size,
    sessionsTotal: sessions.length,
  };
}

// Cổng lúc import: roadmap bỏ sót phiên sẽ làm hỏng bản dựng, không im lặng trôi ra sản phẩm.
export const ROADMAP_GROUPS_VALIDATION = validateRoadmapGroups();
