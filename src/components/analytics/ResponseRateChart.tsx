// src/components/analytics/ResponseRateChart.tsx

"use client";

import React from "react";
import { BaseChart } from "./BaseChart";
import {
  getBaseChartConfig,
  getAxisConfig,
  getPrimaryColors,
} from "./chartConfigs";

interface ResponseRateData {
  period: string;
  responseCount: number;
  targetCount?: number;
  responseRate?: number;
}

interface ResponseRateChartProps {
  data: ResponseRateData[];
  isLoading?: boolean;
  error?: string | null;
  isDark?: boolean;
  title?: string;
  subtitle?: string;
  height?: number;
}

export const ResponseRateChart: React.FC<ResponseRateChartProps> = ({
  data,
  isLoading = false,
  error = null,
  isDark = false,
  title = "Response Rate Trends",
  subtitle = "Student engagement over academic periods",
  height = 350,
}) => {
  const baseConfig = getBaseChartConfig(isDark);
  const colors = getPrimaryColors();

  const validData = data.filter((item) => item.responseCount > 0);

  // Calculate response rate if not provided
  const chartData = validData.map((item) => ({
    ...item,
    responseRate:
      item.responseRate ||
      (item.targetCount ? (item.responseCount / item.targetCount) * 100 : 100),
  }));

  const options = {
    ...baseConfig,
    chart: {
      ...baseConfig.chart,
      type: "line",
      height,
    },
    stroke: {
      curve: "smooth" as const,
      width: 3,
    },
    colors: [colors[0], colors[2]],
    xaxis: {
      ...getAxisConfig(isDark),
      categories:
        chartData.length > 0 ? chartData.map((item) => item.period) : [],
      title: {
        text: "Academic Period",
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
        text: "Count / Rate",
        style: {
          color: isDark ? "#98989F" : "#67676C",
          fontSize: "12px",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        },
      },
      min: 0,
    },
    tooltip: {
      ...baseConfig.tooltip,
      shared: true,
      intersect: false,
      y: [
        {
          formatter: (value: number) => `${value.toLocaleString()} responses`,
        },
        {
          formatter: (value: number) => `${value.toFixed(1)}%`,
        },
      ],
    },
    legend: {
      ...baseConfig.legend,
      position: "top" as const,
      horizontalAlign: "right" as const,
    },
    markers: {
      size: 6,
      hover: {
        size: 8,
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
      name: "Total Responses",
      data:
        chartData.length > 0 ? chartData.map((item) => item.responseCount) : [],
    },
    {
      name: "Response Rate",
      data:
        chartData.length > 0 ? chartData.map((item) => item.responseRate) : [],
    },
  ];

  return (
    <BaseChart
      title={title}
      subtitle={subtitle}
      options={options}
      series={series}
      type="line"
      height={height}
      isLoading={isLoading}
      error={error}
      noDataMessage="No response rate data available"
    />
  );
};

export default ResponseRateChart;
