// src/components/analytics/ResponseBarChart.tsx

"use client";

import React from "react";
import { BaseChart } from "./BaseChart";
import {
  getBaseChartConfig,
  getAxisConfig,
  formatCountTooltip,
} from "./chartConfigs";
import { SemesterWithResponseCount } from "@/interfaces/analytics";

interface ResponseBarChartProps {
  data: SemesterWithResponseCount[];
  isLoading?: boolean;
  error?: string | null;
  isDark?: boolean;
  title?: string;
  subtitle?: string;
  height?: number;
  horizontal?: boolean;
}

export const ResponseBarChart: React.FC<ResponseBarChartProps> = ({
  data,
  isLoading = false,
  error = null,
  isDark = false,
  title = "Response Counts by Semester",
  subtitle = "Number of feedback responses received",
  height = 350,
  horizontal = false,
}) => {
  const baseConfig = getBaseChartConfig(isDark);
  const axisConfig = getAxisConfig(isDark);

  const options = {
    ...baseConfig,
    chart: {
      ...baseConfig.chart,
      type: "bar",
      height,
    },
    plotOptions: {
      bar: {
        horizontal,
        borderRadius: 4,
        columnWidth: horizontal ? undefined : "60%",
        barHeight: horizontal ? "70%" : undefined,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#10B981"], // positive green color
    xaxis: {
      ...axisConfig,
      categories: data.map(
        (sem) =>
          `Semester ${sem.semesterNumber} (${sem.academicYear.yearString})`,
      ),
      labels: {
        ...axisConfig.labels,
        rotate: horizontal ? 0 : -45,
        maxHeight: 120,
      },
    },
    yaxis: {
      ...axisConfig,
      title: {
        text: horizontal ? "Semesters" : "Number of Responses",
        style: {
          color: isDark ? "#98989F" : "#6B7280",
          fontSize: "12px",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        },
      },
    },
    tooltip: {
      ...baseConfig.tooltip,
      y: {
        formatter: formatCountTooltip,
      },
    },
  };

  const series = [
    {
      name: "Response Count",
      data: data.map((sem) => sem.responseCount),
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
      noDataMessage="No response data available"
    />
  );
};

export default ResponseBarChart;
