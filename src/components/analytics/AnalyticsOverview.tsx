/**
 * @file src/components/analytics/AnalyticsOverview.tsx
 * @description Overview statistics cards for analytics dashboard
 */

"use client";

import React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Users, Star, MessageSquare, BarChart3, Target } from "lucide-react";

interface OverallStats {
  totalResponses: number;
  averageRating: number | null;
  uniqueSubjects: number;
  uniqueFaculties: number;
  uniqueStudents: number;
  uniqueDepartments: number;
  responseRate: number;
}

interface AnalyticsOverviewProps {
  stats: OverallStats | null;
  isLoading?: boolean;
}

export const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  stats,
  isLoading = false,
}) => {
  const formatRating = (value: number | null): string => {
    return value ? value.toFixed(1) : "0.0";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <StatCard
        title="Total Responses"
        value={stats?.totalResponses || 0}
        icon={MessageSquare}
        isLoading={isLoading}
        // subtitle="Feedback submissions"
        onClick={() => {}}
      />

      <StatCard
        title="Average Rating"
        value={formatRating(stats?.averageRating || null)}
        icon={Star}
        isLoading={isLoading}
        // subtitle="Out of 10"
        onClick={() => {}}
      />

      <StatCard
        title="Unique Subjects"
        value={stats?.uniqueSubjects || 0}
        icon={BarChart3}
        isLoading={isLoading}
        // subtitle="Being evaluated"
        onClick={() => {}}
      />

      <StatCard
        title="Faculty Count"
        value={stats?.uniqueFaculties || 0}
        icon={Users}
        isLoading={isLoading}
        // subtitle="Total educators"
        onClick={() => {}}
      />

      <StatCard
        title="Departments"
        value={stats?.uniqueDepartments || 0}
        icon={Target}
        isLoading={isLoading}
        // subtitle="Academic units"
        onClick={() => {}}
      />
    </div>
  );
};
