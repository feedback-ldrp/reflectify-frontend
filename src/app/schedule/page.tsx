/**
 * @file src/app/schedule/page.tsx
 * @description Public schedule page with a proper timetable grid view.
 * Two views: Class Centric (cascading filters → timetable grid) and Faculty Centric (select faculty → grid).
 * Grid: 6 slots × 6 days (Mon–Sat) with break rows after slots 2 and 4.
 */

"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  Calendar,
  GraduationCap,
  Layers,
  Clock,
  Coffee,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import subjectAllocationService from "@/services/subjectAllocationService";
import facultyService from "@/services/facultyService";
import timetableService, { TimetableEntry } from "@/services/timetableService";
import { SubjectAllocation } from "@/interfaces/subjectAllocation";
import { useAcademicStructure } from "@/hooks/useAcademicStructure";
import { PageLoader } from "@/components/ui/LoadingSpinner";

type ViewType = "faculty" | "class";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const DAY_SHORT = ["MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const SLOTS = [1, 2, 3, 4, 5, 6] as const;
const SLOT_TIMINGS: Record<number, string> = {
  1: "9:00 – 9:55",
  2: "9:55 – 10:50",
  3: "11:00 – 11:55",
  4: "11:55 – 12:50",
  5: "1:20 – 2:15",
  6: "2:15 – 3:10",
};

// ─── Types for Timetable Grid ────────────────────────────────────────────────

interface CellEntry {
  subject: string;
  faculty: string;
  type: string;
  batch: string;
  isLabContinuation?: boolean;
  // Tooltip enrichment fields
  subjectFullName?: string;
  facultyFullName?: string;
  day?: string;
  slotTime?: string;
  divisionName?: string;
  semester?: string;
}

type TimetableGrid = Record<string, Record<number, CellEntry[]>>;

// ─── Allocation Lookup for enriching timetable entries ───────────────────────

interface AllocationLookup {
  subjectNames: Map<string, string>; // abbreviation → full name
  facultyNames: Map<string, string>; // abbreviation → full name
}

function buildAllocationLookup(
  allocations: SubjectAllocation[],
): AllocationLookup {
  const subjectNames = new Map<string, string>();
  const facultyNames = new Map<string, string>();
  for (const alloc of allocations) {
    if (alloc.subject?.abbreviation && alloc.subject?.name) {
      subjectNames.set(
        alloc.subject.abbreviation.toUpperCase(),
        alloc.subject.name,
      );
    }
    if (alloc.faculty?.abbreviation && alloc.faculty?.name) {
      facultyNames.set(
        alloc.faculty.abbreviation.toUpperCase(),
        alloc.faculty.name,
      );
    }
  }
  return { subjectNames, facultyNames };
}

function enrichEntry(
  entry: TimetableEntry,
  lookup: AllocationLookup | null,
  day: string,
  slotStr: string,
  divisionName?: string,
  semester?: string,
): Omit<CellEntry, "isLabContinuation"> {
  const slotNums = slotStr.includes("-") ? slotStr : slotStr;
  const timings = slotStr
    .split("-")
    .map((s) => SLOT_TIMINGS[parseInt(s)])
    .filter(Boolean)
    .join(" → ");
  return {
    subject: entry.Subject,
    faculty: entry.Faculty,
    type: entry.Type,
    batch: entry.Batch,
    subjectFullName: lookup?.subjectNames.get(entry.Subject.toUpperCase()),
    facultyFullName: lookup?.facultyNames.get(entry.Faculty.toUpperCase()),
    day,
    slotTime: timings || `Slot ${slotNums}`,
    divisionName,
    semester,
  };
}

// ─── Helper: Build grid map from timetable entries ──────────────────────────

function buildGridFromEntries(
  entries: TimetableEntry[],
  allocations?: SubjectAllocation[],
  divisionName?: string,
  semester?: string,
): TimetableGrid {
  const grid: TimetableGrid = {};
  for (const day of DAYS) {
    grid[day] = {};
    for (const slot of SLOTS) {
      grid[day][slot] = [];
    }
  }

  const lookup = allocations ? buildAllocationLookup(allocations) : null;

  for (const entry of entries) {
    const day = entry.Day;
    if (!grid[day]) continue;

    const slotStr = String(entry.Time_Slot);

    if (slotStr.includes("-")) {
      // Lab: spans 2 slots, e.g., "3-4"
      const [startStr, endStr] = slotStr.split("-");
      const start = parseInt(startStr);
      const end = parseInt(endStr);
      if (!isNaN(start) && grid[day][start]) {
        grid[day][start].push(
          enrichEntry(entry, lookup, day, slotStr, divisionName, semester),
        );
      }
      if (!isNaN(end) && grid[day][end]) {
        grid[day][end].push({
          ...enrichEntry(entry, lookup, day, slotStr, divisionName, semester),
          isLabContinuation: true,
        });
      }
    } else {
      const slot = parseInt(slotStr);
      if (!isNaN(slot) && grid[day]?.[slot]) {
        grid[day][slot].push(
          enrichEntry(entry, lookup, day, slotStr, divisionName, semester),
        );
      }
    }
  }

  return grid;
}

// ─── Build grid from SubjectAllocation data (fallback – no slot info) ───────

function buildFallbackGridFromAllocations(
  allocations: SubjectAllocation[],
): null {
  // When no timetable data exists, return null to show a flat table instead
  return null;
}

// ─── Helper: Build grid from allocations for Faculty View ───────────────────
// Faculty view doesn't have division-level timetable, so we build per-division grids

function buildFacultyGrid(
  allocations: SubjectAllocation[],
  divisionTimetables: Map<string, TimetableEntry[]>,
  facultyAbbr: string,
): TimetableGrid {
  const grid: TimetableGrid = {};
  for (const day of DAYS) {
    grid[day] = {};
    for (const slot of SLOTS) {
      grid[day][slot] = [];
    }
  }

  const lookup = buildAllocationLookup(allocations);

  // Build division name + semester lookup from allocations
  const divIdToName = new Map<string, string>();
  const divIdToSemester = new Map<string, string>();
  for (const alloc of allocations) {
    if (alloc.divisionId && alloc.division?.divisionName) {
      divIdToName.set(alloc.divisionId.toString(), alloc.division.divisionName);
    }
    if (alloc.divisionId && alloc.semester?.semesterNumber) {
      divIdToSemester.set(
        alloc.divisionId.toString(),
        `Semester ${alloc.semester.semesterNumber}`,
      );
    }
  }

  // Go through all division timetables and find entries for this faculty
  for (const [divId, entries] of divisionTimetables) {
    const divName = divIdToName.get(divId);
    const semLabel = divIdToSemester.get(divId);
    for (const entry of entries) {
      if (entry.Faculty !== facultyAbbr) continue;
      const day = entry.Day;
      if (!grid[day]) continue;

      const slotStr = String(entry.Time_Slot);
      if (slotStr.includes("-")) {
        const [startStr, endStr] = slotStr.split("-");
        const start = parseInt(startStr);
        const end = parseInt(endStr);
        if (!isNaN(start) && grid[day][start]) {
          grid[day][start].push(
            enrichEntry(entry, lookup, day, slotStr, divName, semLabel),
          );
        }
        if (!isNaN(end) && grid[day][end]) {
          grid[day][end].push({
            ...enrichEntry(entry, lookup, day, slotStr, divName, semLabel),
            isLabContinuation: true,
          });
        }
      } else {
        const slot = parseInt(slotStr);
        if (!isNaN(slot) && grid[day]?.[slot]) {
          grid[day][slot].push(
            enrichEntry(entry, lookup, day, slotStr, divName, semLabel),
          );
        }
      }
    }
  }

  return grid;
}

// ─── Cell Component ─────────────────────────────────────────────────────────

const CellTooltip: React.FC<{
  entry: CellEntry;
  showFaculty?: boolean;
  children: React.ReactNode;
}> = ({ entry, showFaculty = true, children }) => {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [adjust, setAdjust] = useState(0);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.top,
      left: rect.left + rect.width / 2,
    });
    setAdjust(0);
  }, []);

  useEffect(() => {
    if (show) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      return () => window.removeEventListener("scroll", updatePosition, true);
    }
  }, [show, updatePosition]);

  // Adjust horizontal offset if tooltip goes off-screen
  useEffect(() => {
    if (!show || !tooltipRef.current || !pos || adjust !== 0) return;
    const ttRect = tooltipRef.current.getBoundingClientRect();
    const overflowRight = ttRect.right - window.innerWidth + 8;
    const overflowLeft = 8 - ttRect.left;
    if (overflowRight > 0) {
      setAdjust(-overflowRight);
    } else if (overflowLeft > 0) {
      setAdjust(overflowLeft);
    }
  }, [show, pos, adjust]);

  const tooltipLines: { label: string; value: string }[] = [];
  tooltipLines.push({
    label: "Subject",
    value: entry.subjectFullName
      ? `${entry.subjectFullName} (${entry.subject})`
      : entry.subject,
  });
  if (showFaculty) {
    tooltipLines.push({
      label: "Faculty",
      value: entry.facultyFullName
        ? `${entry.facultyFullName} (${entry.faculty})`
        : entry.faculty,
    });
  }
  tooltipLines.push({ label: "Type", value: entry.type });
  if (entry.batch && entry.batch !== "-") {
    tooltipLines.push({ label: "Batch", value: entry.batch });
  }
  if (entry.semester) {
    tooltipLines.push({ label: "Semester", value: entry.semester });
  }
  if (entry.divisionName) {
    tooltipLines.push({ label: "Division", value: entry.divisionName });
  }
  if (entry.day) {
    tooltipLines.push({ label: "Day", value: entry.day });
  }
  if (entry.slotTime) {
    tooltipLines.push({ label: "Time", value: entry.slotTime });
  }

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show &&
        pos &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed z-[9999] pointer-events-none"
            style={{
              top: pos.top,
              left: pos.left + adjust,
              transform: "translate(-50%, -100%)",
              marginTop: "-8px",
            }}
          >
            <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow-xl px-3.5 py-2.5 text-[11px] whitespace-nowrap">
              {tooltipLines.map((line, i) => (
                <div key={i} className="flex gap-2 py-[1px]">
                  <span className="font-semibold text-white/60 dark:text-gray-900/60 min-w-[56px]">
                    {line.label}:
                  </span>
                  <span className="font-medium">{line.value}</span>
                </div>
              ))}
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-[5px] border-t-gray-900 dark:border-t-gray-100 border-x-transparent border-b-transparent" />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

const TimetableCell: React.FC<{
  entries: CellEntry[];
  showFaculty?: boolean;
}> = ({ entries, showFaculty = true }) => {
  if (entries.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-light-secondary dark:text-dark-secondary">
        <span className="text-xs">—</span>
      </div>
    );
  }

  // Deduplicate: if an entry appears as both normal and continuation, keep the normal one
  const seen = new Set<string>();
  const unique = entries.filter((e) => {
    const key = `${e.subject}-${e.batch}-${e.faculty}-${e.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <div className="flex flex-col gap-1 h-full justify-center">
      {unique.map((entry, idx) => {
        const isLab = entry.type === "Lab";
        const isTutorial = entry.type === "Tutorial";
        const isLibrary = entry.type === "Library";
        const isProject = entry.type === "Project";
        const batchLabel =
          entry.batch && entry.batch !== "-" ? entry.batch : null;

        const typeLabel = isLab
          ? "Lab"
          : isTutorial
            ? "Tutorial"
            : isLibrary
              ? "Library"
              : isProject
                ? "Project"
                : null;

        return (
          <CellTooltip key={idx} entry={entry} showFaculty={showFaculty}>
            <div
              className={cn(
                "text-[11px] sm:text-xs leading-tight rounded-md px-1.5 py-1 text-center font-medium transition-colors cursor-default",
                isLab
                  ? "bg-primary-lighter/60 dark:bg-primary-bgDark/40 text-primary-dark dark:text-primary-light border border-primary-light/30 dark:border-primary-dark/30"
                  : isTutorial
                    ? "bg-positive-lighter dark:bg-positive-darker/30 text-positive-main dark:text-positive-textDark border border-positive-light/50 dark:border-positive-dark/30"
                    : isLibrary
                      ? "bg-highlight1-lighter dark:bg-highlight1-darker/30 text-highlight1-main dark:text-highlight1-textDark border border-highlight1-light/50 dark:border-highlight1-dark/30"
                      : isProject
                        ? "bg-warning-lighter dark:bg-warning-darker/30 text-warning-main dark:text-warning-textDark border border-warning-light/50 dark:border-warning-dark/30"
                        : "bg-highlight2-light/50 dark:bg-highlight2-dark/15 text-highlight2-dark dark:text-highlight2-light",
              )}
            >
              <div className="font-semibold">
                {batchLabel && (
                  <span className="text-[10px] opacity-70">{batchLabel} </span>
                )}
                {entry.subject}
              </div>
              {showFaculty && (
                <div className="text-[10px] opacity-70">({entry.faculty})</div>
              )}
              {typeLabel && (
                <div className="text-[9px] uppercase tracking-wide opacity-60 font-normal">
                  {typeLabel}
                </div>
              )}
            </div>
          </CellTooltip>
        );
      })}
    </div>
  );
};

// ─── Break Row Component ────────────────────────────────────────────────────

const BreakRow: React.FC<{ label: string; time: string }> = ({
  label,
  time,
}) => (
  <tr>
    <td
      colSpan={7}
      className="py-2 text-center border-y-2 border-dashed border-warning-main/30 dark:border-warning-dark/30 bg-warning-light/20 dark:bg-warning-dark/10"
    >
      <div className="flex items-center justify-center gap-2 text-xs text-warning-dark dark:text-warning-light font-medium">
        <Coffee className="w-3.5 h-3.5" />
        {label}
        <span className="font-normal opacity-70">({time})</span>
      </div>
    </td>
  </tr>
);

// ─── Timetable Grid Component ───────────────────────────────────────────────

// Slot pairs that can be merged (don't merge across breaks)
const MERGEABLE_SLOT_PAIRS = new Set(["1-2", "3-4", "5-6"]);

const TimetableGridView: React.FC<{
  grid: TimetableGrid;
  title: string;
  subtitle: string;
  showFaculty?: boolean;
}> = ({ grid, title, subtitle, showFaculty = true }) => {
  // Pre-compute which cells should be merged (rowSpan=2) and which should be skipped
  const mergedCells = useMemo(() => {
    const merged = new Map<string, boolean>(); // "day-slot" → true if this cell should rowSpan=2
    const skipped = new Map<string, boolean>(); // "day-slot" → true if this cell is covered by a rowSpan above

    for (const day of DAYS) {
      for (const slot of SLOTS) {
        const entries = grid[day]?.[slot] || [];
        const nextSlot = slot + 1;
        const pairKey = `${slot}-${nextSlot}`;

        if (!MERGEABLE_SLOT_PAIRS.has(pairKey)) continue;

        const nextEntries = grid[day]?.[nextSlot] || [];
        if (entries.length === 0 || nextEntries.length === 0) continue;

        // Check: all entries in current slot that are NOT continuations have a matching continuation in next slot
        const normalEntries = entries.filter((e) => !e.isLabContinuation);
        const continuationEntries = nextEntries.filter(
          (e) => e.isLabContinuation,
        );

        if (normalEntries.length === 0 || continuationEntries.length === 0)
          continue;

        // All normal entries in this slot must have a continuation match in next slot
        const allMatch = normalEntries.every((ne) =>
          continuationEntries.some(
            (ce) =>
              ce.subject === ne.subject &&
              ce.faculty === ne.faculty &&
              ce.batch === ne.batch,
          ),
        );

        // Also: next slot should not have any non-continuation entries (lectures at that slot)
        const nextHasOwnLectures = nextEntries.some(
          (e) => !e.isLabContinuation,
        );

        if (allMatch && !nextHasOwnLectures) {
          merged.set(`${day}-${slot}`, true);
          skipped.set(`${day}-${nextSlot}`, true);
        }
      }
    }

    return { merged, skipped };
  }, [grid]);

  return (
    <Card
      padding="none"
      className="overflow-hidden bg-light-background dark:bg-dark-muted-background border-light-secondary/50 dark:border-dark-secondary/50"
    >
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-primary-lighter/50 to-highlight2-light/30 dark:from-primary-bgDark/40 dark:to-highlight2-dark/10 border-b border-light-secondary/50 dark:border-dark-secondary/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-main/10 dark:bg-primary-main/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-main" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text">
              {title}
            </h3>
            <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-light-muted-background/80 dark:bg-dark-background/60">
              <th className="px-3 py-3 text-left font-semibold text-light-muted-text dark:text-dark-muted-text border-b border-r border-light-secondary/40 dark:border-dark-secondary/40 w-[100px]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Slot
                </div>
              </th>
              {DAYS.map((day, i) => (
                <th
                  key={day}
                  className="px-2 py-3 text-center font-semibold text-light-text dark:text-dark-text border-b border-r last:border-r-0 border-light-secondary/40 dark:border-dark-secondary/40"
                >
                  <div className="hidden sm:block">{day}</div>
                  <div className="sm:hidden">{DAY_SHORT[i]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot) => (
              <React.Fragment key={slot}>
                {/* Break after slot 2 */}
                {slot === 3 && (
                  <BreakRow label="Short Break" time="10:50 – 11:00 AM" />
                )}
                {/* Break after slot 4 */}
                {slot === 5 && (
                  <BreakRow label="Lunch Break" time="12:50 – 1:20 PM" />
                )}
                <tr
                  className={cn(
                    "border-b border-light-secondary/30 dark:border-dark-secondary/30 last:border-b-0",
                    slot % 2 === 0
                      ? "bg-light-muted-background/30 dark:bg-dark-background/20"
                      : "",
                  )}
                >
                  {/* Slot label */}
                  <td className="px-3 py-2 border-r border-light-secondary/40 dark:border-dark-secondary/40 align-middle">
                    <div className="text-center">
                      <div className="font-bold text-primary-main text-base">
                        {slot}
                      </div>
                      <div className="text-[10px] text-light-muted-text dark:text-dark-muted-text leading-tight mt-0.5">
                        {SLOT_TIMINGS[slot]}
                      </div>
                    </div>
                  </td>
                  {/* Day cells */}
                  {DAYS.map((day) => {
                    const cellKey = `${day}-${slot}`;

                    // Skip this cell — it's covered by rowSpan from the slot above
                    if (mergedCells.skipped.has(cellKey)) return null;

                    const isMerged = mergedCells.merged.has(cellKey);

                    return (
                      <td
                        key={day}
                        rowSpan={isMerged ? 2 : 1}
                        className={cn(
                          "px-1.5 py-2 border-r last:border-r-0 border-light-secondary/30 dark:border-dark-secondary/30 align-middle min-w-[100px]",
                          isMerged && "border-b-0",
                        )}
                      >
                        <TimetableCell
                          entries={grid[day]?.[slot] || []}
                          showFaculty={showFaculty}
                        />
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-light-secondary/40 dark:border-dark-secondary/40 flex flex-wrap gap-4 text-xs text-light-muted-text dark:text-dark-muted-text">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-highlight2-light/50 dark:bg-highlight2-dark/15 border border-highlight2-main/20" />
          Lecture
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary-lighter/60 dark:bg-primary-bgDark/40 border border-primary-light/30 dark:border-primary-dark/30" />
          Lab
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-positive-lighter dark:bg-positive-darker/30 border border-positive-light/50 dark:border-positive-dark/30" />
          Tutorial
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-highlight1-lighter dark:bg-highlight1-darker/30 border border-highlight1-light/50 dark:border-highlight1-dark/30" />
          Library
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning-lighter dark:bg-warning-darker/30 border border-warning-light/50 dark:border-warning-dark/30" />
          Project
        </div>
      </div>
    </Card>
  );
};

// ─── Fallback List View (when no timetable grid data available) ─────────────

const FallbackListView: React.FC<{
  allocations: SubjectAllocation[];
  title: string;
  subtitle: string;
  showFaculty?: boolean;
}> = ({ allocations, title, subtitle, showFaculty = true }) => (
  <Card
    padding="none"
    className="overflow-hidden bg-light-background dark:bg-dark-muted-background border-light-secondary/50 dark:border-dark-secondary/50"
  >
    <div className="px-5 py-4 bg-gradient-to-r from-primary-lighter/50 to-highlight2-light/30 dark:from-primary-bgDark/40 dark:to-highlight2-dark/10 border-b border-light-secondary/50 dark:border-dark-secondary/50">
      <div className="flex items-center gap-3">
        <BookOpen className="w-5 h-5 text-primary-main" />
        <div>
          <h3 className="text-lg font-bold text-light-text dark:text-dark-text">
            {title}
          </h3>
          <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
            {subtitle} • Re-upload faculty matrix to generate timetable grid
          </p>
        </div>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-light-secondary/50 dark:border-dark-secondary/50 text-left">
            <th className="px-5 py-3 font-medium text-light-muted-text dark:text-dark-muted-text">
              Subject
            </th>
            <th className="px-5 py-3 font-medium text-light-muted-text dark:text-dark-muted-text">
              Code
            </th>
            {showFaculty && (
              <th className="px-5 py-3 font-medium text-light-muted-text dark:text-dark-muted-text">
                Faculty
              </th>
            )}
            <th className="px-5 py-3 font-medium text-light-muted-text dark:text-dark-muted-text">
              Type
            </th>
            <th className="px-5 py-3 font-medium text-light-muted-text dark:text-dark-muted-text">
              Batch
            </th>
          </tr>
        </thead>
        <tbody>
          {allocations
            .sort((a, b) =>
              (a.subject?.name || "").localeCompare(b.subject?.name || ""),
            )
            .map((alloc, idx) => (
              <tr
                key={alloc.id?.toString()}
                className={cn(
                  "border-b border-light-secondary/20 dark:border-dark-secondary/20 last:border-0",
                  idx % 2 === 0
                    ? "bg-light-muted-background/50 dark:bg-dark-background/30"
                    : "",
                )}
              >
                <td className="px-5 py-3 text-light-text dark:text-dark-text font-medium">
                  {alloc.subject?.name || "—"}
                  <span className="ml-1.5 text-xs text-light-muted-text dark:text-dark-muted-text">
                    ({alloc.subject?.abbreviation || "—"})
                  </span>
                </td>
                <td className="px-5 py-3 text-light-muted-text dark:text-dark-muted-text">
                  {(alloc.subject as any)?.subjectCode || "—"}
                </td>
                {showFaculty && (
                  <td className="px-5 py-3 text-light-text dark:text-dark-text">
                    {alloc.faculty?.name || "—"}
                    <span className="ml-1.5 text-xs text-light-muted-text dark:text-dark-muted-text">
                      ({alloc.faculty?.abbreviation || "—"})
                    </span>
                  </td>
                )}
                <td className="px-5 py-3">
                  <span
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full font-medium",
                      alloc.lectureType === "LAB"
                        ? "bg-primary-lighter dark:bg-primary-bgDark text-primary-main"
                        : "bg-highlight2-light dark:bg-highlight2-dark/20 text-highlight2-main",
                    )}
                  >
                    {alloc.lectureType}
                  </span>
                </td>
                <td className="px-5 py-3 text-light-muted-text dark:text-dark-muted-text">
                  {alloc.batch && alloc.batch !== "-" ? alloc.batch : "All"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// ─── Class Centric View ─────────────────────────────────────────────────────

const ClassView: React.FC = () => {
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState("");

  const { data: academicStructure, isLoading: structureLoading } =
    useAcademicStructure();

  const { data: allAllocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ["subjectAllocations"],
    queryFn: subjectAllocationService.getAllSubjectAllocations,
  });

  // Fetch timetable data when division is selected
  const { data: timetableData, isLoading: timetableLoading } = useQuery({
    queryKey: ["divisionTimetable", selectedDivisionId],
    queryFn: () =>
      timetableService.getTimetableByDivisionId(selectedDivisionId),
    enabled: !!selectedDivisionId,
  });

  // ── Cascading filter data ────

  const academicYears = useMemo(() => {
    if (!academicStructure) return [];
    const yearMap = new Map<string, { id: string; yearString: string }>();
    academicStructure.forEach((dept) => {
      dept.semesters.forEach((sem) => {
        if (sem.academicYear) {
          yearMap.set(sem.academicYear.id.toString(), {
            id: sem.academicYear.id.toString(),
            yearString: sem.academicYear.yearString,
          });
        }
      });
    });
    return Array.from(yearMap.values()).sort((a, b) =>
      b.yearString.localeCompare(a.yearString),
    );
  }, [academicStructure]);

  const departments = useMemo(() => {
    if (!academicStructure || !selectedAcademicYearId) return [];
    return academicStructure
      .filter((dept) =>
        dept.semesters.some(
          (s) => s.academicYear?.id.toString() === selectedAcademicYearId,
        ),
      )
      .map((dept) => ({
        id: dept.id.toString(),
        name: dept.name,
        abbreviation: dept.abbreviation,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [academicStructure, selectedAcademicYearId]);

  const semesters = useMemo(() => {
    if (!academicStructure || !selectedAcademicYearId || !selectedDepartmentId)
      return [];
    const dept = academicStructure.find(
      (d) => d.id.toString() === selectedDepartmentId,
    );
    if (!dept) return [];
    return dept.semesters
      .filter((s) => s.academicYear?.id.toString() === selectedAcademicYearId)
      .map((s) => ({
        id: s.id.toString(),
        semesterNumber: s.semesterNumber,
        semesterType: s.semesterType,
      }))
      .sort((a, b) => a.semesterNumber - b.semesterNumber);
  }, [academicStructure, selectedAcademicYearId, selectedDepartmentId]);

  const divisions = useMemo(() => {
    if (!academicStructure || !selectedDepartmentId || !selectedSemesterId)
      return [];
    const dept = academicStructure.find(
      (d) => d.id.toString() === selectedDepartmentId,
    );
    if (!dept) return [];
    const sem = dept.semesters.find(
      (s) => s.id.toString() === selectedSemesterId,
    );
    if (!sem) return [];
    return sem.divisions
      .map((d) => ({
        id: d.id.toString(),
        divisionName: d.divisionName,
        studentCount: d.studentCount,
      }))
      .sort((a, b) => a.divisionName.localeCompare(b.divisionName));
  }, [academicStructure, selectedDepartmentId, selectedSemesterId]);

  // ── Cascading reset handlers ────

  const handleAcademicYearChange = (value: string) => {
    setSelectedAcademicYearId(value);
    setSelectedDepartmentId("");
    setSelectedSemesterId("");
    setSelectedDivisionId("");
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartmentId(value);
    setSelectedSemesterId("");
    setSelectedDivisionId("");
  };

  const handleSemesterChange = (value: string) => {
    setSelectedSemesterId(value);
    setSelectedDivisionId("");
  };

  // ── Build display data ────

  const divisionAllocations = useMemo(() => {
    if (!allAllocations || !selectedDivisionId) return [];
    return allAllocations.filter(
      (a) => a.divisionId?.toString() === selectedDivisionId,
    );
  }, [allAllocations, selectedDivisionId]);

  const selectedDeptInfo = departments.find(
    (d) => d.id === selectedDepartmentId,
  );
  const selectedSemInfo = semesters.find((s) => s.id === selectedSemesterId);
  const selectedDivInfo = divisions.find((d) => d.id === selectedDivisionId);
  const selectedYearInfo = academicYears.find(
    (y) => y.id === selectedAcademicYearId,
  );

  const grid = useMemo(() => {
    if (timetableData?.timetableData) {
      return buildGridFromEntries(
        timetableData.timetableData as TimetableEntry[],
        divisionAllocations,
        selectedDivInfo?.divisionName,
        selectedSemInfo
          ? `Semester ${selectedSemInfo.semesterNumber}`
          : undefined,
      );
    }
    return null;
  }, [timetableData, divisionAllocations, selectedDivInfo, selectedSemInfo]);

  const isLoading = timetableLoading || allocationsLoading;

  return (
    <div className="space-y-6">
      {/* Cascading Filters */}
      <Card className="p-5 bg-light-background dark:bg-dark-muted-background border-light-secondary/50 dark:border-dark-secondary/50">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="w-5 h-5 text-highlight2-main" />
          <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">
            Select Class
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            id="academic-year"
            name="academicYear"
            label="Academic Year"
            value={selectedAcademicYearId}
            onChange={(e) => handleAcademicYearChange(e.target.value)}
            disabled={structureLoading}
          >
            <option value="">
              {structureLoading ? "Loading..." : "-- Academic Year --"}
            </option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.yearString}
              </option>
            ))}
          </Select>

          <Select
            id="department"
            name="department"
            label="Department"
            value={selectedDepartmentId}
            onChange={(e) => handleDepartmentChange(e.target.value)}
            disabled={!selectedAcademicYearId}
          >
            <option value="">
              {!selectedAcademicYearId
                ? "-- Select Year first --"
                : "-- Department --"}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.abbreviation})
              </option>
            ))}
          </Select>

          <Select
            id="semester"
            name="semester"
            label="Semester"
            value={selectedSemesterId}
            onChange={(e) => handleSemesterChange(e.target.value)}
            disabled={!selectedDepartmentId}
          >
            <option value="">
              {!selectedDepartmentId
                ? "-- Select Dept first --"
                : "-- Semester --"}
            </option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                Semester {s.semesterNumber} ({s.semesterType})
              </option>
            ))}
          </Select>

          <Select
            id="division"
            name="division"
            label="Division"
            value={selectedDivisionId}
            onChange={(e) => setSelectedDivisionId(e.target.value)}
            disabled={!selectedSemesterId}
          >
            <option value="">
              {!selectedSemesterId
                ? "-- Select Semester first --"
                : "-- Division --"}
            </option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.divisionName}
                {d.studentCount ? ` (${d.studentCount} students)` : ""}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Timetable */}
      {selectedDivisionId && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDivisionId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {isLoading ? (
              <PageLoader text="Loading timetable..." />
            ) : grid ? (
              <TimetableGridView
                grid={grid}
                title={`${selectedDivInfo?.divisionName || "Division"}`}
                subtitle={`Semester ${selectedSemInfo?.semesterNumber || ""} • ${selectedDeptInfo?.abbreviation || ""} • ${selectedYearInfo?.yearString || ""}`}
              />
            ) : divisionAllocations.length > 0 ? (
              <FallbackListView
                allocations={divisionAllocations}
                title={`${selectedDivInfo?.divisionName || "Division"}`}
                subtitle={`Semester ${selectedSemInfo?.semesterNumber || ""} • ${selectedDeptInfo?.abbreviation || ""} • ${selectedYearInfo?.yearString || ""}`}
              />
            ) : (
              <Card className="p-8 text-center bg-light-background dark:bg-dark-muted-background border-light-secondary/50 dark:border-dark-secondary/50">
                <Layers className="w-10 h-10 text-light-muted-text dark:text-dark-muted-text mx-auto mb-3" />
                <p className="text-light-muted-text dark:text-dark-muted-text">
                  No allocations found for{" "}
                  <span className="font-semibold">
                    {selectedDivInfo?.divisionName}
                  </span>
                  .
                </p>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Prompt when filters are incomplete */}
      {!selectedDivisionId && !structureLoading && (
        <Card className="p-12 text-center bg-light-background dark:bg-dark-muted-background border-light-secondary/50 dark:border-dark-secondary/50 border-dashed">
          <Layers className="w-12 h-12 text-light-secondary dark:text-dark-secondary mx-auto mb-4" />
          <p className="text-light-muted-text dark:text-dark-muted-text text-lg">
            {!selectedAcademicYearId
              ? "Start by selecting an Academic Year"
              : !selectedDepartmentId
                ? "Now select a Department"
                : !selectedSemesterId
                  ? "Now select a Semester"
                  : "Finally, select a Division to view the timetable"}
          </p>
        </Card>
      )}
    </div>
  );
};

// ─── Faculty Centric View ───────────────────────────────────────────────────

const FacultyView: React.FC = () => {
  const [selectedFacultyId, setSelectedFacultyId] = useState("");

  const { data: faculties, isLoading: facultiesLoading } = useQuery({
    queryKey: ["faculties"],
    queryFn: facultyService.getAllFaculties,
  });

  const { data: allAllocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ["subjectAllocations"],
    queryFn: subjectAllocationService.getAllSubjectAllocations,
  });

  const selectedFaculty = faculties?.find(
    (f) => f.id?.toString() === selectedFacultyId,
  );

  const facultyAllocations = useMemo(() => {
    if (!allAllocations || !selectedFacultyId) return [];
    return allAllocations.filter(
      (a) => a.facultyId?.toString() === selectedFacultyId,
    );
  }, [allAllocations, selectedFacultyId]);

  // Get unique division IDs from faculty allocations for timetable queries
  const divisionIds = useMemo(() => {
    return [
      ...new Set(facultyAllocations.map((a) => a.divisionId?.toString())),
    ].filter(Boolean) as string[];
  }, [facultyAllocations]);

  // Fetch timetable for each division the faculty teaches in
  const timetableQueries = useQuery({
    queryKey: ["facultyTimetables", divisionIds],
    queryFn: async () => {
      const map = new Map<string, TimetableEntry[]>();
      await Promise.all(
        divisionIds.map(async (divId) => {
          try {
            const data = await timetableService.getTimetableByDivisionId(divId);
            if (data?.timetableData) {
              map.set(divId, data.timetableData as TimetableEntry[]);
            }
          } catch {
            // Skip divisions without timetable data
          }
        }),
      );
      return map;
    },
    enabled: divisionIds.length > 0,
  });

  const grid = useMemo(() => {
    if (!selectedFaculty?.abbreviation || !timetableQueries.data) return null;
    if (timetableQueries.data.size === 0) return null;
    return buildFacultyGrid(
      facultyAllocations,
      timetableQueries.data,
      selectedFaculty.abbreviation,
    );
  }, [selectedFaculty, timetableQueries.data, facultyAllocations]);

  // Check if the grid has any entries
  const gridHasEntries = useMemo(() => {
    if (!grid) return false;
    for (const day of DAYS) {
      for (const slot of SLOTS) {
        if (grid[day]?.[slot]?.length > 0) return true;
      }
    }
    return false;
  }, [grid]);

  // Group allocations by division for fallback display
  const groupedByDivision = useMemo(() => {
    const map = new Map<
      string,
      {
        divisionName: string;
        semesterNumber: number;
        deptAbbr: string;
        allocations: SubjectAllocation[];
      }
    >();
    facultyAllocations.forEach((alloc) => {
      const key = alloc.divisionId?.toString() || "";
      if (!map.has(key)) {
        map.set(key, {
          divisionName: alloc.division?.divisionName || "Unknown",
          semesterNumber: alloc.semester?.semesterNumber || 0,
          deptAbbr:
            alloc.department?.abbreviation || alloc.department?.name || "",
          allocations: [],
        });
      }
      map.get(key)!.allocations.push(alloc);
    });
    return Array.from(map.values()).sort(
      (a, b) =>
        a.semesterNumber - b.semesterNumber ||
        a.divisionName.localeCompare(b.divisionName),
    );
  }, [facultyAllocations]);

  const isLoading = facultiesLoading || allocationsLoading;

  return (
    <div className="space-y-6">
      {/* Faculty Selector */}
      <Card className="p-5 bg-light-background dark:bg-dark-muted-background border-light-secondary/50 dark:border-dark-secondary/50">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-primary-main" />
          <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">
            Select Faculty
          </h2>
        </div>
        <div className="max-w-md">
          <Select
            id="faculty-select"
            name="faculty"
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            disabled={isLoading}
          >
            <option value="">
              {isLoading
                ? "Loading faculty..."
                : "-- Choose a Faculty Member --"}
            </option>
            {faculties
              ?.slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((f) => (
                <option key={f.id?.toString()} value={f.id?.toString()}>
                  {f.name} ({f.abbreviation || f.designation})
                </option>
              ))}
          </Select>
        </div>
      </Card>

      {/* Faculty Timetable */}
      {selectedFacultyId && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedFacultyId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {isLoading || timetableQueries.isLoading ? (
              <PageLoader text="Loading schedule..." />
            ) : grid && gridHasEntries ? (
              <TimetableGridView
                grid={grid}
                title={selectedFaculty?.name || "Faculty Schedule"}
                subtitle={`${selectedFaculty?.designation || ""} • ${selectedFaculty?.abbreviation || ""} • ${facultyAllocations.length} allocation${facultyAllocations.length !== 1 ? "s" : ""}`}
                showFaculty={false}
              />
            ) : facultyAllocations.length > 0 ? (
              <div className="space-y-4">
                {/* Faculty info card */}
                <Card className="p-5 bg-light-background dark:bg-dark-muted-background border-light-secondary/50 dark:border-dark-secondary/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-lighter dark:bg-primary-bgDark flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-main" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-light-text dark:text-dark-text">
                        {selectedFaculty?.name}
                      </h3>
                      <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                        {selectedFaculty?.designation} •{" "}
                        {selectedFaculty?.abbreviation} •{" "}
                        {facultyAllocations.length} allocation
                        {facultyAllocations.length !== 1 ? "s" : ""} across{" "}
                        {groupedByDivision.length} class
                        {groupedByDivision.length !== 1 ? "es" : ""} • Timetable
                        grid not uploaded yet
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Fallback: Grouped by division */}
                {groupedByDivision.map((group) => (
                  <FallbackListView
                    key={group.divisionName + group.semesterNumber}
                    allocations={group.allocations}
                    title={group.divisionName}
                    subtitle={`Semester ${group.semesterNumber} • ${group.deptAbbr}`}
                    showFaculty={false}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-light-background dark:bg-dark-muted-background border-light-secondary/50 dark:border-dark-secondary/50">
                <Users className="w-10 h-10 text-light-muted-text dark:text-dark-muted-text mx-auto mb-3" />
                <p className="text-light-muted-text dark:text-dark-muted-text">
                  No allocations found for{" "}
                  <span className="font-semibold">{selectedFaculty?.name}</span>
                  .
                </p>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Prompt when nothing is selected */}
      {!selectedFacultyId && !isLoading && (
        <Card className="p-12 text-center bg-light-background dark:bg-dark-muted-background border-light-secondary/50 dark:border-dark-secondary/50 border-dashed">
          <Users className="w-12 h-12 text-light-secondary dark:text-dark-secondary mx-auto mb-4" />
          <p className="text-light-muted-text dark:text-dark-muted-text text-lg">
            Select a faculty member above to view their schedule
          </p>
        </Card>
      )}
    </div>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [viewType, setViewType] = useState<ViewType>("class");

  return (
    <div className="min-h-screen flex flex-col bg-light-muted-background dark:bg-dark-background">
      <Header />

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-light-text dark:text-dark-text flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary-main" />
                Schedule
              </h1>
              <p className="text-light-muted-text dark:text-dark-muted-text mt-1">
                View teaching timetables by class or faculty
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-light-background dark:bg-dark-muted-background rounded-lg p-1 border border-light-secondary/50 dark:border-dark-secondary/50 self-start">
              <button
                onClick={() => setViewType("class")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  viewType === "class"
                    ? "bg-primary-main text-white shadow-sm"
                    : "text-light-muted-text dark:text-dark-muted-text hover:bg-light-muted-background dark:hover:bg-dark-secondary/50",
                )}
              >
                <GraduationCap className="w-4 h-4" />
                Class Centric
              </button>
              <button
                onClick={() => setViewType("faculty")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  viewType === "faculty"
                    ? "bg-primary-main text-white shadow-sm"
                    : "text-light-muted-text dark:text-dark-muted-text hover:bg-light-muted-background dark:hover:bg-dark-secondary/50",
                )}
              >
                <Users className="w-4 h-4" />
                Faculty Centric
              </button>
            </div>
          </div>
        </motion.div>

        {/* View Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewType}
            initial={{ opacity: 0, x: viewType === "class" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: viewType === "class" ? 20 : -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewType === "faculty" ? <FacultyView /> : <ClassView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
