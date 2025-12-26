// src/components/analytics/chartConfigs.ts

export const getBaseChartConfig = (isDark = false) => ({
  chart: {
    fontFamily: "Inter, ui-sans-serif, system-ui",
    background: "transparent",
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 800,
    },
  },
  theme: {
    mode: isDark ? "dark" : "light",
  },
  grid: {
    borderColor: isDark ? "#32363F" : "#E5E7EB",
    strokeDashArray: 3,
    padding: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    },
  },
  tooltip: {
    theme: isDark ? "dark" : "light",
    style: {
      fontSize: "12px",
      fontFamily: "Inter, ui-sans-serif, system-ui",
    },
  },
  legend: {
    labels: {
      colors: isDark ? "#DFDFD6" : "#6B7280",
    },
    fontSize: "12px",
    fontFamily: "Inter, ui-sans-serif, system-ui",
  },
});

export const getAxisConfig = (isDark = false) => ({
  labels: {
    style: {
      colors: isDark ? "#98989F" : "#6B7280",
      fontSize: "12px",
      fontFamily: "Inter, ui-sans-serif, system-ui",
    },
  },
});

export const getPrimaryColors = () => [
  "#f97316", // primary-main (orange)
  "#10B981", // green (positive)
  "#3B82F6", // blue (highlight1)
  "#F59E0B", // yellow (warning)
  "#EF4444", // red (negative)
  "#8B5CF6", // purple (highlight2)
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // repeat primary for consistency
];

export const formatRatingTooltip = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(numValue) ? `${value}` : `${numValue.toFixed(2)}/10.00`;
};

export const formatCountTooltip = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return `${numValue}`;
};
