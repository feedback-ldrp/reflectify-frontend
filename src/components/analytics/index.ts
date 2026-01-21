// src/components/analytics/index.ts

export { default as BaseChart } from "./BaseChart";
export { default as TrendLineChart } from "./TrendLineChart";
export { default as TrendAreaChart } from "./TrendAreaChart";
export { default as SubjectPieChart } from "./SubjectPieChart";
export { default as ResponseBarChart } from "./ResponseBarChart";
export { default as SubjectResponseBarChart } from "./SubjectResponseBarChart";
export { default as LectureLabComparisonChart } from "./LectureLabComparisonChart";
export { default as SubjectHorizontalBarChart } from "./SubjectHorizontalBarChart";
export { default as ResponseRateChart } from "./ResponseRateChart";
export { default as DepartmentComparisonChart } from "./DepartmentComparisonChart";

// Drill-down components
export { DrillDownPanel, DrillDownSection, StatCard, RatingBadge } from "./DrillDownPanel";
export { DetailTable, columnRenderers } from "./DetailTable";
export { SubjectDetailPanel, FacultyDetailPanel, DivisionDetailPanel } from "./panels";

export * from "./chartConfigs";

