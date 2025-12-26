// src/components/analytics/DepartmentComparisonChart.tsx

"use client";

import React from "react";
import { BaseChart } from "./BaseChart";
import {
  getBaseChartConfig,
  getAxisConfig,
  getPrimaryColors,
} from "./chartConfigs";

interface DepartmentData {
  department: string;
  averageRating: number;
  responseCount: number;
  subjectCount?: number;
  facultyCount?: number;
  engagementScore?: number; // Derived metric combining rating and response rate
}

interface DepartmentComparisonChartProps {
  data: DepartmentData[];
  isLoading?: boolean;
  error?: string | null;
  isDark?: boolean;
  title?: string;
  subtitle?: string;
  height?: number;
  showEngagementScore?: boolean;
}

export const DepartmentComparisonChart: React.FC<
  DepartmentComparisonChartProps
> = ({
  data,
  isLoading = false,
  error = null,
  isDark = false,
  title = "Department Performance Comparison",
  subtitle = "Average ratings and engagement across departments",
  height = 400,
  showEngagementScore = true,
}) => {
  const baseConfig = getBaseChartConfig(isDark);
  const colors = getPrimaryColors();

  const validData = data.filter(
    (item) => item.averageRating > 0 && item.responseCount > 0,
  );

  // Calculate engagement score (combination of rating and response volume)
  const maxResponses = Math.max(...validData.map((d) => d.responseCount));
  const chartData = validData
    .map((item) => ({
      ...item,
      engagementScore:
        item.engagementScore ||
        ((item.averageRating / 5) * 0.7 +
          (item.responseCount / maxResponses) * 0.3) *
          100,
    }))
    .sort((a, b) => b.averageRating - a.averageRating);

  const options = {
    ...baseConfig,
    chart: {
      ...baseConfig.chart,
      type: "bar",
      height,
      stacked: false,
    },
    plotOptions: {
      bar: {
        horizontal: false, // Changed to vertical bars to support multiple Y-axes
        borderRadius: 6,
        dataLabels: {
          position: "top" as const,
        },
        columnWidth: "60%",
      },
    },
    colors: showEngagementScore
      ? [colors[0], colors[2], colors[4]]
      : [colors[0], colors[2]],
    xaxis: {
      ...getAxisConfig(isDark),
      categories:
        chartData.length > 0 ? chartData.map((item) => item.department) : [],
      title: {
        text: "Departments",
        style: {
          color: isDark ? "#98989F" : "#67676C",
          fontSize: "12px",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        },
      },
    },
    yaxis: {
      ...getAxisConfig(isDark),
      title: {
        text: "Normalized Scale (0-10)",
        style: {
          color: isDark ? "#98989F" : "#67676C",
          fontSize: "12px",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        },
      },
      min: 0,
      max: 10,
      tickAmount: 5,
    },
    tooltip: {
      ...baseConfig.tooltip,
      shared: true,
      intersect: false,
      y: [
        {
          formatter: (value: number) => `${value.toFixed(2)}/5.0`,
        },
        {
          formatter: (value: number) => `${value.toLocaleString()} responses`,
        },
        ...(showEngagementScore
          ? [
              {
                formatter: (value: number) => `${value.toFixed(1)}% engagement`,
              },
            ]
          : []),
      ],
    },
    legend: {
      ...baseConfig.legend,
      position: "top" as const,
      horizontalAlign: "center" as const,
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const seriesName = opts.w.config.series[opts.seriesIndex].name;
        if (seriesName === "Average Rating") {
          return val.toFixed(1);
        }
        return val.toLocaleString();
      },
      style: {
        fontSize: "11px",
        fontFamily: "Inter, ui-sans-serif, system-ui",
        colors: [isDark ? "#DFDFD6" : "#3C3C43"],
      },
    },
    grid: {
      ...baseConfig.grid,
      show: true,
      strokeDashArray: 3,
    },
  };

  const series = [
    {
      name: "Average Rating",
      data:
        chartData.length > 0
          ? chartData.map((item) => parseFloat(item.averageRating.toFixed(2)))
          : [],
    },
    {
      name: "Response Count (scaled)",
      data:
        chartData.length > 0
          ? chartData.map((item) => Math.min(item.responseCount / 10, 5))
          : [],
    },
    ...(showEngagementScore && chartData.length > 0
      ? [
          {
            name: "Engagement Score (scaled)",
            data: chartData.map((item) =>
              parseFloat((item.engagementScore / 20).toFixed(1)),
            ),
          },
        ]
      : []),
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
      noDataMessage="No department comparison data available"
    />
  );
};

export default DepartmentComparisonChart;
