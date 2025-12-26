// src/components/analytics/SubjectResponseBarChart.tsx

"use client";

import React from "react";
import { BaseChart } from "./BaseChart";
import {
  getBaseChartConfig,
  getAxisConfig,
  formatCountTooltip,
} from "./chartConfigs";

interface SubjectResponseData {
  subject: string;
  subjectName: string;
  lectureType: "LECTURE" | "LAB";
  responseCount: number;
  averageRating: number;
}

interface SubjectResponseBarChartProps {
  data: SubjectResponseData[];
  isLoading?: boolean;
  error?: string | null;
  isDark?: boolean;
  title?: string;
  subtitle?: string;
  height?: number;
  horizontal?: boolean;
  showLectureTypeGrouping?: boolean;
}

export const SubjectResponseBarChart: React.FC<
  SubjectResponseBarChartProps
> = ({
  data,
  isLoading = false,
  error = null,
  isDark = false,
  title = "Response Count Distribution",
  subtitle = "Number of feedback responses by subject",
  height = 350,
  horizontal = false,
  showLectureTypeGrouping = true,
}) => {
  const baseConfig = getBaseChartConfig(isDark);
  const axisConfig = getAxisConfig(isDark);

  // Process data for grouping by lecture type if enabled
  const processedData = React.useMemo(() => {
    if (!showLectureTypeGrouping) {
      // Aggregate lecture and lab counts per subject
      const aggregated = data.reduce(
        (acc: Map<string, SubjectResponseData>, item) => {
          const existing = acc.get(item.subject);
          if (existing) {
            existing.responseCount += item.responseCount;
            // Keep the higher average rating or compute weighted average
            existing.averageRating = Math.max(
              existing.averageRating,
              item.averageRating,
            );
          } else {
            acc.set(item.subject, { ...item });
          }
          return acc;
        },
        new Map(),
      );

      return Array.from(aggregated.values()).sort(
        (a, b) => b.responseCount - a.responseCount,
      );
    }

    return data;
  }, [data, showLectureTypeGrouping]);

  const categories = showLectureTypeGrouping
    ? [...new Set(processedData.map((item) => item.subject))]
    : processedData.map((item) => item.subject);

  const series = showLectureTypeGrouping
    ? [
        {
          name: "LECTURE",
          data: categories.map((subject) => {
            const lectureData = processedData.find(
              (d) => d.subject === subject && d.lectureType === "LECTURE",
            );
            return lectureData?.responseCount || 0;
          }),
        },
        {
          name: "LAB",
          data: categories.map((subject) => {
            const labData = processedData.find(
              (d) => d.subject === subject && d.lectureType === "LAB",
            );
            return labData?.responseCount || 0;
          }),
        },
      ]
    : [
        {
          name: "Response Count",
          data: processedData.map((item) => item.responseCount),
        },
      ];

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
        horizontal,
        borderRadius: 4,
        columnWidth: horizontal ? undefined : "70%",
        barHeight: horizontal ? "60%" : undefined,
        dataLabels: {
          position: "top" as const,
        },
      },
    },
    colors: showLectureTypeGrouping ? ["#3B82F6", "#10B981"] : ["#6366F1"],
    xaxis: {
      ...axisConfig,
      categories: categories,
      labels: {
        ...axisConfig.labels,
        rotate: horizontal ? 0 : -45,
        maxHeight: horizontal ? undefined : 120,
      },
    },
    yaxis: {
      ...axisConfig,
      title: {
        text: "Response Count",
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
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        const category = w.globals.labels[dataPointIndex];
        const value = series[seriesIndex];
        const dataItem = processedData.find((d) => d.subject === category);

        return `
                    <div class="px-3 py-2">
                        <div class="font-medium">${
                          dataItem?.subjectName || category
                        }</div>
                        <div class="text-sm opacity-75">Code: ${category}</div>
                        <div class="text-sm">${formatCountTooltip(value)}</div>
                        ${
                          dataItem?.averageRating
                            ? `<div class="text-xs mt-1 opacity-60">Avg Rating: ${dataItem.averageRating.toFixed(
                                2,
                              )}</div>`
                            : ""
                        }
                    </div>
                `;
      },
    },
    legend: {
      ...baseConfig.legend,
      show: showLectureTypeGrouping,
      position: "top" as const,
      horizontalAlign: "center" as const,
    },
    dataLabels: {
      enabled: true,
      formatter: formatCountTooltip,
      style: {
        fontSize: "10px",
        fontFamily: "Inter, ui-sans-serif, system-ui",
        colors: [isDark ? "#DFDFD6" : "#374151"],
      },
    },
  };

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

export default SubjectResponseBarChart;
