import { differenceInMonths, parseISO, startOfDay } from "date-fns";
import { EmploymentEntry } from "@/types/childminder";

export interface EmploymentCoverage {
  totalMonths: number;
  coveredMonths: number;
  percentageCovered: number;
  hasGaps: boolean;
  gaps: Array<{ start: Date; end: Date; months: number }>;
  isComplete: boolean;
}

export const calculateEmploymentCoverage = (
  employmentHistory: EmploymentEntry[]
): EmploymentCoverage => {
  const requiredMonths = 60; // 5 years
  const today = startOfDay(new Date());
  const fiveYearsAgo = new Date(today);
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  // Sort employment by start date
  const sortedEmployment = [...employmentHistory]
    .filter((entry) => entry.startDate && entry.endDate)
    .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime());

  if (sortedEmployment.length === 0) {
    return {
      totalMonths: requiredMonths,
      coveredMonths: 0,
      percentageCovered: 0,
      hasGaps: true,
      gaps: [{ start: fiveYearsAgo, end: today, months: requiredMonths }],
      isComplete: false,
    };
  }

  // Create timeline of covered periods
  const timeline: Array<{ start: Date; end: Date }> = sortedEmployment.map((entry) => ({
    start: parseISO(entry.startDate),
    end: parseISO(entry.endDate),
  }));

  // Merge overlapping periods
  const mergedTimeline: Array<{ start: Date; end: Date }> = [];
  for (const period of timeline) {
    if (mergedTimeline.length === 0) {
      mergedTimeline.push(period);
      continue;
    }

    const last = mergedTimeline[mergedTimeline.length - 1];
    if (period.start <= last.end) {
      // Overlapping or adjacent - merge
      last.end = period.end > last.end ? period.end : last.end;
    } else {
      mergedTimeline.push(period);
    }
  }

  // Calculate covered months within 5-year period
  let coveredMonths = 0;
  for (const period of mergedTimeline) {
    const effectiveStart = period.start < fiveYearsAgo ? fiveYearsAgo : period.start;
    const effectiveEnd = period.end > today ? today : period.end;

    if (effectiveEnd > effectiveStart) {
      coveredMonths += differenceInMonths(effectiveEnd, effectiveStart);
    }
  }

  // Find gaps
  const gaps: Array<{ start: Date; end: Date; months: number }> = [];

  // Check gap before first employment
  if (mergedTimeline[0].start > fiveYearsAgo) {
    const gapEnd = mergedTimeline[0].start < today ? mergedTimeline[0].start : today;
    gaps.push({
      start: fiveYearsAgo,
      end: gapEnd,
      months: differenceInMonths(gapEnd, fiveYearsAgo),
    });
  }

  // Check gaps between employment periods
  for (let i = 0; i < mergedTimeline.length - 1; i++) {
    const currentEnd = mergedTimeline[i].end;
    const nextStart = mergedTimeline[i + 1].start;

    if (nextStart > currentEnd) {
      const gapStart = currentEnd > fiveYearsAgo ? currentEnd : fiveYearsAgo;
      const gapEnd = nextStart < today ? nextStart : today;

      if (gapEnd > gapStart) {
        gaps.push({
          start: gapStart,
          end: gapEnd,
          months: differenceInMonths(gapEnd, gapStart),
        });
      }
    }
  }

  // Check gap after last employment
  const lastEnd = mergedTimeline[mergedTimeline.length - 1].end;
  if (lastEnd < today) {
    gaps.push({
      start: lastEnd,
      end: today,
      months: differenceInMonths(today, lastEnd),
    });
  }

  const percentageCovered = Math.round((coveredMonths / requiredMonths) * 100);
  const hasGaps = gaps.length > 0 && gaps.some((gap) => gap.months > 0);

  return {
    totalMonths: requiredMonths,
    coveredMonths,
    percentageCovered,
    hasGaps,
    gaps,
    isComplete: percentageCovered >= 100,
  };
};
