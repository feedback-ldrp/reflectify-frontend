// src/components/analytics/TrendAreaChart.tsx

"use client";

import React from "react";
import { BaseChart } from "./BaseChart";
import {
  getBaseChartConfig,
  getAxisConfig,
  formatRatingTooltip,
} from "./chartConfigs";

// Actual backend trend data structure
interface ActualTrendData {
  semester: number;
  subject: string;
  averageRating: number;
  responseCount: number;
}

interface TrendAreaChartProps {
  data: ActualTrendData[];
  isLoading?: boolean;
  error?: string | null;
  isDark?: boolean;
  title?: string;
  subtitle?: string;
  height?: number;
}

export const TrendAreaChart: React.FC<TrendAreaChartProps> = ({
  data,
  isLoading = false,
  error = null,
  isDark = false,
  title = "Rating Trends Over Time",
  subtitle = "Visual representation of performance trends",
  height = 400,
}) => {
  const baseConfig = getBaseChartConfig(isDark);
  const axisConfig = getAxisConfig(isDark);

  const options = {
    ...baseConfig,
    chart: {
      ...baseConfig.chart,
      type: "area",
      height,
      zoom: { enabled: false },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#f97316",
            opacity: 0.7,
          },
          {
            offset: 100,
            color: "#f97316",
            opacity: 0.2,
          },
        ],
      },
    },
    colors: ["#f97316"],
    stroke: {
      curve: "smooth" as const,
      width: 3,
    },
    xaxis: {
      ...axisConfig,
      categories: data.map(
        (trend) => `${trend.subject}\n(Semester ${trend.semester})`,
      ),
    },
    yaxis: {
      ...axisConfig,
      min: 0,
      max: 10,
      tickAmount: 5,
      formatter: (value: string | number) => {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return `${numValue.toFixed(1)}`;
      },
      title: {
        text: "Rating (0-10)",
        style: {
          color: isDark ? "#98989F" : "#6B7280",
          fontSize: "12px",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        },
      },
    },
    markers: {
      size: 6,
      colors: ["#f97316"],
      strokeColors: isDark ? "#1B1B1F" : "#ffffff",
      strokeWidth: 2,
      hover: {
        size: 8,
        sizeOffset: 2,
      },
    },
    tooltip: {
      ...baseConfig.tooltip,
      y: {
        formatter: formatRatingTooltip,
      },
    },
  };

  const series = [
    {
      name: "Average Rating",
      data: data.map((trend) => trend.averageRating),
    },
  ];

  return (
    <BaseChart
      title={title}
      subtitle={subtitle}
      options={options}
      series={series}
      type="area"
      height={height}
      isLoading={isLoading}
      error={error}
      noDataMessage="No trend data available"
    />
  );
};

export default TrendAreaChart;
