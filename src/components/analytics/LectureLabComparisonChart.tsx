// src/components/analytics/LectureLabComparisonChart.tsx

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

interface LectureLabComparisonChartProps {
  data: ActualSubjectData[];
  isLoading?: boolean;
  error?: string | null;
  isDark?: boolean;
  title?: string;
  subtitle?: string;
  height?: number;
}

export const LectureLabComparisonChart: React.FC<
  LectureLabComparisonChartProps
> = ({
  data,
  isLoading = false,
  error = null,
  isDark = false,
  title = "Lecture vs Lab Performance",
  subtitle = "Comparison of ratings for lectures and labs",
  height = 350,
}) => {
  const baseConfig = getBaseChartConfig(isDark);
  const axisConfig = getAxisConfig(isDark);

  // Aggregate data by subject and type
  const aggregatedData = React.useMemo(() => {
    const subjectMap = new Map<string, { lecture: number; lab: number }>();

    data.forEach((item) => {
      if (!subjectMap.has(item.subject)) {
        subjectMap.set(item.subject, { lecture: 0, lab: 0 });
      }
      const current = subjectMap.get(item.subject)!;
      if (item.lectureType === "LECTURE") {
        current.lecture = item.averageRating;
      } else if (item.lectureType === "LAB") {
        current.lab = item.averageRating;
      }
    });

    return Array.from(subjectMap.entries()).map(([subject, ratings]) => ({
      subject,
      lectureRating: ratings.lecture,
      labRating: ratings.lab,
    }));
  }, [data]);

  const options = {
    ...baseConfig,
    chart: {
      ...baseConfig.chart,
      type: "bar",
      height,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: "60%",
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#3B82F6", "#F59E0B"], // blue for lecture, yellow for lab
    xaxis: {
      ...axisConfig,
      categories: aggregatedData.map((item) => item.subject),
      labels: {
        ...axisConfig.labels,
        rotate: -45,
        maxHeight: 120,
      },
    },
    yaxis: {
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
    },
    tooltip: {
      ...baseConfig.tooltip,
      y: {
        formatter: formatRatingTooltip,
      },
    },
    legend: {
      ...baseConfig.legend,
      position: "top" as const,
      horizontalAlign: "center" as const,
      offsetY: -10,
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "11px",
        fontFamily: "Inter, ui-sans-serif, system-ui",
        colors: [isDark ? "#DFDFD6" : "#3C3C43"],
      },
      offsetY: -20,
      formatter: (value: number) => (value ? value.toFixed(1) : "0"),
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          plotOptions: {
            bar: {
              columnWidth: "80%",
            },
          },
          dataLabels: {
            enabled: false,
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Lecture Rating",
      data: aggregatedData.map((item) => {
        return Math.max(0, Math.min(10, item.lectureRating)); // Ensure rating is between 0-10
      }),
    },
    {
      name: "Lab Rating",
      data: aggregatedData.map((item) => {
        return Math.max(0, Math.min(10, item.labRating)); // Ensure rating is between 0-10
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

export default LectureLabComparisonChart;
