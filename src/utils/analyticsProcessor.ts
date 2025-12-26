/**
 * @file src/utils/analyticsProcessor.ts
 * @description Analytics data processing utilities for frontend charts and stats
 */

import {
  FeedbackSnapshot,
  SubjectLectureLabRating,
  DivisionBatchComparison,
  FacultyOverallPerformanceSummary,
  LectureLabType,
  AcademicYearSemesterTrend,
  AcademicYearDivisionTrend,
  AcademicYearDepartmentTrend,
  SubjectFacultyPerformance,
  SubjectFacultyDetailPerformance,
} from "@/interfaces/analytics";

export const parseResponseValue = (responseValue: any): number | null => {
  let value: number | null = null;

  if (typeof responseValue === "number") {
    value = responseValue;
  } else if (typeof responseValue === "string") {
    const parsed = parseFloat(responseValue);
    value = !isNaN(parsed) ? parsed : null;
  } else if (typeof responseValue === "object" && responseValue?.score) {
    value =
      typeof responseValue.score === "number" ? responseValue.score : null;
  }

  // Convert from 0-5 scale to 0-10 scale, but keep zero as zero
  return value !== null ? (value === 0 ? 0 : value) : null;
};

export const determineLectureType = (
  snapshot: FeedbackSnapshot,
): LectureLabType => {
  const categoryName = snapshot.questionCategoryName?.toLowerCase() || "";
  const batch = snapshot.questionBatch?.toLowerCase() || "";

  if (
    categoryName.includes("lab") ||
    categoryName.includes("laboratory") ||
    (batch !== "none" && batch !== "")
  ) {
    return "LAB";
  }
  return "LECTURE";
};

export class AnalyticsDataProcessor {
  static processOverallStats(snapshots: FeedbackSnapshot[]) {
    const validSnapshots = snapshots.filter(
      (s) => s && s.responseValue !== undefined,
    );

    const numericResponses = validSnapshots
      .map((s) => parseResponseValue(s.responseValue))
      .filter((val): val is number => val !== null);

    // Filter out zero ratings for average calculation
    const nonZeroResponses = numericResponses;

    const uniqueSubjects = new Set(validSnapshots.map((s) => s.subjectId)).size;
    const uniqueFaculties = new Set(validSnapshots.map((s) => s.facultyId))
      .size;
    const uniqueStudents = new Set(
      validSnapshots.map((s) => s.studentId || "unknown"),
    ).size;
    const uniqueDepartments = new Set(validSnapshots.map((s) => s.departmentId))
      .size;

    return {
      totalResponses: validSnapshots.length,
      averageRating:
        nonZeroResponses.length > 0
          ? Number(
              (
                nonZeroResponses.reduce((sum, val) => sum + val, 0) /
                nonZeroResponses.length
              ).toFixed(2),
            )
          : null,
      uniqueSubjects,
      uniqueFaculties,
      uniqueStudents,
      uniqueDepartments,
      responseRate: validSnapshots.length > 0 ? 100 : 0,
    };
  }

  static processSubjectRatings(
    snapshots: FeedbackSnapshot[],
  ): SubjectLectureLabRating[] {
    const subjectGroups = new Map<
      string,
      {
        subjectId: string;
        subjectName: string;
        facultyId?: string;
        facultyName?: string;
        lectureResponses: number[];
        labResponses: number[];
        subjectAbbreviation?: string;
      }
    >();

    snapshots.forEach((snapshot) => {
      const key = `${snapshot.subjectId}-${snapshot.facultyId || "unknown"}`;
      const score = parseResponseValue(snapshot.responseValue);
      const lectureType = determineLectureType(snapshot);

      if (score === null) return;

      if (!subjectGroups.has(key)) {
        subjectGroups.set(key, {
          subjectId: snapshot.subjectId,
          subjectName: snapshot.subjectName,
          subjectAbbreviation: snapshot.subjectAbbreviation || "",
          facultyId: snapshot.facultyId,
          facultyName: snapshot.facultyName,
          lectureResponses: [],
          labResponses: [],
        });
      }

      const group = subjectGroups.get(key)!;
      if (lectureType === "LECTURE") {
        group.lectureResponses.push(score);
      } else {
        group.labResponses.push(score);
      }
    });

    return Array.from(subjectGroups.values()).map((group) => {
      const nonZeroLectureResponses = group.lectureResponses.filter(
        (val) => val > 0,
      );
      const nonZeroLabResponses = group.labResponses.filter((val) => val > 0);

      const lectureAvg =
        nonZeroLectureResponses.length > 0
          ? nonZeroLectureResponses.reduce((sum, val) => sum + val, 0) /
            nonZeroLectureResponses.length
          : null;

      const labAvg =
        nonZeroLabResponses.length > 0
          ? nonZeroLabResponses.reduce((sum, val) => sum + val, 0) /
            nonZeroLabResponses.length
          : null;

      const allNonZeroResponses = [
        ...nonZeroLectureResponses,
        ...nonZeroLabResponses,
      ];
      const overallAvg =
        allNonZeroResponses.length > 0
          ? allNonZeroResponses.reduce((sum, val) => sum + val, 0) /
            allNonZeroResponses.length
          : null;

      return {
        subjectId: group.subjectId,
        subjectName: group.subjectName,
        subjectAbbreviation: group.subjectAbbreviation || "",
        facultyId: group.facultyId,
        facultyName: group.facultyName,
        lectureAverageRating: lectureAvg ? Number(lectureAvg.toFixed(2)) : null,
        labAverageRating: labAvg ? Number(labAvg.toFixed(2)) : null,
        overallAverageRating: overallAvg ? Number(overallAvg.toFixed(2)) : null,
        totalLectureResponses: nonZeroLectureResponses.length,
        totalLabResponses: nonZeroLabResponses.length,
        totalOverallResponses: allNonZeroResponses.length,
      };
    });
  }

  static processAcademicYearDepartmentTrends(
    snapshots: FeedbackSnapshot[],
  ): AcademicYearDepartmentTrend[] {
    const academicYearDepartmentGroups = new Map<
      string, // Key: academicYearString
      Map<
        string, // Key: departmentName
        {
          responses: number[];
          responseCount: number;
        }
      >
    >();

    snapshots.forEach((snapshot) => {
      const score = parseResponseValue(snapshot.responseValue);

      if (score === null) return;

      const academicYear = snapshot.academicYearString;
      const department = snapshot.departmentName;

      if (!academicYearDepartmentGroups.has(academicYear)) {
        academicYearDepartmentGroups.set(academicYear, new Map());
      }

      const departmentMap = academicYearDepartmentGroups.get(academicYear)!;

      if (!departmentMap.has(department)) {
        departmentMap.set(department, {
          responses: [],
          responseCount: 0,
        });
      }

      const group = departmentMap.get(department)!;
      group.responses.push(score);
      group.responseCount++;
    });

    const result: AcademicYearDepartmentTrend[] = [];

    // Sort academic years for consistent chart display
    const sortedAcademicYears = Array.from(
      academicYearDepartmentGroups.keys(),
    ).sort();

    sortedAcademicYears.forEach((academicYearString) => {
      const departmentMap =
        academicYearDepartmentGroups.get(academicYearString)!;
      const departmentData: AcademicYearDepartmentTrend["departmentData"] = [];

      // Sort departments for consistent ordering
      const sortedDepartments = Array.from(departmentMap.keys()).sort();

      sortedDepartments.forEach((departmentName) => {
        const group = departmentMap.get(departmentName)!;

        const nonZeroResponses = group.responses.filter((val) => val > 0);
        const averageRating =
          nonZeroResponses.length > 0
            ? Number(
                (
                  nonZeroResponses.reduce((sum, val) => sum + val, 0) /
                  nonZeroResponses.length
                ).toFixed(2),
              )
            : 0;

        departmentData.push({
          departmentName,
          averageRating,
          responseCount: group.responseCount,
        });
      });

      result.push({
        academicYearString,
        departmentData,
      });
    });

    return result;
  }

  static processAcademicYearSemesterTrends(
    snapshots: FeedbackSnapshot[],
  ): AcademicYearSemesterTrend[] {
    // Map to group data by semesterNumber, then by academicYearString
    const semesterYearGroups = new Map<
      number, // Key: semesterNumber
      Map<
        string, // Key: academicYearString
        {
          responses: number[];
          responseCount: number; // To track total response count for the academic year-semester combo
        }
      >
    >();

    snapshots.forEach((snapshot) => {
      const score = parseResponseValue(snapshot.responseValue);

      // Only consider valid numeric scores
      if (score === null) return;

      const semester = snapshot.semesterNumber;
      const academicYear = snapshot.academicYearString;

      if (!semesterYearGroups.has(semester)) {
        semesterYearGroups.set(semester, new Map());
      }

      const academicYearMap = semesterYearGroups.get(semester)!;

      if (!academicYearMap.has(academicYear)) {
        academicYearMap.set(academicYear, {
          responses: [],
          responseCount: 0,
        });
      }

      const group = academicYearMap.get(academicYear)!;
      group.responses.push(score);
      group.responseCount++; // Increment total responses for this combination
    });

    // Convert the grouped data into the desired output format
    const result: AcademicYearSemesterTrend[] = [];

    // Sort semesters for consistent chart display (e.g., 1, 2, 3...)
    const sortedSemesters = Array.from(semesterYearGroups.keys()).sort(
      (a, b) => a - b,
    );

    sortedSemesters.forEach((semesterNumber) => {
      const academicYearMap = semesterYearGroups.get(semesterNumber)!;
      const academicYearData: AcademicYearSemesterTrend["academicYearData"] =
        [];

      // Sort academic years if you want a specific order (e.g., '2022-23', '2023-24')
      const sortedAcademicYears = Array.from(academicYearMap.keys()).sort();

      sortedAcademicYears.forEach((academicYearString) => {
        const group = academicYearMap.get(academicYearString)!;

        // Calculate average rating, handling zero responses if needed (as discussed previously)
        const nonZeroResponses = group.responses.filter((val) => val > 0);
        const averageRating =
          nonZeroResponses.length > 0
            ? Number(
                (
                  nonZeroResponses.reduce((sum, val) => sum + val, 0) /
                  nonZeroResponses.length
                ).toFixed(2),
              )
            : 0; // Or null, depending on your preferred representation

        academicYearData.push({
          academicYearString,
          averageRating,
          responseCount: group.responseCount,
        });
      });

      result.push({
        semesterNumber,
        academicYearData,
      });
    });

    return result;
  }

  static processAcademicYearDivisionTrends(
    snapshots: FeedbackSnapshot[],
  ): AcademicYearDivisionTrend[] {
    const academicYearDivisionGroups = new Map<
      string, // Key: academicYearString
      Map<
        string, // Key: divisionName
        {
          responses: number[];
          responseCount: number;
        }
      >
    >();

    snapshots.forEach((snapshot) => {
      const score = parseResponseValue(snapshot.responseValue);

      if (score === null) return;

      const academicYear = snapshot.academicYearString;
      const division = snapshot.divisionName;

      if (!academicYearDivisionGroups.has(academicYear)) {
        academicYearDivisionGroups.set(academicYear, new Map());
      }

      const divisionMap = academicYearDivisionGroups.get(academicYear)!;

      if (!divisionMap.has(division)) {
        divisionMap.set(division, {
          responses: [],
          responseCount: 0,
        });
      }

      const group = divisionMap.get(division)!;
      group.responses.push(score);
      group.responseCount++;
    });

    const result: AcademicYearDivisionTrend[] = [];

    // Sort academic years for consistent chart display
    const sortedAcademicYears = Array.from(
      academicYearDivisionGroups.keys(),
    ).sort();

    sortedAcademicYears.forEach((academicYearString) => {
      const divisionMap = academicYearDivisionGroups.get(academicYearString)!;
      const divisionData: AcademicYearDivisionTrend["divisionData"] = [];

      // Sort divisions for consistent ordering
      const sortedDivisions = Array.from(divisionMap.keys()).sort();

      sortedDivisions.forEach((divisionName) => {
        const group = divisionMap.get(divisionName)!;

        const nonZeroResponses = group.responses.filter((val) => val > 0);
        const averageRating =
          nonZeroResponses.length > 0
            ? Number(
                (
                  nonZeroResponses.reduce((sum, val) => sum + val, 0) /
                  nonZeroResponses.length
                ).toFixed(2),
              )
            : 0;

        divisionData.push({
          divisionName,
          averageRating,
          responseCount: group.responseCount,
        });
      });

      result.push({
        academicYearString,
        divisionData,
      });
    });

    return result;
  }

  static processSubjectFacultyPerformance(
    snapshots: FeedbackSnapshot[],
  ): SubjectFacultyPerformance[] {
    const subjectFacultyGroups = new Map<
      string, // Key: subjectId
      {
        subjectName: string;
        subjectAbbreviation: string;
        overallSubjectResponses: number[];
        facultyMap: Map<
          string,
          {
            facultyId: string;
            facultyName: string;
            responses: number[];
          }
        >;
      }
    >();

    snapshots.forEach((snapshot) => {
      const score = parseResponseValue(snapshot.responseValue);
      if (score === null) return;

      const subjectId = snapshot.subjectId;
      const facultyId = snapshot.facultyId;
      const facultyName = snapshot.facultyName;

      if (!subjectFacultyGroups.has(subjectId)) {
        subjectFacultyGroups.set(subjectId, {
          subjectName: snapshot.subjectName,
          subjectAbbreviation: snapshot.subjectAbbreviation || "",
          overallSubjectResponses: [],
          facultyMap: new Map(),
        });
      }

      const subjectGroup = subjectFacultyGroups.get(subjectId)!;
      subjectGroup.overallSubjectResponses.push(score);

      // Add faculty data if facultyId is present
      if (facultyId && facultyName) {
        if (!subjectGroup.facultyMap.has(facultyId)) {
          subjectGroup.facultyMap.set(facultyId, {
            facultyId,
            facultyName,
            responses: [],
          });
        }
        subjectGroup.facultyMap.get(facultyId)!.responses.push(score);
      }
    });

    const result: SubjectFacultyPerformance[] = [];

    // Sort subjects for consistent chart display
    const sortedSubjectIds = Array.from(subjectFacultyGroups.keys()).sort(
      (a, b) => {
        const subjectA = subjectFacultyGroups.get(a)!.subjectName;
        const subjectB = subjectFacultyGroups.get(b)!.subjectName;
        return subjectA.localeCompare(subjectB);
      },
    );

    sortedSubjectIds.forEach((subjectId) => {
      const subjectGroup = subjectFacultyGroups.get(subjectId)!;

      const nonZeroOverallSubjectResponses =
        subjectGroup.overallSubjectResponses.filter((val) => val > 0);
      const overallSubjectAverage =
        nonZeroOverallSubjectResponses.length > 0
          ? Number(
              (
                nonZeroOverallSubjectResponses.reduce(
                  (sum, val) => sum + val,
                  0,
                ) / nonZeroOverallSubjectResponses.length
              ).toFixed(2),
            )
          : null;

      const facultyData: SubjectFacultyPerformance["facultyData"] = [];

      // Sort faculties for consistent ordering
      const sortedFacultyIds = Array.from(subjectGroup.facultyMap.keys()).sort(
        (a, b) => {
          const facultyA = subjectGroup.facultyMap.get(a)!.facultyName;
          const facultyB = subjectGroup.facultyMap.get(b)!.facultyName;
          return facultyA.localeCompare(facultyB);
        },
      );

      sortedFacultyIds.forEach((facultyId) => {
        const facultyEntry = subjectGroup.facultyMap.get(facultyId)!;
        const nonZeroFacultyResponses = facultyEntry.responses.filter(
          (val) => val > 0,
        );
        const averageRating =
          nonZeroFacultyResponses.length > 0
            ? Number(
                (
                  nonZeroFacultyResponses.reduce((sum, val) => sum + val, 0) /
                  nonZeroFacultyResponses.length
                ).toFixed(2),
              )
            : 0;

        facultyData.push({
          facultyId: facultyEntry.facultyId,
          facultyName: facultyEntry.facultyName,
          averageRating,
          responseCount: facultyEntry.responses.length,
        });
      });

      result.push({
        subjectName: subjectGroup.subjectName,
        subjectAbbreviation: subjectGroup.subjectAbbreviation,
        overallSubjectAverage,
        overallSubjectResponses: subjectGroup.overallSubjectResponses.length,
        facultyData,
      });
    });

    return result;
  }

  static processSubjectFacultyDetailPerformance(
    snapshots: FeedbackSnapshot[],
    selectedSubjectId: string, // The ID of the subject to filter by
  ): SubjectFacultyDetailPerformance | null {
    // Filter snapshots for the specific subject
    const subjectSnapshots = snapshots.filter(
      (s) => s.subjectId === selectedSubjectId,
    );

    if (subjectSnapshots.length === 0) {
      return null; // No data for this subject
    }

    const subjectName = subjectSnapshots[0].subjectName;
    const subjectAbbreviation = subjectSnapshots[0].subjectAbbreviation || "";

    const overallSubjectResponses: number[] = [];
    const facultyMap = new Map<
      string,
      {
        facultyId: string;
        facultyName: string;
        responses: number[];
      }
    >();

    subjectSnapshots.forEach((snapshot) => {
      const score = parseResponseValue(snapshot.responseValue);
      if (score === null) return;

      overallSubjectResponses.push(score);

      if (snapshot.facultyId && snapshot.facultyName) {
        if (!facultyMap.has(snapshot.facultyId)) {
          facultyMap.set(snapshot.facultyId, {
            facultyId: snapshot.facultyId,
            facultyName: snapshot.facultyName,
            responses: [],
          });
        }
        facultyMap.get(snapshot.facultyId)!.responses.push(score);
      }
    });

    const nonZeroOverallSubjectResponses = overallSubjectResponses.filter(
      (val) => val > 0,
    );
    const overallSubjectAverage =
      nonZeroOverallSubjectResponses.length > 0
        ? Number(
            (
              nonZeroOverallSubjectResponses.reduce(
                (sum, val) => sum + val,
                0,
              ) / nonZeroOverallSubjectResponses.length
            ).toFixed(2),
          )
        : null;
    const totalOverallSubjectResponses = overallSubjectResponses.length;

    const facultyData: SubjectFacultyDetailPerformance["facultyData"] = [];

    // Sort faculties by name for consistent ordering
    const sortedFacultyIds = Array.from(facultyMap.keys()).sort((a, b) => {
      const facultyA = facultyMap.get(a)!.facultyName;
      const facultyB = facultyMap.get(b)!.facultyName;
      return facultyA.localeCompare(facultyB);
    });

    sortedFacultyIds.forEach((facultyId) => {
      const facultyEntry = facultyMap.get(facultyId)!;
      const nonZeroFacultyResponses = facultyEntry.responses.filter(
        (val) => val > 0,
      );
      const averageRating =
        nonZeroFacultyResponses.length > 0
          ? Number(
              (
                nonZeroFacultyResponses.reduce((sum, val) => sum + val, 0) /
                nonZeroFacultyResponses.length
              ).toFixed(2),
            )
          : 0;

      facultyData.push({
        facultyId: facultyEntry.facultyId,
        facultyName: facultyEntry.facultyName,
        averageRating,
        responseCount: facultyEntry.responses.length,
      });
    });

    return {
      subjectName,
      subjectAbbreviation,
      overallSubjectAverage,
      overallSubjectResponses: totalOverallSubjectResponses,
      facultyData,
    };
  }

  static processDivisionComparisons(
    snapshots: FeedbackSnapshot[],
  ): DivisionBatchComparison[] {
    const divisionGroups = new Map<
      string,
      {
        departmentId: string;
        departmentName: string;
        divisionId: string;
        divisionName: string;
        batch: string;
        responses: number[];
      }
    >();

    snapshots.forEach((snapshot) => {
      // Convert batch to lowercase and trim for consistent comparison
      const batch = snapshot.batch?.toLowerCase().trim() || "none";

      // Skip batches that are "none" or "-"
      if (batch === "none" || batch === "-") {
        return;
      }

      const key = `${snapshot.divisionId}-${batch}`;
      const score = parseResponseValue(snapshot.responseValue);

      if (score === null) return;

      if (!divisionGroups.has(key)) {
        divisionGroups.set(key, {
          departmentId: snapshot.departmentId,
          departmentName: snapshot.departmentName,
          divisionId: snapshot.divisionId,
          divisionName: snapshot.divisionName,
          batch: snapshot.batch ?? "",
          responses: [],
        });
      }

      divisionGroups.get(key)!.responses.push(score);
    });

    return Array.from(divisionGroups.values()).map((group) => ({
      departmentId: group.departmentId,
      departmentName: group.departmentName,
      divisionId: group.divisionId,
      divisionName: group.divisionName,
      batch: group.batch,
      averageRating: Number(
        (
          group.responses.reduce((sum, val) => sum + val, 0) /
          group.responses.length
        ).toFixed(2),
      ),
      totalResponses: group.responses.length,
      engagementScore: Math.min(10, Math.round(group.responses.length / 5)), // Engagement based on response count (scaled to 0-10)
    }));
  }

  static processFacultyPerformance(
    snapshots: FeedbackSnapshot[],
  ): FacultyOverallPerformanceSummary[] {
    const facultyGroups = new Map<
      string,
      {
        facultyId: string;
        facultyName: string;
        academicYearId: string;
        responses: number[];
      }
    >();

    snapshots.forEach((snapshot) => {
      const key = `${snapshot.facultyId}-${snapshot.academicYearId}`;
      const score = parseResponseValue(snapshot.responseValue);

      if (score === null) return;

      if (!facultyGroups.has(key)) {
        facultyGroups.set(key, {
          facultyId: snapshot.facultyId,
          facultyName: snapshot.facultyName,
          academicYearId: snapshot.academicYearId,
          responses: [],
        });
      }

      facultyGroups.get(key)!.responses.push(score);
    });

    return Array.from(facultyGroups.values())
      .map((group) => ({
        facultyId: group.facultyId,
        facultyName: group.facultyName,
        academicYearId: group.academicYearId,
        averageRating: Number(
          (
            group.responses.reduce((sum, val) => sum + val, 0) /
            group.responses.length
          ).toFixed(2),
        ),
        totalResponses: group.responses.length,
      }))
      .sort((a, b) => b.averageRating - a.averageRating);
  }

  static processLectureLabComparison(snapshots: FeedbackSnapshot[]) {
    const lectureResponses: number[] = [];
    const labResponses: number[] = [];

    snapshots.forEach((snapshot) => {
      const score = parseResponseValue(snapshot.responseValue);
      if (score === null) return;

      const lectureType = determineLectureType(snapshot);
      if (lectureType === "LECTURE") {
        lectureResponses.push(score);
      } else {
        labResponses.push(score);
      }
    });

    const nonZeroLectureResponses = lectureResponses.filter((val) => val > 0);
    const nonZeroLabResponses = labResponses.filter((val) => val > 0);

    const lectureAvg =
      nonZeroLectureResponses.length > 0
        ? nonZeroLectureResponses.reduce((sum, val) => sum + val, 0) /
          nonZeroLectureResponses.length
        : null;

    const labAvg =
      nonZeroLabResponses.length > 0
        ? nonZeroLabResponses.reduce((sum, val) => sum + val, 0) /
          nonZeroLabResponses.length
        : null;

    return {
      lectureAverageRating: lectureAvg ? Number(lectureAvg.toFixed(2)) : 0,
      labAverageRating: labAvg ? Number(labAvg.toFixed(2)) : 0,
      totalLectureResponses: nonZeroLectureResponses.length,
      totalLabResponses: nonZeroLabResponses.length,
    };
  }

  static getFilteringOptions(snapshots: FeedbackSnapshot[]) {
    const academicYears = [
      ...new Set(snapshots.map((s) => s.academicYearString)),
    ].sort();
    const departments = [
      ...new Set(snapshots.map((s) => s.departmentName)),
    ].sort();
    const subjects = [...new Set(snapshots.map((s) => s.subjectName))].sort();
    const semesters = [...new Set(snapshots.map((s) => s.semesterNumber))].sort(
      (a, b) => a - b,
    );
    const divisions = [...new Set(snapshots.map((s) => s.divisionName))].sort();

    return {
      academicYears,
      departments,
      subjects,
      semesters,
      divisions,
    };
  }
}
