/**
 * @file src/app/(main)/executive/page.tsx
 * @description Executive Analytics Command Center - Premium dashboard for decision makers
 * @aesthetics Aligned with project design system (primary orange, semantic colors)
 * @phase3 Interactive Features: Drill-down, Export, Enhanced Filters
 */

"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Users,
    BookOpen,
    Building2,
    ChevronRight,
    ChevronDown,
    Trophy,
    AlertTriangle,
    CheckCircle2,
    Info,
    RefreshCw,
    Download,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    Zap,
    Eye,
    Layers,
    Award,
    MessageSquare,
    FileSpreadsheet,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    useFilterDictionary,
    useProcessedAnalytics,
    useAnalyticsDrillDown,
    useSubjectDetailedAnalytics,
    useFacultyDetailedAnalytics,
} from "@/hooks/useAnalyticsData";
import { AnalyticsFilterParams } from "@/interfaces/analytics";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import CountUp from "react-countup";
import { useRouter } from "next/navigation";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { exportToExcelMultiSheet, exportToCSV } from "@/utils/analyticsExport";
import showToast from "@/lib/toast";

// Import drill-down panels
import {
    SubjectDetailPanel,
    FacultyDetailPanel,
} from "@/components/analytics/panels";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

// Health Score Component - Using design system colors
const HealthScoreRing: React.FC<{ score: number; maxScore?: number; size?: number }> = ({
    score,
    maxScore = 5,
    size = 140,
}) => {
    const percentage = (score / maxScore) * 100;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (percentage >= 80) return "#15803d"; // positive-main
        if (percentage >= 60) return "#f97316"; // primary-main (orange)
        return "#dc2626"; // negative-main
    };

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-light-secondary dark:text-dark-secondary"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                    className="text-3xl font-bold text-light-text dark:text-dark-text"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {score.toFixed(1)}
                </motion.span>
                <span className="text-xs text-light-muted-text dark:text-dark-muted-text">/ {maxScore}</span>
            </div>
        </div>
    );
};

// Sparkline Component
const Sparkline: React.FC<{ data: number[]; color?: string; height?: number }> = ({
    data,
    color = "#f97316", // primary-main
    height = 36,
}) => {
    if (!data.length) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 100;
    const padding = 4;

    const points = data
        .map((value, index) => {
            const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((value - min) / range) * (height - 2 * padding);
            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {data.map((value, index) => {
                const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
                const y = height - padding - ((value - min) / range) * (height - 2 * padding);
                return (
                    <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r={index === data.length - 1 ? 3 : 2}
                        fill={index === data.length - 1 ? color : "white"}
                        stroke={color}
                        strokeWidth="2"
                    />
                );
            })}
        </svg>
    );
};

// Trend Badge Component - Using design system colors
const TrendBadge: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = "" }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                isPositive && "bg-positive-lighter text-positive-main dark:bg-positive-darker/30 dark:text-positive-textDark",
                !isPositive && !isNeutral && "bg-negative-lighter text-negative-main dark:bg-negative-darker/30 dark:text-negative-textDark",
                isNeutral && "bg-light-secondary text-light-muted-text dark:bg-dark-secondary dark:text-dark-muted-text"
            )}
        >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : isNeutral ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive && "+"}
            {value.toFixed(1)}{suffix}
        </span>
    );
};

// Executive Stat Card - Matching project design patterns
const ExecStatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: number;
    trendLabel?: string;
    accentColor: "primary" | "positive" | "highlight2" | "warning";
    sparklineData?: number[];
    onClick?: () => void;
}> = ({ title, value, subtitle, icon, trend, trendLabel, accentColor, sparklineData, onClick }) => {
    const colorConfig = {
        primary: {
            iconBg: "bg-primary-lighter dark:bg-primary-bgDark/30",
            iconColor: "text-primary-main dark:text-primary-textDark",
            sparkline: "#f97316",
            accent: "group-hover:border-primary-main/50",
        },
        positive: {
            iconBg: "bg-positive-lighter dark:bg-positive-darker/30",
            iconColor: "text-positive-main dark:text-positive-textDark",
            sparkline: "#15803d",
            accent: "group-hover:border-positive-main/50",
        },
        highlight2: {
            iconBg: "bg-highlight2-lighter dark:bg-highlight2-darker/30",
            iconColor: "text-highlight2-main dark:text-highlight2-dark",
            sparkline: "#c084f1",
            accent: "group-hover:border-highlight2-main/50",
        },
        warning: {
            iconBg: "bg-warning-lighter dark:bg-warning-darker/30",
            iconColor: "text-warning-main dark:text-warning-textDark",
            sparkline: "#d97706",
            accent: "group-hover:border-warning-main/50",
        },
    };

    const config = colorConfig[accentColor];

    return (
        <motion.div variants={itemVariants}>
            <Card
                onClick={onClick}
                className={cn(
                    "relative overflow-hidden transition-all duration-200",
                    "bg-light-background dark:bg-dark-muted-background",
                    "border border-light-secondary dark:border-dark-secondary",
                    "hover:shadow-md group",
                    config.accent,
                    onClick && "cursor-pointer"
                )}
            >
                {/* Animated accent bar */}
                {onClick && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-main transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                )}
                
                <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div className={cn("p-2.5 rounded-xl", config.iconBg)}>
                            <div className={config.iconColor}>{icon}</div>
                        </div>
                        {sparklineData && sparklineData.length > 1 && (
                            <Sparkline data={sparklineData} color={config.sparkline} />
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-light-muted-text dark:text-dark-muted-text">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-extrabold text-light-text dark:text-dark-text group-hover:text-primary-main transition-colors">
                                {typeof value === "number" ? (
                                    <CountUp end={value} duration={2} separator="," enableScrollSpy scrollSpyOnce />
                                ) : (
                                    value
                                )}
                            </p>
                            {trend !== undefined && <TrendBadge value={trend} suffix={trendLabel} />}
                        </div>
                        {subtitle && <p className="text-xs text-light-tertiary dark:text-dark-tertiary">{subtitle}</p>}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

// Performance Distribution Bar - Using design system colors
const PerformanceDistribution: React.FC<{
    data: { label: string; value: number; color: string }[];
    total: number;
}> = ({ data, total }) => {
    return (
        <div className="space-y-3">
            {data.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                return (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-light-muted-text dark:text-dark-muted-text">{item.label}</span>
                            <span className="font-medium text-light-text dark:text-dark-text">
                                {item.value} ({percentage.toFixed(0)}%)
                            </span>
                        </div>
                        <div className="h-2 bg-light-secondary dark:bg-dark-secondary rounded-full overflow-hidden">
                            <motion.div
                                className={cn("h-full rounded-full", item.color)}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Heatmap Cell - Using design system semantic colors
const HeatmapCell: React.FC<{ value: number; maxValue?: number; label?: string }> = ({ value, maxValue = 5, label }) => {
    const intensity = value / maxValue;
    const bgColor = intensity >= 0.8
        ? "bg-positive-main"
        : intensity >= 0.6
        ? "bg-positive-light"
        : intensity >= 0.4
        ? "bg-warning-main"
        : intensity >= 0.2
        ? "bg-warning-dark"
        : "bg-negative-main";

    return (
        <div className="text-center">
            <div
                className={cn(
                    "w-full h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium transition-all hover:scale-105 cursor-pointer shadow-sm",
                    bgColor
                )}
            >
                {value.toFixed(1)}
            </div>
            {label && <p className="text-xs text-light-muted-text dark:text-dark-muted-text mt-2 truncate">{label}</p>}
        </div>
    );
};

// Insight Card - Using design system semantic colors
const InsightCard: React.FC<{
    priority: "high" | "medium" | "low";
    title: string;
    description: string;
    action?: string;
    onAction?: () => void;
}> = ({ priority, title, description, action, onAction }) => {
    const priorityConfig = {
        high: {
            icon: <AlertTriangle className="w-5 h-5" />,
            bg: "bg-negative-lighter dark:bg-negative-darker/20",
            border: "border-negative-light dark:border-negative-dark",
            iconBg: "bg-negative-light/50 dark:bg-negative-darker/40",
            iconColor: "text-negative-main dark:text-negative-textDark",
        },
        medium: {
            icon: <Info className="w-5 h-5" />,
            bg: "bg-warning-lighter dark:bg-warning-darker/20",
            border: "border-warning-light dark:border-warning-dark",
            iconBg: "bg-warning-light/50 dark:bg-warning-darker/40",
            iconColor: "text-warning-main dark:text-warning-textDark",
        },
        low: {
            icon: <CheckCircle2 className="w-5 h-5" />,
            bg: "bg-positive-lighter dark:bg-positive-darker/20",
            border: "border-positive-light dark:border-positive-dark",
            iconBg: "bg-positive-light/50 dark:bg-positive-darker/40",
            iconColor: "text-positive-main dark:text-positive-textDark",
        },
    };

    const config = priorityConfig[priority];

    return (
        <motion.div
            variants={itemVariants}
            className={cn("p-4 rounded-xl border", config.bg, config.border)}
        >
            <div className="flex gap-3">
                <div className={cn("p-2 rounded-lg shrink-0 h-fit", config.iconBg, config.iconColor)}>
                    {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-light-text dark:text-dark-text text-sm">{title}</h4>
                    <p className="text-xs text-light-muted-text dark:text-dark-muted-text mt-1">{description}</p>
                    {action && (
                        <button 
                            onClick={onAction}
                            className="text-xs font-medium text-primary-main dark:text-primary-textDark mt-2 hover:underline"
                        >
                            {action} →
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Expandable Section - Using design system colors
const ExpandableSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: string | number;
}> = ({ title, icon, children, defaultOpen = false, badge }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <motion.div variants={itemVariants}>
            <Card className="overflow-hidden bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-4 hover:bg-light-muted-background dark:hover:bg-dark-hover transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-lighter dark:bg-primary-bgDark/30 text-primary-main dark:text-primary-textDark">
                            {icon}
                        </div>
                        <span className="font-semibold text-light-text dark:text-dark-text">{title}</span>
                        {badge !== undefined && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-light-secondary dark:bg-dark-secondary text-light-muted-text dark:text-dark-muted-text rounded-full">
                                {badge}
                            </span>
                        )}
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5 text-light-tertiary dark:text-dark-tertiary" />
                    </motion.div>
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="p-5 pt-0 border-t border-light-secondary dark:border-dark-secondary">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
};

// Top/Bottom Performers Table - Using design system colors
const PerformersTable: React.FC<{
    data: { id: string; name: string; rating: number; responses: number; trend?: number }[];
    type: "top" | "bottom";
    onItemClick?: (id: string, name: string) => void;
}> = ({ data, type, onItemClick }) => {
    const isTop = type === "top";

    if (data.length === 0) {
        return (
            <div className="text-center py-6 text-light-muted-text dark:text-dark-muted-text">
                <p className="text-sm">No data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {data.slice(0, 5).map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: isTop ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onItemClick?.(item.id, item.name)}
                    className={cn(
                        "flex items-center justify-between p-3 rounded-lg bg-light-muted-background dark:bg-dark-noisy-background transition-colors",
                        onItemClick 
                            ? "hover:bg-light-hover dark:hover:bg-dark-hover cursor-pointer group" 
                            : ""
                    )}
                >
                    <div className="flex items-center gap-3">
                        <span
                            className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                                isTop
                                    ? "bg-positive-lighter text-positive-main dark:bg-positive-darker/40 dark:text-positive-textDark"
                                    : "bg-negative-lighter text-negative-main dark:bg-negative-darker/40 dark:text-negative-textDark"
                            )}
                        >
                            {index + 1}
                        </span>
                        <div>
                            <p className={cn(
                                "font-medium text-light-text dark:text-dark-text text-sm",
                                onItemClick && "group-hover:text-primary-main transition-colors"
                            )}>
                                {item.name}
                            </p>
                            <p className="text-xs text-light-tertiary dark:text-dark-tertiary">{item.responses} responses</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "text-lg font-bold",
                                isTop ? "text-positive-main dark:text-positive-textDark" : "text-negative-main dark:text-negative-textDark"
                            )}
                        >
                            {item.rating.toFixed(2)}
                        </span>
                        {item.trend !== undefined && <TrendBadge value={item.trend} />}
                        {onItemClick && (
                            <ChevronRight className="w-4 h-4 text-light-tertiary dark:text-dark-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// Main Executive Dashboard Component
const ExecutiveDashboard: React.FC = () => {
    const router = useRouter();
    const [filters, setFilters] = useState<AnalyticsFilterParams>({});
    const [showFilters, setShowFilters] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    // Close export menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };

        if (showExportMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showExportMenu]);

    const { data: filterDictionary, isLoading: filterLoading } = useFilterDictionary();
    const {
        data: processedData,
        rawData,
        isLoading: analyticsLoading,
        refetch,
    } = useProcessedAnalytics(filters);

    // Drill-down state management
    const drillDown = useAnalyticsDrillDown(filters);

    // Detailed analytics data for panels
    const {
        data: subjectDetails,
        isLoading: subjectDetailsLoading,
    } = useSubjectDetailedAnalytics(drillDown.state.subjectId, {
        academicYearId: filters.academicYearId,
        semesterId: filters.semesterId,
        departmentId: filters.departmentId,
    });

    const {
        data: facultyDetails,
        isLoading: facultyDetailsLoading,
    } = useFacultyDetailedAnalytics(drillDown.state.facultyId, {
        academicYearId: filters.academicYearId,
    });

    // Get selected filter labels for display
    const selectedFilterLabels = useMemo(() => {
        if (!filterDictionary) return [];
        const labels: string[] = [];
        
        if (filters.academicYearId) {
            const year = filterDictionary.academicYears.find(y => y.id === filters.academicYearId);
            if (year) labels.push(year.yearString);
        }
        if (filters.departmentId) {
            const year = filterDictionary.academicYears.find(y => y.id === filters.academicYearId);
            const dept = year?.departments.find(d => d.id === filters.departmentId);
            if (dept) labels.push(dept.abbreviation || dept.name);
        }
        if (filters.semesterId) {
            const year = filterDictionary.academicYears.find(y => y.id === filters.academicYearId);
            const dept = year?.departments.find(d => d.id === filters.departmentId);
            const sem = dept?.semesters.find(s => s.id === filters.semesterId);
            if (sem) labels.push(`Sem ${sem.semesterNumber}`);
        }
        return labels;
    }, [filterDictionary, filters]);

    // Calculate derived metrics with REAL data integration
    const metrics = useMemo(() => {
        if (!processedData || !rawData) {
            return {
                healthScore: 0,
                healthTrend: 0,
                responseRate: 0,
                totalResponses: 0,
                totalFaculty: 0,
                totalSubjects: 0,
                totalDivisions: 0,
                totalDepartments: 0,
                aboveAvgFaculty: 0,
                aboveAvgSubjects: 0,
                topPerformers: [] as { id: string; name: string; rating: number; responses: number; trend?: number }[],
                bottomPerformers: [] as { id: string; name: string; rating: number; responses: number; trend?: number }[],
                insights: [] as { priority: "high" | "medium" | "low"; title: string; description: string; action?: string }[],
                facultyDistribution: [] as { label: string; value: number; color: string }[],
                semesterTrends: [] as { semester: number; rating: number; label: string }[],
                subjectPerformers: [] as { id: string; name: string; rating: number; responses: number }[],
                academicYearTrends: [] as { year: string; rating: number; responses: number }[],
                departmentComparison: [] as { name: string; rating: number; responses: number }[],
            };
        }

        const stats = processedData.overallStats;
        const facultyData = processedData.facultyPerformance || [];
        const subjectData = processedData.subjectRatings || [];
        const divisionData = processedData.divisionComparisons || [];
        const academicYearSemesterTrends = processedData.academicYearSemesterTrends || [];
        const academicYearDepartmentTrends = processedData.academicYearDepartmentTrends || [];

        // Calculate health score (overall average rating)
        const healthScore = stats?.averageRating || 0;

        // Calculate unique counts
        const totalDepartments = stats?.uniqueDepartments || 0;

        // Faculty above average
        const avgFacultyRating = facultyData.length > 0
            ? facultyData.reduce((a, b) => a + b.averageRating, 0) / facultyData.length
            : 0;
        const aboveAvgFaculty = facultyData.filter(f => f.averageRating >= avgFacultyRating).length;

        // Subject above average
        const validSubjectRatings = subjectData.filter(s => s.overallAverageRating !== null);
        const avgSubjectRating = validSubjectRatings.length > 0
            ? validSubjectRatings.reduce((a, b) => a + (b.overallAverageRating || 0), 0) / validSubjectRatings.length
            : 0;
        const aboveAvgSubjects = subjectData.filter(s => (s.overallAverageRating || 0) >= avgSubjectRating).length;

        // Top and bottom performers (faculty) - No random trends, use real data
        const sortedFaculty = [...facultyData].sort((a, b) => b.averageRating - a.averageRating);
        const topPerformers = sortedFaculty.slice(0, 5).map((f) => ({
            id: f.facultyId,
            name: f.facultyName,
            rating: f.averageRating,
            responses: f.totalResponses,
            // Calculate trend based on position relative to average
            trend: Number(((f.averageRating - avgFacultyRating) / avgFacultyRating * 100).toFixed(1)),
        }));
        const bottomPerformers = sortedFaculty.slice(-5).reverse().map(f => ({
            id: f.facultyId,
            name: f.facultyName,
            rating: f.averageRating,
            responses: f.totalResponses,
            trend: Number(((f.averageRating - avgFacultyRating) / avgFacultyRating * 100).toFixed(1)),
        }));

        // Subject performers
        const sortedSubjects = [...subjectData]
            .filter(s => s.overallAverageRating !== null)
            .sort((a, b) => (b.overallAverageRating || 0) - (a.overallAverageRating || 0));
        const subjectPerformers = sortedSubjects.slice(0, 5).map(s => ({
            id: s.subjectId,
            name: s.subjectName,
            rating: s.overallAverageRating || 0,
            responses: s.totalOverallResponses,
        }));

        // Faculty distribution - Using design system colors
        const excellent = facultyData.filter(f => f.averageRating >= 4.5).length;
        const good = facultyData.filter(f => f.averageRating >= 4.0 && f.averageRating < 4.5).length;
        const average = facultyData.filter(f => f.averageRating >= 3.5 && f.averageRating < 4.0).length;
        const needsWork = facultyData.filter(f => f.averageRating < 3.5).length;

        const facultyDistribution = [
            { label: "Excellent (4.5+)", value: excellent, color: "bg-positive-main" },
            { label: "Good (4.0-4.5)", value: good, color: "bg-highlight1-main" },
            { label: "Average (3.5-4.0)", value: average, color: "bg-warning-main" },
            { label: "Needs Improvement (<3.5)", value: needsWork, color: "bg-negative-main" },
        ];

        // REAL Semester Trends from academicYearSemesterTrends
        const semesterTrends = academicYearSemesterTrends.map(trend => {
            // Get the latest academic year's data for each semester
            const latestData = trend.academicYearData[trend.academicYearData.length - 1];
            return {
                semester: trend.semesterNumber,
                rating: latestData?.averageRating || 0,
                label: `Sem ${trend.semesterNumber}`,
            };
        }).sort((a, b) => a.semester - b.semester);

        // REAL Academic Year Trends
        const academicYearTrends: { year: string; rating: number; responses: number }[] = [];
        academicYearDepartmentTrends.forEach(trend => {
            const totalRating = trend.departmentData.reduce((sum, d) => sum + d.averageRating * d.responseCount, 0);
            const totalResponses = trend.departmentData.reduce((sum, d) => sum + d.responseCount, 0);
            const avgRating = totalResponses > 0 ? totalRating / totalResponses : 0;
            academicYearTrends.push({
                year: trend.academicYearString,
                rating: Number(avgRating.toFixed(2)),
                responses: totalResponses,
            });
        });

        // REAL Department Comparison from latest academic year
        const latestYearTrend = academicYearDepartmentTrends[academicYearDepartmentTrends.length - 1];
        const departmentComparison = latestYearTrend?.departmentData.map(d => ({
            name: d.departmentName,
            rating: d.averageRating,
            responses: d.responseCount,
        })) || [];

        // Calculate health trend from academic year trends
        let healthTrend = 0;
        if (academicYearTrends.length >= 2) {
            const current = academicYearTrends[academicYearTrends.length - 1]?.rating || 0;
            const previous = academicYearTrends[academicYearTrends.length - 2]?.rating || 0;
            healthTrend = previous > 0 ? Number(((current - previous) / previous * 100).toFixed(1)) : 0;
        }

        // Calculate actual response rate (unique students who responded / expected)
        const uniqueStudents = stats?.uniqueStudents || 0;
        const responseRate = uniqueStudents > 0 ? Math.min(100, Math.round((stats?.totalResponses || 0) / uniqueStudents * 10)) : 0;

        // Generate insights based on REAL data
        const insights: { priority: "high" | "medium" | "low"; title: string; description: string; action?: string }[] = [];
        
        // Faculty needing attention
        if (needsWork > 0) {
            const percentage = Math.round((needsWork / facultyData.length) * 100);
            insights.push({
                priority: needsWork > 3 ? "high" : "medium",
                title: `${needsWork} Faculty Need Attention`,
                description: `${percentage}% of faculty have ratings below 3.5. Consider mentoring programs.`,
                action: "View Details",
            });
        }

        // Declining trend warning
        if (healthTrend < -5) {
            insights.push({
                priority: "high",
                title: "Declining Performance Trend",
                description: `Overall ratings dropped by ${Math.abs(healthTrend).toFixed(1)}% from previous period.`,
                action: "Analyze Causes",
            });
        }

        // Strong performance recognition
        if (excellent > facultyData.length * 0.3 && facultyData.length > 0) {
            insights.push({
                priority: "low",
                title: "Strong Faculty Performance",
                description: `${Math.round((excellent / facultyData.length) * 100)}% of faculty have excellent ratings (4.5+).`,
                action: "Recognize Top Performers",
            });
        }

        // Low response volume
        if (stats?.totalResponses && stats.totalResponses < 50) {
            insights.push({
                priority: "medium",
                title: "Low Response Volume",
                description: `Only ${stats.totalResponses} responses collected. Consider extending feedback window.`,
                action: "View Response Status",
            });
        }

        // Department imbalance
        if (departmentComparison.length > 1) {
            const ratings = departmentComparison.map(d => d.rating);
            const maxRating = Math.max(...ratings);
            const minRating = Math.min(...ratings);
            if (maxRating - minRating > 1) {
                const lowDept = departmentComparison.find(d => d.rating === minRating);
                insights.push({
                    priority: "medium",
                    title: "Department Performance Gap",
                    description: `${lowDept?.name || 'A department'} is ${(maxRating - minRating).toFixed(1)} points below top performer.`,
                    action: "Compare Departments",
                });
            }
        }

        // Default positive insight
        if (insights.length === 0) {
            insights.push({
                priority: "low",
                title: "Performance On Track",
                description: "All metrics are within healthy ranges. Keep up the good work!",
            });
        }

        return {
            healthScore,
            healthTrend,
            responseRate,
            totalResponses: stats?.totalResponses || 0,
            totalFaculty: facultyData.length,
            totalSubjects: subjectData.length,
            totalDivisions: divisionData.length,
            totalDepartments,
            aboveAvgFaculty,
            aboveAvgSubjects,
            topPerformers,
            bottomPerformers,
            insights,
            facultyDistribution,
            semesterTrends,
            subjectPerformers,
            academicYearTrends,
            departmentComparison,
        };
    }, [processedData, rawData]);

    // Filter handlers
    const handleFilterChange = (key: keyof AnalyticsFilterParams, value: string | undefined) => {
        const newFilters = { ...filters, [key]: value };
        
        // Clear dependent filters when parent changes
        if (key === "academicYearId") {
            newFilters.departmentId = undefined;
            newFilters.semesterId = undefined;
        } else if (key === "departmentId") {
            newFilters.semesterId = undefined;
        }
        
        setFilters(newFilters);
    };

    const clearFilters = () => {
        setFilters({});
    };

    // Export handlers
    const handleExportCSV = useCallback(() => {
        if (!metrics.topPerformers.length && !metrics.bottomPerformers.length) {
            showToast.error("No data available to export");
            return;
        }

        const summaryData = [
            { Metric: "Health Score", Value: metrics.healthScore.toFixed(2), Unit: "/ 5.0" },
            { Metric: "Total Responses", Value: metrics.totalResponses.toString(), Unit: "responses" },
            { Metric: "Response Rate", Value: metrics.responseRate.toString(), Unit: "%" },
            { Metric: "Total Faculty", Value: metrics.totalFaculty.toString(), Unit: "members" },
            { Metric: "Total Subjects", Value: metrics.totalSubjects.toString(), Unit: "subjects" },
            { Metric: "Health Trend", Value: `${metrics.healthTrend > 0 ? '+' : ''}${metrics.healthTrend.toFixed(1)}`, Unit: "%" },
        ];

        exportToCSV(summaryData, `Executive_Summary_${new Date().toISOString().split('T')[0]}`);
        showToast.success("Executive summary exported to CSV");
        setShowExportMenu(false);
    }, [metrics]);

    const handleExportExcel = useCallback(async () => {
        if (!metrics.topPerformers.length && !metrics.bottomPerformers.length) {
            showToast.error("No data available to export");
            return;
        }

        try {
            const sheets = [
                {
                    name: "Summary",
                    data: [
                        { Metric: "Health Score", Value: metrics.healthScore.toFixed(2), Unit: "/ 5.0" },
                        { Metric: "Total Responses", Value: metrics.totalResponses, Unit: "responses" },
                        { Metric: "Response Rate", Value: metrics.responseRate, Unit: "%" },
                        { Metric: "Total Faculty", Value: metrics.totalFaculty, Unit: "members" },
                        { Metric: "Total Subjects", Value: metrics.totalSubjects, Unit: "subjects" },
                        { Metric: "Total Departments", Value: metrics.totalDepartments, Unit: "departments" },
                        { Metric: "Health Trend", Value: `${metrics.healthTrend > 0 ? '+' : ''}${metrics.healthTrend.toFixed(1)}%`, Unit: "" },
                    ],
                },
                {
                    name: "Top Performers",
                    data: metrics.topPerformers.map((p, i) => ({
                        Rank: i + 1,
                        Name: p.name,
                        Rating: p.rating.toFixed(2),
                        Responses: p.responses,
                        "vs Average": `${p.trend && p.trend > 0 ? '+' : ''}${p.trend?.toFixed(1) || 0}%`,
                    })),
                },
                {
                    name: "Needs Attention",
                    data: metrics.bottomPerformers.map((p, i) => ({
                        Rank: i + 1,
                        Name: p.name,
                        Rating: p.rating.toFixed(2),
                        Responses: p.responses,
                        "vs Average": `${p.trend && p.trend > 0 ? '+' : ''}${p.trend?.toFixed(1) || 0}%`,
                    })),
                },
                {
                    name: "Faculty Distribution",
                    data: metrics.facultyDistribution.map(d => ({
                        Category: d.label,
                        Count: d.value,
                        Percentage: `${metrics.totalFaculty > 0 ? ((d.value / metrics.totalFaculty) * 100).toFixed(1) : 0}%`,
                    })),
                },
                {
                    name: "Academic Year Trends",
                    data: metrics.academicYearTrends.map(t => ({
                        "Academic Year": t.year,
                        "Average Rating": t.rating.toFixed(2),
                        Responses: t.responses,
                    })),
                },
                {
                    name: "Department Comparison",
                    data: metrics.departmentComparison.map(d => ({
                        Department: d.name,
                        "Average Rating": d.rating.toFixed(2),
                        Responses: d.responses,
                    })),
                },
                {
                    name: "Actionable Insights",
                    data: metrics.insights.map(i => ({
                        Priority: i.priority.toUpperCase(),
                        Title: i.title,
                        Description: i.description,
                        "Recommended Action": i.action || "N/A",
                    })),
                },
            ];

            await exportToExcelMultiSheet(
                sheets,
                `Executive_Dashboard_Report_${new Date().toISOString().split('T')[0]}`
            );
            showToast.success("Executive report exported to Excel");
            setShowExportMenu(false);
        } catch (error) {
            showToast.error("Failed to export report");
            console.error("Export error:", error);
        }
    }, [metrics]);

    // Insight action handlers
    const handleInsightAction = useCallback((insight: { title: string; action?: string }) => {
        if (insight.action === "View Details" || insight.title.includes("Faculty Need Attention")) {
            // Navigate to analytics performance tab
            router.push("/analytics?tab=performance");
        } else if (insight.action === "Analyze Causes" || insight.title.includes("Declining")) {
            router.push("/analytics?tab=trends");
        } else if (insight.action === "Recognize Top Performers") {
            // Scroll to top performers section or navigate
            router.push("/analytics?tab=performance");
        } else if (insight.action === "Compare Departments") {
            router.push("/analytics?tab=trends");
        } else if (insight.action === "View Response Status") {
            router.push("/analytics");
        }
    }, [router]);

    const isLoading = filterLoading || analyticsLoading;

    if (isLoading) {
        return <PageLoader text="Loading Executive Dashboard" />;
    }

    return (
        <div className="h-screen bg-light-muted-background dark:bg-dark-background flex overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-6 p-6">
            {/* Hero Header - Matching dashboard style */}
            <div
                className="relative bg-light-background dark:bg-dark-muted-background p-6 rounded-lg border border-light-secondary dark:border-dark-secondary overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
                {/* Background decorations */}
                <div className="absolute inset-0 bg-gradient-to-br from-light-background/50 to-primary-lighter/30 dark:from-dark-muted-background/50 dark:to-primary-bgDark/20 opacity-50 pointer-events-none rounded-lg" />
                <div className="absolute top-0 left-0 w-24 h-24 bg-primary-main rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-highlight2-main rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000 pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Left: Title and Health Score */}
                    <div className="flex items-center gap-6">
                        <HealthScoreRing score={metrics.healthScore} />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text flex items-center gap-3">
                                <BarChart3 className="h-7 w-7 text-primary-main" />
                                Executive Dashboard
                            </h1>
                            <p className="text-sm text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
                                <ArrowTrendingUpIcon className="h-4 w-4 text-positive-main" />
                                Institution Health Score: <span className="font-semibold text-primary-main">{metrics.healthScore.toFixed(2)}/5.0</span>
                                {metrics.healthTrend !== 0 && (
                                    <span className={cn(
                                        "text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5",
                                        metrics.healthTrend > 0 
                                            ? "bg-positive-light dark:bg-positive-dark/20 text-positive-main"
                                            : "bg-negative-light dark:bg-negative-dark/20 text-negative-main"
                                    )}>
                                        {metrics.healthTrend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Math.abs(metrics.healthTrend).toFixed(1)}%
                                    </span>
                                )}
                            </p>
                            <p className="text-sm text-light-muted-text dark:text-dark-muted-text mt-1">
                                Based on <span className="font-medium text-light-text dark:text-dark-text">{metrics.totalResponses.toLocaleString()}</span> feedback responses
                                {selectedFilterLabels.length > 0 && (
                                    <span className="ml-2">
                                        • Filtered by: {selectedFilterLabels.map((label, i) => (
                                            <span key={label} className="font-medium text-primary-main">
                                                {label}{i < selectedFilterLabels.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Right: Quick Stats, Filters, and Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-center px-4 py-2 bg-light-muted-background dark:bg-dark-noisy-background rounded-lg">
                                <p className="text-2xl font-bold text-primary-main">
                                    <CountUp end={metrics.responseRate} suffix="%" duration={2} />
                                </p>
                                <p className="text-xs text-light-muted-text dark:text-dark-muted-text">Response Rate</p>
                            </div>
                            <div className="text-center px-4 py-2 bg-light-muted-background dark:bg-dark-noisy-background rounded-lg">
                                <p className="text-2xl font-bold text-warning-main">{metrics.insights.filter(i => i.priority === "high").length}</p>
                                <p className="text-xs text-light-muted-text dark:text-dark-muted-text">Alerts</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowFilters(!showFilters)} 
                                className={cn("gap-2", showFilters && "bg-primary-main/10")}
                            >
                                <Calendar className="w-4 h-4" />
                                Filters
                                {(filters.academicYearId || filters.departmentId) && (
                                    <span className="w-2 h-2 rounded-full bg-primary-main" />
                                )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                            {/* Export Dropdown */}
                            <div className="relative" ref={exportMenuRef}>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-2"
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                    <ChevronDown className={cn(
                                        "w-3 h-3 transition-transform",
                                        showExportMenu && "rotate-180"
                                    )} />
                                </Button>
                                <AnimatePresence>
                                    {showExportMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-48 py-1 bg-light-background dark:bg-dark-muted-background rounded-lg shadow-lg border border-light-secondary dark:border-dark-secondary z-50"
                                        >
                                            <button
                                                onClick={handleExportCSV}
                                                className="w-full px-4 py-2 text-left text-sm text-light-text dark:text-dark-text hover:bg-light-muted-background dark:hover:bg-dark-noisy-background flex items-center gap-2"
                                            >
                                                <FileSpreadsheet className="w-4 h-4 text-positive-main" />
                                                Export as CSV
                                            </button>
                                            <button
                                                onClick={handleExportExcel}
                                                className="w-full px-4 py-2 text-left text-sm text-light-text dark:text-dark-text hover:bg-light-muted-background dark:hover:bg-dark-noisy-background flex items-center gap-2"
                                            >
                                                <FileSpreadsheet className="w-4 h-4 text-primary-main" />
                                                Export as Excel
                                                <span className="ml-auto text-xs text-light-muted-text dark:text-dark-muted-text">Multi-sheet</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Panel - Expandable */}
                <AnimatePresence>
                    {showFilters && filterDictionary && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="relative z-10 mt-4 pt-4 border-t border-light-secondary dark:border-dark-secondary">
                                <div className="flex flex-wrap items-center gap-4">
                                    {/* Academic Year Filter */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-light-muted-text dark:text-dark-muted-text font-medium">
                                            Academic Year
                                        </label>
                                        <select
                                            title="Filter by Academic Year"
                                            value={filters.academicYearId || ""}
                                            onChange={(e) => handleFilterChange("academicYearId", e.target.value || undefined)}
                                            className="px-3 py-1.5 rounded-lg border border-light-secondary dark:border-dark-secondary bg-light-muted-background dark:bg-dark-noisy-background text-sm text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-main/50"
                                        >
                                            <option value="">All Years</option>
                                            {filterDictionary.academicYears.map(year => (
                                                <option key={year.id} value={year.id}>{year.yearString}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Department Filter */}
                                    {filters.academicYearId && (
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-light-muted-text dark:text-dark-muted-text font-medium">
                                                Department
                                            </label>
                                            <select
                                                title="Filter by Department"
                                                value={filters.departmentId || ""}
                                                onChange={(e) => handleFilterChange("departmentId", e.target.value || undefined)}
                                                className="px-3 py-1.5 rounded-lg border border-light-secondary dark:border-dark-secondary bg-light-muted-background dark:bg-dark-noisy-background text-sm text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-main/50"
                                            >
                                                <option value="">All Departments</option>
                                                {filterDictionary.academicYears
                                                    .find(y => y.id === filters.academicYearId)
                                                    ?.departments.map(dept => (
                                                        <option key={dept.id} value={dept.id}>
                                                            {dept.abbreviation || dept.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Semester Filter */}
                                    {filters.academicYearId && filters.departmentId && (
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-light-muted-text dark:text-dark-muted-text font-medium">
                                                Semester
                                            </label>
                                            <select
                                                title="Filter by Semester"
                                                value={filters.semesterId || ""}
                                                onChange={(e) => handleFilterChange("semesterId", e.target.value || undefined)}
                                                className="px-3 py-1.5 rounded-lg border border-light-secondary dark:border-dark-secondary bg-light-muted-background dark:bg-dark-noisy-background text-sm text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-main/50"
                                            >
                                                <option value="">All Semesters</option>
                                                {filterDictionary.academicYears
                                                    .find(y => y.id === filters.academicYearId)
                                                    ?.departments
                                                    .find(d => d.id === filters.departmentId)
                                                    ?.semesters.map(sem => (
                                                        <option key={sem.id} value={sem.id}>
                                                            Semester {sem.semesterNumber}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Clear Filters */}
                                    {(filters.academicYearId || filters.departmentId || filters.semesterId) && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearFilters}
                                            className="text-negative-main hover:text-negative-dark self-end"
                                        >
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ExecStatCard
                        title="Faculty Members"
                        value={metrics.totalFaculty}
                        subtitle={`${metrics.aboveAvgFaculty} above average`}
                        icon={<Users className="w-5 h-5" />}
                        accentColor="primary"
                        sparklineData={metrics.academicYearTrends.map(t => t.rating)}
                    />
                    <ExecStatCard
                        title="Subjects"
                        value={metrics.totalSubjects}
                        subtitle={`${metrics.aboveAvgSubjects} above average`}
                        icon={<BookOpen className="w-5 h-5" />}
                        accentColor="positive"
                        sparklineData={metrics.semesterTrends.map(t => t.rating)}
                    />
                    <ExecStatCard
                        title="Departments"
                        value={metrics.totalDepartments}
                        subtitle={`${metrics.departmentComparison.length} with data`}
                        icon={<Building2 className="w-5 h-5" />}
                        accentColor="highlight2"
                        sparklineData={metrics.departmentComparison.map(d => d.rating)}
                    />
                    <ExecStatCard
                        title="Total Responses"
                        value={metrics.totalResponses}
                        subtitle={metrics.healthTrend !== 0 ? `${metrics.healthTrend > 0 ? '+' : ''}${metrics.healthTrend.toFixed(1)}% from last period` : "All time"}
                        icon={<MessageSquare className="w-5 h-5" />}
                        accentColor="warning"
                        trend={metrics.healthTrend}
                        trendLabel="%"
                        sparklineData={metrics.academicYearTrends.map(t => t.responses)}
                        onClick={() => router.push("/analytics")}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Performance Trend - Semester View */}
                        <motion.div variants={itemVariants}>
                            <Card className="p-5 bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                                            Semester Performance
                                        </h3>
                                        <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                            {metrics.semesterTrends.length > 0 
                                                ? `Showing ${metrics.semesterTrends.length} semesters` 
                                                : "No semester data available"}
                                        </p>
                                    </div>
                                    {metrics.semesterTrends.length > 0 && (
                                        <Sparkline 
                                            data={metrics.semesterTrends.map(t => t.rating)} 
                                            color="#15803d" 
                                            height={40} 
                                        />
                                    )}
                                </div>
                                {metrics.semesterTrends.length > 0 ? (
                                    <div className="flex items-end justify-between gap-2">
                                        {metrics.semesterTrends.map((trend, index) => (
                                            <div key={trend.semester} className="flex-1 text-center">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${(trend.rating / 5) * 80}px` }}
                                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                                    className={cn(
                                                        "mx-auto w-10 rounded-t-lg flex items-end justify-center pb-1 min-h-[30px]",
                                                        index === metrics.semesterTrends.length - 1
                                                            ? "bg-gradient-to-t from-primary-main to-primary-light text-white"
                                                            : "bg-light-secondary dark:bg-dark-secondary text-light-muted-text dark:text-dark-muted-text"
                                                    )}
                                                >
                                                    <span className="text-xs font-medium">{trend.rating.toFixed(1)}</span>
                                                </motion.div>
                                                <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-2">{trend.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-light-muted-text dark:text-dark-muted-text">
                                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>No semester trend data available</p>
                                        <p className="text-xs mt-1">Select an academic year to see trends</p>
                                    </div>
                                )}
                            </Card>
                        </motion.div>

                        {/* Academic Year Comparison - New Section */}
                        {metrics.academicYearTrends.length > 0 && (
                            <motion.div variants={itemVariants}>
                                <Card className="p-5 bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                                                Year-over-Year Comparison
                                            </h3>
                                            <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                                Average ratings across academic years
                                            </p>
                                        </div>
                                        <TrendBadge value={metrics.healthTrend} />
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {metrics.academicYearTrends.map((yearData, index) => (
                                            <div
                                                key={yearData.year}
                                                className={cn(
                                                    "p-3 rounded-lg text-center transition-all",
                                                    index === metrics.academicYearTrends.length - 1
                                                        ? "bg-primary-main/10 border-2 border-primary-main"
                                                        : "bg-light-muted-background dark:bg-dark-noisy-background border border-light-secondary dark:border-dark-secondary"
                                                )}
                                            >
                                                <p className="text-xs text-light-muted-text dark:text-dark-muted-text mb-1">
                                                    {yearData.year}
                                                </p>
                                                <p className={cn(
                                                    "text-xl font-bold",
                                                    index === metrics.academicYearTrends.length - 1
                                                        ? "text-primary-main"
                                                        : "text-light-text dark:text-dark-text"
                                                )}>
                                                    {yearData.rating.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-light-tertiary dark:text-dark-tertiary mt-1">
                                                    {yearData.responses.toLocaleString()} responses
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Faculty Distribution */}
                        <motion.div variants={itemVariants}>
                            <Card className="p-5 bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                                            Faculty Performance Distribution
                                        </h3>
                                        <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                            Breakdown by rating category
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => router.push("/analytics")}>
                                        View All <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                                <PerformanceDistribution
                                    data={metrics.facultyDistribution}
                                    total={metrics.totalFaculty}
                                />
                            </Card>
                        </motion.div>

                        {/* Top & Bottom Performers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.div variants={itemVariants}>
                                <Card className="p-5 h-full bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Trophy className="w-5 h-5 text-positive-main" />
                                        <h3 className="font-semibold text-light-text dark:text-dark-text">
                                            Top Performers
                                        </h3>
                                    </div>
                                    <PerformersTable 
                                        data={metrics.topPerformers} 
                                        type="top" 
                                        onItemClick={(id, name) => drillDown.openFacultyPanel(id, name)}
                                    />
                                </Card>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <Card className="p-5 h-full bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-warning-main" />
                                        <h3 className="font-semibold text-light-text dark:text-dark-text">
                                            Needs Attention
                                        </h3>
                                    </div>
                                    <PerformersTable 
                                        data={metrics.bottomPerformers} 
                                        type="bottom" 
                                        onItemClick={(id, name) => drillDown.openFacultyPanel(id, name)}
                                    />
                                </Card>
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Actionable Insights */}
                        <motion.div variants={itemVariants}>
                            <Card className="p-5 bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary">
                                <div className="flex items-center gap-2 mb-4">
                                    <Zap className="w-5 h-5 text-warning-main" />
                                    <h3 className="font-semibold text-light-text dark:text-dark-text">
                                        Actionable Insights
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {metrics.insights.map((insight, index) => (
                                        <InsightCard
                                            key={index}
                                            priority={insight.priority}
                                            title={insight.title}
                                            description={insight.description}
                                            action={insight.action}
                                            onAction={() => handleInsightAction(insight)}
                                        />
                                    ))}
                                </div>
                            </Card>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div variants={itemVariants}>
                            <Card className="p-5 bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary">
                                <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">
                                    Quick Actions
                                </h3>
                                <div className="space-y-2">
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start gap-3"
                                        onClick={() => router.push("/analytics")}
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Detailed Analytics
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start gap-3"
                                        onClick={handleExportExcel}
                                    >
                                        <Download className="w-4 h-4" />
                                        Generate Report
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start gap-3"
                                        onClick={() => router.push("/feedback-forms")}
                                    >
                                        <Calendar className="w-4 h-4" />
                                        View Feedback Forms
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="w-full justify-start gap-3"
                                        onClick={() => router.push("/analytics?tab=performance")}
                                    >
                                        <Award className="w-4 h-4" />
                                        Top Performers
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>

                        {/* Top Subjects */}
                        <motion.div variants={itemVariants}>
                            <Card className="p-5 bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary">
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="w-5 h-5 text-highlight1-main" />
                                    <h3 className="font-semibold text-light-text dark:text-dark-text">
                                        Top Rated Subjects
                                    </h3>
                                </div>
                                <div className="space-y-2">
                                    {metrics.subjectPerformers.length > 0 ? (
                                        metrics.subjectPerformers.map((subject, index) => (
                                            <div
                                                key={subject.id}
                                                className="flex items-center justify-between p-2 rounded-lg hover:bg-light-muted-background dark:hover:bg-dark-hover transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 rounded-full bg-highlight1-lighter dark:bg-highlight1-darker/40 text-highlight1-main dark:text-highlight1-textDark flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="text-sm font-medium text-light-text dark:text-dark-text truncate max-w-[140px]">
                                                        {subject.name}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-bold text-highlight1-main dark:text-highlight1-textDark">
                                                    {subject.rating.toFixed(2)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-light-muted-text dark:text-dark-muted-text text-center py-4">
                                            No subject data available
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>

                {/* Deep Dive Sections */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary-main" />
                        Deep Dive Analysis
                    </h2>

                    <ExpandableSection
                        title="Division Performance Comparison"
                        icon={<Building2 className="w-5 h-5" />}
                        badge={processedData?.divisionComparisons?.length || 0}
                    >
                        {processedData?.divisionComparisons && processedData.divisionComparisons.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {processedData.divisionComparisons.slice(0, 8).map((div, index) => (
                                    <HeatmapCell key={index} value={div.averageRating} label={div.divisionName} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-light-muted-text dark:text-dark-muted-text">
                                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No division data available</p>
                            </div>
                        )}
                    </ExpandableSection>

                    <ExpandableSection
                        title="Question Category Analysis"
                        icon={<MessageSquare className="w-5 h-5" />}
                    >
                        <div className="text-center py-8 text-light-muted-text dark:text-dark-muted-text">
                            <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Question category breakdown coming soon</p>
                        </div>
                    </ExpandableSection>

                    <ExpandableSection
                        title="Academic Year Trends"
                        icon={<Activity className="w-5 h-5" />}
                    >
                        <div className="text-center py-8 text-light-muted-text dark:text-dark-muted-text">
                            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Historical trend analysis coming soon</p>
                        </div>
                    </ExpandableSection>
                </div>
            </motion.div>
                </div>
            </div>

            {/* Faculty Detail Panel */}
            {drillDown.isFacultyPanelOpen && drillDown.state.facultyId && (
                <FacultyDetailPanel
                    facultyName={drillDown.state.facultyName || "Faculty Details"}
                    isOpen={drillDown.isFacultyPanelOpen}
                    onClose={drillDown.closePanel}
                    data={facultyDetails || null}
                    isLoading={facultyDetailsLoading}
                    onSubjectClick={drillDown.navigateToSubject}
                    inline
                />
            )}

            {/* Subject Detail Panel */}
            {drillDown.isSubjectPanelOpen && drillDown.state.subjectId && (
                <SubjectDetailPanel
                    subjectName={drillDown.state.subjectName || "Subject Details"}
                    isOpen={drillDown.isSubjectPanelOpen}
                    onClose={drillDown.closePanel}
                    data={subjectDetails || null}
                    isLoading={subjectDetailsLoading}
                    onFacultyClick={drillDown.navigateToFaculty}
                    inline
                />
            )}
        </div>
    );
};

export default ExecutiveDashboard;
