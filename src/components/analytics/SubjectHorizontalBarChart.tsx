// src/components/analytics/SubjectHorizontalBarChart.tsx

"use client";

import React from "react";
import { BaseChart } from "./BaseChart";
import {
  getBaseChartConfig,
  getAxisConfig,
  formatRatingTooltip,
} from "./chartConfigs";

// Actual backend subject data structure
interface ActualSubjectData {
  subject: string;
  lectureType: "LECTURE" | "LAB";
  averageRating: number;
  responseCount: number;
}

interface SubjectHorizontalBarChartProps {
  data: ActualSubjectData[];
  isLoading?: boolean;
  error?: string | null;
  isDark?: boolean;
  title?: string;
  subtitle?: string;
}

export const SubjectHorizontalBarChart: React.FC<
  SubjectHorizontalBarChartProps
> = ({
  data,
  isLoading = false,
  error = null,
  isDark = false,
  title = "Overall Subject Performance",
  subtitle = "Subjects ranked by overall rating",
}) => {
  const baseConfig = getBaseChartConfig(isDark);
  const axisConfig = getAxisConfig(isDark);

  // Aggregate data by subject - combine lecture and lab ratings
  const aggregatedData = React.useMemo(() => {
    const subjectMap = new Map<
      string,
      { totalRating: number; count: number }
    >();

    data.forEach((item) => {
      if (!subjectMap.has(item.subject)) {
        subjectMap.set(item.subject, { totalRating: 0, count: 0 });
      }
      const current = subjectMap.get(item.subject)!;
      current.totalRating += item.averageRating;
      current.count += 1;
    });

    return Array.from(subjectMap.entries()).map(
      ([subject, { totalRating, count }]) => ({
        subject,
        averageRating: totalRating / count,
      }),
    );
  }, [data]);

  // Calculate dynamic height based on number of subjects
  const height = Math.max(300, aggregatedData.length * 50);

  const options = {
    ...baseConfig,
    chart: {
      ...baseConfig.chart,
      type: "bar",
      height,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "70%",
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#10B981"], // green for positive performance
    xaxis: {
      ...axisConfig,
      min: 0,
      max: 10,
      tickAmount: 5,
      title: {
        text: "Rating (0-10)",
        style: {
          color: isDark ? "#98989F" : "#6B7280",
          fontSize: "12px",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        },
      },
      formatter: (value: string | number) => {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return `${numValue.toFixed(1)}`;
      },
    },
    yaxis: {
      ...axisConfig,
    },
    tooltip: {
      ...baseConfig.tooltip,
      x: {
        formatter: formatRatingTooltip,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontFamily: "Inter, ui-sans-serif, system-ui",
        colors: [isDark ? "#DFDFD6" : "#3C3C43"],
      },
      offsetX: 10,
      formatter: (value: number) => (value ? value.toFixed(1) : "0"),
    },
  };

  const series = [
    {
      name: "Overall Rating",
      data: aggregatedData.map((item) => {
        return {
          x: item.subject,
          y: Math.max(0, Math.min(10, item.averageRating)), // Ensure rating is between 0-10
        };
      }),
    },
  ];

  return (
    <BaseChart
      title={title}
      subtitle={subtitle}
      options={options}
      series={series}
      type="bar"
      height={height}
      isLoading={isLoading}
      error={error}
      noDataMessage="No subject data available"
    />
  );
};

export default SubjectHorizontalBarChart;
