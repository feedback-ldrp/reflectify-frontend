/**
 * @file src/components/analytics/charts/FacultyPerformanceChart.tsx
 * @description Faculty performance visualization with rankings, including an overall average as a dotted reference line, with standardized styling.
 */

"use client";

import React, { useMemo, useState, useRef } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
    Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { GraduationCap, Download, Users } from "lucide-react";
import { FacultyOverallPerformanceSummary } from "@/interfaces/analytics";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import { exportFacultyPerformanceData } from "@/utils/facultyPerformanceExport";
import showToast from "@/lib/toast";

interface FacultyPerformanceChartProps {
    data: FacultyOverallPerformanceSummary[];
    isLoading?: boolean;
    showTop?: number;
    academicYearId?: string; // Add academic year ID for export
}

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        return (
            <div className="bg-light-background dark:bg-dark-muted-background p-4 border border-light-secondary dark:border-dark-secondary rounded-xl shadow-lg">
                <p className="font-semibold text-light-text dark:text-dark-text mb-3">
                    {label}
                </p>
                <div className="space-y-1">
                    <div className="flex justify-between gap-4">
                        <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                            Rating:
                        </span>
                        <span className="font-semibold text-light-text dark:text-dark-text">
                            {data?.averageRating?.toFixed(2)}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                            Responses:
                        </span>
                        <span className="font-semibold text-light-text dark:text-dark-text">
                            {data?.totalResponses}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                            Rank:
                        </span>
                        <span className="font-semibold text-light-text dark:text-dark-text">
                            #{data?.rank}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

// Function to get color based on rating (0-10 scale)
const getRatingColor = (rating: number) => {
    if (rating >= 9.0) return "green"; // excellent: 9.0-10.0
    if (rating >= 8.0) return "blue"; // very good: 8.0-8.9
    if (rating >= 7.0) return "yellow"; // good: 7.0-7.9
    if (rating >= 6.0) return "orange"; // satisfactory: 6.0-6.9
    return "red"; // needs improvement: below 6.0
};

const getRatingColorClass = (rating: number) => {
    if (rating >= 9.0)
        return "text-green-600 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-700 dark:bg-green-900/20";
    if (rating >= 8.0)
        return "text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:bg-blue-900/20";
    if (rating >= 7.0)
        return "text-yellow-600 border-yellow-200 bg-yellow-50 dark:text-yellow-400 dark:border-yellow-700 dark:bg-yellow-900/20";
    if (rating >= 6.0)
        return "text-orange-600 border-orange-200 bg-orange-50 dark:text-orange-400 dark:border-orange-700 dark:bg-orange-900/20";
    return "text-red-600 border-red-200 bg-red-50 dark:text-red-400 dark:border-red-700 dark:bg-red-900/20";
};

export const FacultyPerformanceChart: React.FC<
    FacultyPerformanceChartProps
> = ({ data, isLoading = false, showTop = 15, academicYearId }) => {
    const [isExporting, setIsExporting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            showToast.loading(`Exporting data...`, {
                id: "export-loading",
            });

            await exportFacultyPerformanceData(academicYearId);

            showToast.success(`Faculty performance Data Exported!`, {
                id: "export-loading",
            });
        } catch (error) {
            showToast.error("Export Failed. Please try again: " + error, {
                id: "export-loading",
            });
        } finally {
            setIsExporting(false);
        }
    };

    const processedData = useMemo(() => {
        const sortedData = [...data].sort(
            (a, b) => b.averageRating - a.averageRating
        );
        return sortedData
            .map((faculty, index) => ({
                ...faculty,
                rank: index + 1,
                name:
                    faculty.facultyName.length > 15
                        ? faculty.facultyName.substring(0, 15) + "..."
                        : faculty.facultyName,
                fullName: faculty.facultyName,
            }))
            .slice(0, showTop);
    }, [data, showTop]);

    const completeData = useMemo(() => {
        const sortedData = [...data].sort(
            (a, b) => b.averageRating - a.averageRating
        );
        return sortedData.map((faculty, index) => ({
            ...faculty,
            rank: index + 1,
            name:
                faculty.facultyName.length > 15
                    ? faculty.facultyName.substring(0, 15) + "..."
                    : faculty.facultyName,
            fullName: faculty.facultyName,
        }));
    }, [data]);

    const stats = useMemo(() => {
        if (!data.length) return null;

        const avgRating =
            data.reduce((sum, faculty) => sum + faculty.averageRating, 0) /
            data.length;
        const totalResponses = data.reduce(
            (sum, faculty) => sum + faculty.totalResponses,
            0
        );

        const sortedByRating = [...data].sort(
            (a, b) => b.averageRating - a.averageRating
        );
        const topPerformer = { ...sortedByRating[0], rank: 1 };
        const bottomPerformer = {
            ...sortedByRating[sortedByRating.length - 1],
            rank: sortedByRating.length,
        };

        // Find faculty who need improvement (rating < 4.0 on 0-10 scale)
        const needsImprovement = data.filter(
            (f) => f.averageRating < 4.0
        ).length;
        const excellentPerformers = data.filter(
            (f) => f.averageRating >= 9.0
        ).length;

        return {
            avgRating: Number(avgRating.toFixed(2)),
            totalResponses,
            totalFaculty: data.length,
            topPerformer,
            bottomPerformer,
            needsImprovement,
            excellentPerformers,
            averageResponsesPerFaculty: Math.round(
                totalResponses / data.length
            ),
        };
    }, [data]);

    // Define columns for the DataTable
    const facultyTableColumns: DataTableColumn<
        FacultyOverallPerformanceSummary & { rank: number }
    >[] = useMemo(
        () => [
            {
                key: "rank",
                header: "Rank",
                accessor: (item) => `#${item.rank}`,
                sortable: true,
                width: "20%",
            },
            {
                key: "facultyName",
                header: "Faculty",
                accessor: (item) => item.facultyName,
                sortable: true,
                width: "40%",
            },
            {
                key: "averageRating",
                header: "Rating",
                accessor: (item) => (
                    <Badge
                        variant="outline"
                        className={`py-1 px-2 text-xs ${getRatingColorClass(
                            item.averageRating
                        )}`}
                    >
                        {item.averageRating.toFixed(2)}
                    </Badge>
                ),
                sortable: true,
                width: "20%",
            },
            {
                key: "totalResponses",
                header: "Responses",
                accessor: (item) => item.totalResponses,
                sortable: true,
                width: "20%",
            },
        ],
        []
    );

    // Helper to get Tailwind color classes from simple color name
    const getTailwindColorClass = (
        colorName: string,
        type: "text" | "border" | "bg"
    ) => {
        const colorMap: {
            [key: string]: {
                text: string;
                border: string;
                bg: string;
                darkText: string;
                darkBorder: string;
                darkBg: string;
            };
        } = {
            green: {
                // Brighter green for light theme text, slightly darker for dark theme
                text: "text-green-700",
                border: "border-green-300",
                bg: "bg-green-100",
                darkText: "dark:text-green-300",
                darkBorder: "dark:border-green-600",
                darkBg: "dark:bg-green-900/40", // Slightly more opaque
            },
            blue: {
                // Deeper blue for light theme text, brighter for dark theme
                text: "text-blue-700",
                border: "border-blue-300",
                bg: "bg-blue-100",
                darkText: "dark:text-blue-300",
                darkBorder: "dark:border-blue-600",
                darkBg: "dark:bg-blue-900/40",
            },
            yellow: {
                // Stronger yellow for visibility against white, slightly muted for dark
                text: "text-yellow-700",
                border: "border-yellow-300",
                bg: "bg-yellow-100",
                darkText: "dark:text-yellow-300",
                darkBorder: "dark:border-yellow-600",
                darkBg: "dark:bg-yellow-900/40",
            },
            orange: {
                // More vibrant orange for light, softer for dark
                text: "text-orange-700",
                border: "border-orange-300",
                bg: "bg-orange-100",
                darkText: "dark:text-orange-300",
                darkBorder: "dark:border-orange-600",
                darkBg: "dark:bg-orange-900/40",
            },
            red: {
                // Deeper red for light theme text, slightly brighter for dark
                text: "text-red-700",
                border: "border-red-300",
                bg: "bg-red-100",
                darkText: "dark:text-red-300",
                darkBorder: "dark:border-red-600",
                darkBg: "dark:bg-red-900/40",
            },
            purple: {
                // Stronger purple for light, brighter for dark
                text: "text-purple-700",
                border: "border-purple-300",
                bg: "bg-purple-100",
                darkText: "dark:text-purple-300",
                darkBorder: "dark:border-purple-600",
                darkBg: "dark:bg-purple-900/40",
            },
        };
        const color = colorMap[colorName];
        if (!color) return "";

        switch (type) {
            case "text":
                return `${color.text} ${color.darkText}`;
            case "border":
                return `${color.border} ${color.darkBorder}`;
            case "bg":
                return `${color.bg} ${color.darkBg}`;
            default:
                return "";
        }
    };

    if (isLoading) {
        return (
            <LoadingSpinner
                variant="dots"
                size="lg"
                color="primary"
                text="Loading"
            />
        );
    }

    if (!data.length) {
        return (
            <Card className="bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary rounded-2xl shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-light-secondary dark:bg-dark-secondary">
                            <GraduationCap className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Faculty Performance Rankings
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-light-muted-text dark:text-dark-muted-text opacity-50" />
                            <p className="text-light-text dark:text-dark-text font-medium mb-2">
                                No faculty performance data available
                            </p>
                            <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                Try adjusting your filters
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary rounded-2xl shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-light-secondary dark:bg-dark-secondary">
                            <GraduationCap className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Faculty Performance Rankings
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-4">
                        {stats!.totalFaculty && (
                            <div className="flex items-center gap-2">
                                <Users className="h-6 w-6 text-light-text dark:text-dark-text" />
                                <Badge
                                    variant="outline"
                                    className="text-sm text-light-text dark:text-dark-text py-2 px-4"
                                >
                                    {stats!.totalFaculty} Faculties
                                </Badge>
                            </div>
                        )}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => handleExport()}
                                disabled={isExporting}
                                className="flex text-sm items-center gap-2 bg-transparent border border-primary-main text-light-highlight dark:text-dark-highlight py-2 px-4 rounded-xl
                                hover:bg-dark-highlight/10 focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="h-5 w-5" />
                                {isExporting ? "Exporting..." : "Export Chart"}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                    Top {showTop} faculty members ranked by average rating •{" "}
                    {stats?.totalResponses} total responses
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={425}>
                    <BarChart
                        data={processedData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        className="fill-light-text dark:fill-dark-text"
                    >
                        <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="#AAAAAA"
                            strokeOpacity={0.2}
                        />
                        <XAxis
                            dataKey="name"
                            height={10}
                            interval={0}
                            fontSize={13}
                            stroke="#AAAAAA"
                            padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                            domain={[0, 10]}
                            stroke="#AAAAAA"
                            label={{
                                value: "Average Rating (0-10)",
                                angle: -90,
                                style: {
                                    fontSize: 13,
                                    fill: "#AAAAAA",
                                },
                            }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{
                                fill: "#f97316",
                                opacity: 0.15,
                                radius: 5,
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: "20px" }}
                            iconType="circle"
                            iconSize={8}
                            formatter={(value: string) => (
                                <span className="text-md gap-2 text-light-text dark:text-dark-text">
                                    {value}
                                </span>
                            )}
                        />
                        <Bar
                            dataKey="averageRating"
                            name="Average Rating"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        >
                            {processedData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        // Use direct hex for Recharts fill, not Tailwind class
                                        getRatingColor(entry.averageRating) ===
                                        "green"
                                            ? "#10b981"
                                            : getRatingColor(
                                                  entry.averageRating
                                              ) === "blue"
                                            ? "#3b82f6"
                                            : getRatingColor(
                                                  entry.averageRating
                                              ) === "yellow"
                                            ? "#f59e0b"
                                            : getRatingColor(
                                                  entry.averageRating
                                              ) === "orange"
                                            ? "#f97316"
                                            : "#ef4444" // red
                                    }
                                />
                            ))}
                        </Bar>

                        {/* Dotted ReferenceLine for Average Rating */}
                        {stats && (
                            <ReferenceLine
                                y={stats.avgRating} // Use the calculated average rating
                                stroke="#f97316" // Orange color for the average line
                                strokeDasharray="5 5" // Dotted line
                                strokeWidth={2}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-light-secondary dark:border-dark-secondary">
                    <div className="text-center">
                        <div
                            className={`text-2xl font-bold ${getTailwindColorClass(
                                "green",
                                "text"
                            )}`}
                        >
                            {stats!.excellentPerformers}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Excellent Performers (9.0 and above)
                        </div>
                    </div>
                    <div className="text-center">
                        <div
                            className={`text-2xl font-bold ${getTailwindColorClass(
                                "orange",
                                "text"
                            )}`}
                        >
                            {stats!.needsImprovement}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Poor Performers (4.0 and below)
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#f97316]">
                            {stats!.avgRating}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Average Rating
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#3b82f6]">
                            {stats!.averageResponsesPerFaculty}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Average Responses
                        </div>
                    </div>
                </div>

                {stats && (
                    <div className="mt-6 pt-6 border-t border-light-secondary dark:border-dark-secondary space-y-6">
                        {data.length && (
                            <div>
                                <h4 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                                    Complete Rankings
                                </h4>
                                <DataTable
                                    data={completeData} // Pass the full processed data
                                    columns={facultyTableColumns}
                                    pageSize={20} // Default page size for the table
                                    showPagination={true} // Enable pagination for the full table
                                    showSearch={true} // Enable search for the full table
                                    stickyHeader={true}
                                    maxHeight="600px" // Max height for scrollable table
                                    className="rounded-xl overflow-hidden" // Apply border radius to the DataTable itself
                                    headerClassName="bg-light-secondary dark:bg-dark-secondary text-light-text dark:text-dark-text"
                                    rowClassName="border-b border-light-secondary dark:border-dark-secondary last:border-b-0"
                                    cellClassName="py-3 text-light-text dark:text-dark-text"
                                />
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default FacultyPerformanceChart;
