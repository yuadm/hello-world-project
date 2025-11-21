import { AddressHistory } from "@/types/childminder";

export interface AddressPeriod {
  start: Date;
  end: Date;
  address?: string;
}

export interface AddressCoverage {
  isCovered: boolean;
  gaps: Array<{ start: Date; end: Date }>;
  totalDaysCovered: number;
  requiredDays: number;
  coveragePercentage: number;
}

/**
 * Calculate if address history covers the last 5 years
 * Merges overlapping periods and detects gaps
 */
export function calculateAddressHistoryCoverage(
  homeAddress: { moveIn: string },
  addressHistory: AddressHistory[]
): AddressCoverage {
  const today = new Date();
  const fiveYearsAgo = new Date(today);
  fiveYearsAgo.setFullYear(today.getFullYear() - 5);

  // Collect all address periods
  const periods: AddressPeriod[] = [];

  // Add current address
  if (homeAddress.moveIn) {
    const moveInDate = new Date(homeAddress.moveIn);
    periods.push({
      start: moveInDate,
      end: today,
      address: "Current address",
    });
  }

  // Add previous addresses
  addressHistory.forEach((entry, index) => {
    if (entry.moveIn && entry.moveOut) {
      const moveInDate = new Date(entry.moveIn);
      const moveOutDate = new Date(entry.moveOut);
      
      // Only include valid date ranges
      if (moveInDate < moveOutDate) {
        periods.push({
          start: moveInDate,
          end: moveOutDate,
          address: `Address ${index + 1}`,
        });
      }
    }
  });

  // Sort periods by start date
  periods.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Merge overlapping periods
  const mergedPeriods = mergePeriods(periods);

  // Calculate coverage from 5 years ago
  const relevantPeriods = mergedPeriods.filter(
    (period) => period.end >= fiveYearsAgo
  );

  // Adjust periods to start from 5 years ago if they extend before it
  const adjustedPeriods = relevantPeriods.map((period) => ({
    ...period,
    start: period.start < fiveYearsAgo ? fiveYearsAgo : period.start,
  }));

  // Calculate total days covered
  let totalDaysCovered = 0;
  adjustedPeriods.forEach((period) => {
    const days = Math.floor(
      (period.end.getTime() - period.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    totalDaysCovered += days;
  });

  // Calculate gaps
  const gaps = findGaps(adjustedPeriods, fiveYearsAgo, today);

  // Calculate required days (5 years)
  const requiredDays = Math.floor(
    (today.getTime() - fiveYearsAgo.getTime()) / (1000 * 60 * 60 * 24)
  );

  const coveragePercentage = (totalDaysCovered / requiredDays) * 100;
  const isCovered = gaps.length === 0 && coveragePercentage >= 99; // Allow 1% tolerance for rounding

  return {
    isCovered,
    gaps,
    totalDaysCovered,
    requiredDays,
    coveragePercentage,
  };
}

/**
 * Merge overlapping or consecutive periods
 */
function mergePeriods(periods: AddressPeriod[]): AddressPeriod[] {
  if (periods.length === 0) return [];

  const merged: AddressPeriod[] = [];
  let current = { ...periods[0] };

  for (let i = 1; i < periods.length; i++) {
    const next = periods[i];

    // Check if periods overlap or are consecutive (within 1 day)
    if (next.start.getTime() <= current.end.getTime() + 86400000) {
      // Merge: extend current period
      if (next.end > current.end) {
        current.end = next.end;
      }
    } else {
      // No overlap: save current and start new period
      merged.push(current);
      current = { ...next };
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Find gaps in address coverage
 */
function findGaps(
  periods: AddressPeriod[],
  startDate: Date,
  endDate: Date
): Array<{ start: Date; end: Date }> {
  const gaps: Array<{ start: Date; end: Date }> = [];

  if (periods.length === 0) {
    // No periods at all - entire range is a gap
    gaps.push({ start: startDate, end: endDate });
    return gaps;
  }

  // Check gap before first period
  if (periods[0].start > startDate) {
    gaps.push({
      start: startDate,
      end: periods[0].start,
    });
  }

  // Check gaps between periods
  for (let i = 0; i < periods.length - 1; i++) {
    const currentEnd = periods[i].end;
    const nextStart = periods[i + 1].start;

    // Gap exists if there's more than 1 day between periods
    if (nextStart.getTime() - currentEnd.getTime() > 86400000) {
      gaps.push({
        start: currentEnd,
        end: nextStart,
      });
    }
  }

  // Check gap after last period
  const lastPeriod = periods[periods.length - 1];
  if (lastPeriod.end < endDate) {
    gaps.push({
      start: lastPeriod.end,
      end: endDate,
    });
  }

  return gaps;
}

/**
 * Format date range for display
 */
export function formatDateRange(start: Date, end: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  return `${start.toLocaleDateString("en-GB", options)} to ${end.toLocaleDateString("en-GB", options)}`;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
