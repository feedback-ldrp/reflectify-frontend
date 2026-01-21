"use client";

import React from "react";
import { Users, BookOpen, Calendar } from "lucide-react";
import { DivisionDetailedAnalytics } from "@/services/analyticsService";
import { DrillDownPanel, DrillDownSection, StatCard } from "../DrillDownPanel";
import { DetailTable, columnRenderers } from "../DetailTable";
import { exportDivisionDetails } from "@/utils/analyticsExport";

interface DivisionDetailPanelProps {
  divisionName: string;
  isOpen: boolean;
  onClose: () => void;
  data: DivisionDetailedAnalytics | null;
  isLoading?: boolean;
  onFacultyClick?: (facultyId: string, facultyName: string) => void;
  onSubjectClick?: (subjectId: string, subjectName: string) => void;
}

export const DivisionDetailPanel: React.FC<DivisionDetailPanelProps> = ({
  divisionName,
  isOpen,
  onClose,
  data,
  isLoading = false,
  onFacultyClick,
  onSubjectClick,
}) => {
  const handleExportCSV = () => {
    if (!data) return;
    const csvData = data.facultyBreakdown.map((f) => ({
      Faculty: f.facultyName,
      Subject: f.subjectName,
      Type: f.lectureType,
      Rating: f.rating,
      Responses: f.responses,
    }));

    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) =>
      Object.values(row)
        .map((v) => `"${v}"`)
        .join(","),
    );
    const csv = [headers, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${divisionName}_analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    if (!data) return;
    await exportDivisionDetails(
      {
        division: data.division,
        overallRating: data.overallRating,
        totalResponses: data.totalResponses,
        facultyBreakdown: data.facultyBreakdown,
        subjectBreakdown: data.subjectBreakdown,
      },
      `${divisionName.replace(/\s+/g, "_")}_Analytics`,
    );
  };

  const facultyColumns = [
    {
      key: "facultyName",
      header: "Faculty",
      sortable: true,
      render: onFacultyClick
        ? (value: string, row: any) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFacultyClick(row.facultyId, row.facultyName);
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline text-left"
            >
              {value}
            </button>
          )
        : undefined,
    },
    {
      key: "subjectName",
      header: "Subject",
      sortable: true,
      render: onSubjectClick
        ? (value: string, row: any) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubjectClick(row.subjectId, row.subjectName);
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline text-left"
            >
              {value}
            </button>
          )
        : undefined,
    },
    {
      key: "lectureType",
      header: "Type",
      render: columnRenderers.lectureType,
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      align: "right" as const,
      render: columnRenderers.rating,
    },
    {
      key: "responses",
      header: "Responses",
      sortable: true,
      align: "right" as const,
    },
  ];

  const subjectColumns = [
    {
      key: "subjectName",
      header: "Subject",
      sortable: true,
      render: onSubjectClick
        ? (value: string, row: any) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSubjectClick(row.subjectId, row.subjectName);
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline text-left"
            >
              {value}
            </button>
          )
        : undefined,
    },
    {
      key: "lectureRating",
      header: "Lecture",
      sortable: true,
      align: "right" as const,
      render: columnRenderers.rating,
    },
    {
      key: "labRating",
      header: "Lab",
      sortable: true,
      align: "right" as const,
      render: columnRenderers.rating,
    },
    {
      key: "totalRating",
      header: "Overall",
      sortable: true,
      align: "right" as const,
      render: columnRenderers.rating,
    },
    {
      key: "responses",
      header: "Responses",
      sortable: true,
      align: "right" as const,
    },
  ];

  const yearComparisonColumns = [
    {
      key: "academicYearString",
      header: "Academic Year",
      sortable: true,
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      align: "right" as const,
      render: columnRenderers.rating,
    },
    {
      key: "responses",
      header: "Responses",
      sortable: true,
      align: "right" as const,
    },
  ];

  return (
    <DrillDownPanel
      isOpen={isOpen}
      onClose={onClose}
      title={divisionName}
      subtitle={
        data
          ? `${data.division.departmentName} • Semester ${data.division.semesterNumber}`
          : undefined
      }
      width="lg"
      isLoading={isLoading}
      onExportCSV={handleExportCSV}
      onExportExcel={handleExportExcel}
    >
      {!data && !isLoading ? (
        <div className="text-center py-8 text-gray-500">
          <p>No data available</p>
          <p className="text-sm text-gray-400 mt-2">Please try again later</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Overall Rating"
              value={data.overallRating.toFixed(2)}
              subtext={`${data.totalResponses} responses`}
              colorClass="bg-blue-50 text-blue-700"
            />
            <StatCard
              label="Faculty Count"
              value={
                new Set(data.facultyBreakdown.map((f) => f.facultyId)).size
              }
              colorClass="bg-purple-50 text-purple-700"
            />
            <StatCard
              label="Subjects"
              value={data.subjectBreakdown.length}
              colorClass="bg-teal-50 text-teal-700"
            />
          </div>

          {/* Faculty Performance */}
          <DrillDownSection
            title="Faculty Teaching This Division"
            icon={<Users className="w-4 h-4" />}
          >
            <DetailTable
              data={data.facultyBreakdown}
              columns={facultyColumns}
              compact
            />
          </DrillDownSection>

          {/* Subject Breakdown */}
          <DrillDownSection
            title="Subject Performance"
            icon={<BookOpen className="w-4 h-4" />}
          >
            <DetailTable
              data={data.subjectBreakdown}
              columns={subjectColumns}
              compact
            />
          </DrillDownSection>

          {/* Year Comparison */}
          {data.academicYearComparison.length > 1 && (
            <DrillDownSection
              title="Performance Across Years"
              icon={<Calendar className="w-4 h-4" />}
              defaultOpen={false}
            >
              <DetailTable
                data={data.academicYearComparison}
                columns={yearComparisonColumns}
                compact
              />
            </DrillDownSection>
          )}
        </div>
      ) : null}
    </DrillDownPanel>
  );
};

export default DivisionDetailPanel;
