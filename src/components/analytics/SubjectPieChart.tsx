// src/components/analytics/SubjectPieChart.tsx

"use client";

import React from "react";
import { BaseChart } from "./BaseChart";
import {
  getBaseChartConfig,
  getPrimaryColors,
  formatRatingTooltip,
} from "./chartConfigs";

// Actual backend subject data structure
interface ActualSubjectData {
  subject: string;
  subjectName?: string;
  lectureType: "LECTURE" | "LAB";
  averageRating: number;
  responseCount: number;
  performanceCategory?: string;
}

interface SubjectPieChartProps {
  data: ActualSubjectData[];
  isLoading?: boolean;
  error?: string | null;
  isDark?: boolean;
  title?: string;
  subtitle?: string;
  height?: number;
  showAsDonut?: boolean;
}

export const SubjectPieChart: React.FC<SubjectPieChartProps> = ({
  data,
  isLoading = false,
  error = null,
  isDark = false,
  title = "Subject Performance Distribution",
  subtitle = "Overall ratings across all subjects",
  height = 300,
  showAsDonut = true,
}) => {
  const baseConfig = getBaseChartConfig(isDark);
  const colors = getPrimaryColors();

  // Aggregate data by subject - combine lecture and lab ratings
  const aggregatedData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const subjectMap = new Map<
      string,
      { totalWeightedRating: number; totalResponses: number }
    >();

    data.forEach((item) => {
      if (item.averageRating > 0 && item.responseCount > 0) {
        if (!subjectMap.has(item.subject)) {
          subjectMap.set(item.subject, {
            totalWeightedRating: 0,
            totalResponses: 0,
          });
        }
        const current = subjectMap.get(item.subject)!;
        // Weight by response count for more accurate aggregation
        current.totalWeightedRating += item.averageRating * item.responseCount;
        current.totalResponses += item.responseCount;
      }
    });

    const result = Array.from(subjectMap.entries()).map(
      ([subject, { totalWeightedRating, totalResponses }]) => ({
        subject,
        averageRating:
          totalResponses > 0 ? totalWeightedRating / totalResponses : 0,
      }),
    );

    return result;
  }, [data]);

  const validData = aggregatedData.filter(
    (subject) => subject.averageRating > 0,
  );

  const options = {
    ...baseConfig,
    chart: {
      ...baseConfig.chart,
      type: "pie",
      height,
    },
    labels: validData.map((subject) => {
      return subject.subject;
    }),
    colors: colors.slice(0, validData.length),
    legend: {
      ...baseConfig.legend,
      position: "bottom" as const,
      horizontalAlign: "center" as const,
      offsetY: 10,
    },
    tooltip: {
      ...baseConfig.tooltip,
      y: {
        formatter: formatRatingTooltip,
      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        const subject = w.globals.labels[dataPointIndex];
        const rating = series[seriesIndex];
        const originalData = data.find((d) => d.subject === subject);

        return `
                    <div class="px-3 py-2">
                        <div class="font-medium">${
                          originalData?.subjectName || subject
                        }</div>
                        <div class="text-sm opacity-75">Code: ${subject}</div>
                        <div class="text-sm">Rating: ${formatRatingTooltip(
                          rating,
                        )}</div>
                        ${
                          originalData?.performanceCategory
                            ? `<div class="text-xs mt-1 opacity-60">${originalData.performanceCategory}</div>`
                            : ""
                        }
                    </div>
                `;
      },
    },
    plotOptions: {
      pie: {
        donut: showAsDonut
          ? {
              size: "45%",
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: "16px",
                  fontFamily: "Inter, ui-sans-serif, system-ui",
                  color: isDark ? "#DFDFD6" : "#3C3C43",
                },
                value: {
                  show: true,
                  fontSize: "14px",
                  fontFamily: "Inter, ui-sans-serif, system-ui",
                  color: isDark ? "#98989F" : "#67676C",
                  formatter: formatRatingTooltip,
                },
                total: {
                  show: true,
                  label: "Average",
                  fontSize: "16px",
                  fontFamily: "Inter, ui-sans-serif, system-ui",
                  color: isDark ? "#DFDFD6" : "#3C3C43",
                  formatter: () => {
                    const total = validData.reduce((sum, subject) => {
                      return sum + subject.averageRating;
                    }, 0);
                    const average = total / validData.length;
                    return average.toFixed(2);
                  },
                },
              },
            }
          : undefined,
        expandOnClick: true,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom" as const,
          },
        },
      },
    ],
  };

  const series = validData.map((subject) => {
    return Math.max(0, Math.min(10, subject.averageRating)); // Ensure rating is between 0-10
  });

  return (
    <BaseChart
      title={title}
      subtitle={subtitle}
      options={options}
      series={series}
      type="pie"
      height={height}
      isLoading={isLoading}
      error={error}
      noDataMessage="No subject data available"
    />
  );
};

export default SubjectPieChart;
