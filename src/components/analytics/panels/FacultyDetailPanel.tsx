"use client";

import React from "react";
import { BookOpen, Building2, MessageSquare, TrendingUp, Trophy } from "lucide-react";
import { FacultyDetailedAnalytics } from "@/services/analyticsService";
import {
  DrillDownPanel,
  DrillDownSection,
  StatCard,
} from "../DrillDownPanel";
import { DetailTable, columnRenderers } from "../DetailTable";
import { exportFacultyDetails } from "@/utils/analyticsExport";

interface FacultyDetailPanelProps {
  facultyName: string;
  isOpen: boolean;
  onClose: () => void;
  data: FacultyDetailedAnalytics | null;
  isLoading?: boolean;
  onSubjectClick?: (subjectId: string, subjectName: string) => void;
  onDivisionClick?: (divisionId: string, divisionName: string) => void;
}

export const FacultyDetailPanel: React.FC<FacultyDetailPanelProps> = ({
  facultyName,
  isOpen,
  onClose,
  data,
  isLoading = false,
  onSubjectClick,
  onDivisionClick,
}) => {

  const handleExportCSV = () => {
    if (!data) return;
    const csvData = data.subjectBreakdown.map((s) => ({
      Subject: s.subjectName,
      Type: s.lectureType,
      Rating: s.rating,
      Responses: s.responses,
      Semester: s.semester,
      "Academic Year": s.academicYear,
    }));
    
    const headers = Object.keys(csvData[0]).join(",");
    const rows = csvData.map((row) =>
      Object.values(row)
        .map((v) => `"${v}"`)
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${facultyName}_analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    if (!data) return;
    await exportFacultyDetails(
      {
        faculty: data.faculty,
        overallRating: data.overallRating,
        totalResponses: data.totalResponses,
        rank: data.rank,
        totalFaculty: data.totalFaculty,
        subjectBreakdown: data.subjectBreakdown,
        divisionBreakdown: data.divisionBreakdown,
      },
      `${facultyName.replace(/\s+/g, "_")}_Analytics`
    );
  };

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
      key: "semester",
      header: "Sem",
      align: "center" as const,
    },
    {
      key: "academicYear",
      header: "Year",
      sortable: true,
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
      key: "subjectName",
      header: "Subject",
      sortable: true,
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

  const questionCategoryColumns = [
    {
      key: "category",
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
      header: "Responses",
      sortable: true,
      align: "right" as const,
    },
  ];

  const trendColumns = [
    {
      key: "academicYear",
      header: "Academic Year",
      sortable: true,
    },
    {
      key: "semester",
      header: "Semester",
      align: "center" as const,
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

  const getRankBadgeColor = (rank: number, total: number) => {
    const percentile = ((total - rank + 1) / total) * 100;
    if (percentile >= 90) return "bg-yellow-100 text-yellow-800"; // Top 10%
    if (percentile >= 75) return "bg-green-100 text-green-800";   // Top 25%
    if (percentile >= 50) return "bg-blue-100 text-blue-800";     // Top 50%
    return "bg-gray-100 text-gray-700";
  };

  return (
    <DrillDownPanel
      isOpen={isOpen}
      onClose={onClose}
      title={facultyName}
      subtitle={data ? `${data.faculty.designation}` : undefined}
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
            <div className={`p-4 rounded-lg ${getRankBadgeColor(data.rank, data.totalFaculty)}`}>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4" />
                <p className="text-sm font-medium opacity-80">Rank</p>
              </div>
              <p className="text-2xl font-bold">#{data.rank}</p>
              <p className="text-xs mt-1 opacity-70">of {data.totalFaculty} faculty</p>
            </div>
            <StatCard
              label="Subjects Taught"
              value={data.subjectBreakdown.length}
              subtext={`${new Set(data.divisionBreakdown.map(d => d.divisionId)).size} divisions`}
              colorClass="bg-purple-50 text-purple-700"
            />
          </div>

          {/* Subject Performance */}
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

          {/* Question Categories */}
          {data.questionCategoryBreakdown.length > 0 && (
            <DrillDownSection
              title="Performance by Question Category"
              icon={<MessageSquare className="w-4 h-4" />}
              defaultOpen={false}
            >
              <DetailTable
                data={data.questionCategoryBreakdown}
                columns={questionCategoryColumns}
                compact
              />
            </DrillDownSection>
          )}

          {/* Historical Trend */}
          {data.trendData.length > 0 && (
            <DrillDownSection
              title="Historical Trend"
              icon={<TrendingUp className="w-4 h-4" />}
              defaultOpen={false}
            >
              <DetailTable
                data={data.trendData}
                columns={trendColumns}
                compact
              />
            </DrillDownSection>
          )}
        </div>
      ) : null}
    </DrillDownPanel>
  );
};

export default FacultyDetailPanel;
