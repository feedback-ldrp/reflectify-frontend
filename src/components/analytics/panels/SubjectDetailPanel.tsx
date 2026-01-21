"use client";

import React from "react";
import { Users, Building2, MessageSquare } from "lucide-react";
import { SubjectDetailedAnalytics } from "@/services/analyticsService";
import { DrillDownPanel, DrillDownSection, StatCard } from "../DrillDownPanel";
import { DetailTable, columnRenderers } from "../DetailTable";
import { exportSubjectDetails } from "@/utils/analyticsExport";

interface SubjectDetailPanelProps {
  subjectName: string;
  isOpen: boolean;
  onClose: () => void;
  data: SubjectDetailedAnalytics | null;
  isLoading?: boolean;
  onFacultyClick?: (facultyId: string, facultyName: string) => void;
  onDivisionClick?: (divisionId: string, divisionName: string) => void;
  inline?: boolean;
}

export const SubjectDetailPanel: React.FC<SubjectDetailPanelProps> = ({
  subjectName,
  isOpen,
  onClose,
  data,
  isLoading = false,
  onFacultyClick,
  onDivisionClick,
  inline = false,
}) => {
  const handleExportCSV = () => {
    if (!data) return;
    // Simple CSV export of faculty breakdown
    const csvData = data.facultyBreakdown.map((f) => ({
      Faculty: f.facultyName,
      Type: f.lectureType,
      Rating: f.rating,
      Responses: f.responses,
      Divisions: f.divisions.join(", "),
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
    a.download = `${subjectName}_analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    if (!data) return;
    await exportSubjectDetails(
      {
        subject: data.subject,
        overallRating: data.overallRating,
        totalResponses: data.totalResponses,
        facultyBreakdown: data.facultyBreakdown,
        divisionBreakdown: data.divisionBreakdown,
      },
      `${subjectName.replace(/\s+/g, "_")}_Analytics`,
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
    {
      key: "divisions",
      header: "Divisions",
      render: columnRenderers.arrayAsBadges,
    },
  ];

  const divisionColumns = [
    {
      key: "divisionName",
      header: "Division",
      sortable: true,
      render: onDivisionClick
        ? (value: string, row: any) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDivisionClick(row.divisionId, row.divisionName);
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

  const questionColumns = [
    {
      key: "categoryName",
      header: "Category",
      sortable: true,
    },
    {
      key: "avgRating",
      header: "Avg Rating",
      sortable: true,
      align: "right" as const,
      render: columnRenderers.rating,
    },
    {
      key: "questionCount",
      header: "Questions",
      sortable: true,
      align: "right" as const,
    },
  ];

  return (
    <DrillDownPanel
      isOpen={isOpen}
      onClose={onClose}
      title={subjectName}
      subtitle={data ? `Code: ${data.subject.code}` : undefined}
      width="md"
      isLoading={isLoading}
      onExportCSV={handleExportCSV}
      onExportExcel={handleExportExcel}
      inline={inline}
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
              colorClass="bg-blue-50 text-blue-700"
            />
            <StatCard
              label="Lecture Rating"
              value={data.lectureRating?.toFixed(2) || "N/A"}
              subtext={`${data.lectureResponses} responses`}
              colorClass="bg-purple-50 text-purple-700"
            />
            <StatCard
              label="Lab Rating"
              value={data.labRating?.toFixed(2) || "N/A"}
              subtext={`${data.labResponses} responses`}
              colorClass="bg-teal-50 text-teal-700"
            />
          </div>

          {/* Faculty Breakdown */}
          <DrillDownSection
            title="Faculty Breakdown"
            icon={<Users className="w-4 h-4" />}
          >
            <DetailTable
              data={data.facultyBreakdown}
              columns={facultyColumns}
              compact
            />
          </DrillDownSection>

          {/* Division Breakdown */}
          <DrillDownSection
            title="Division Breakdown"
            icon={<Building2 className="w-4 h-4" />}
          >
            <DetailTable
              data={data.divisionBreakdown}
              columns={divisionColumns}
              compact
            />
          </DrillDownSection>

          {/* Question Category Breakdown */}
          {data.questionBreakdown.length > 0 && (
            <DrillDownSection
              title="Question Categories"
              icon={<MessageSquare className="w-4 h-4" />}
              defaultOpen={false}
            >
              <DetailTable
                data={data.questionBreakdown}
                columns={questionColumns}
                compact
              />
            </DrillDownSection>
          )}
        </div>
      ) : null}
    </DrillDownPanel>
  );
};

export default SubjectDetailPanel;
