/**
 * @file src/components/analytics/charts/SubjectFacultyPerformanceChart.tsx
 * @description Visualizes faculty performance comparison within a selected subject, including an overall subject average as a dotted reference line.
 */

"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
    ComposedChart,
    Bar,
    // Removed Line
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    ReferenceLine, // Added ReferenceLine
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BookOpen, Download } from "lucide-react";

import { SubjectFacultyPerformance } from "@/interfaces/analytics";
import { Select } from "@/components/ui";
import { showToast } from "@/lib/toast";

interface SubjectFacultyPerformanceChartProps {
    data: SubjectFacultyPerformance[];
    isLoading?: boolean;
}

// Define a consistent color palette for faculties and the overall average
const CHART_COLORS = [
    "#f97316", // Overall Subject Average (Orange) - now for the reference line
    "#3b82f6", // Faculty 1 (Blue)
    "#10b981", // Faculty 2 (Green)
    "#ef4444", // Faculty 3 (Red)
    "#6366f1", // Faculty 4 (Purple)
    "#eab308", // Faculty 5 (Yellow)
    "#06b6d4", // Faculty 6 (Cyan)
    "#f43f5e", // Faculty 7 (Rose)
    "#8b5cf6", // Faculty 8 (Violet)
    "#ec4899", // Faculty 9 (Pink)
];

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-light-background dark:bg-dark-muted-background p-4 border border-light-secondary dark:border-dark-secondary rounded-xl shadow-lg">
                <p className="font-semibold text-light-text dark:text-dark-text mb-3">
                    {label}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div
                        key={index}
                        className="flex items-center justify-between gap-4 mb-2"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" />
                            <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                {entry.name}:
                            </span>
                        </div>
                        <span className="font-semibold text-light-text dark:text-dark-text">
                            {entry.value ? entry.value.toFixed(2) : "N/A"}
                        </span>
                    </div>
                ))}
                {/* Show total responses for the faculty bar if available */}
                {payload.some(
                    (entry: any) =>
                        entry.dataKey === "averageRating" &&
                        entry.payload?.responseCount !== undefined
                ) && (
                    <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t border-light-secondary dark:border-dark-secondary">
                        <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                            Total Responses:
                        </span>
                        <span className="font-semibold text-light-text dark:text-dark-text">
                            {
                                payload.find(
                                    (entry: any) =>
                                        entry.dataKey === "averageRating"
                                )?.payload?.responseCount
                            }
                        </span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export const SubjectFacultyPerformanceChart: React.FC<
    SubjectFacultyPerformanceChartProps
> = ({ data, isLoading = false }) => {
    // State for internal subject selection. It will always hold a subject name or undefined.
    const [selectedSubjectName, setSelectedSubjectName] = useState<
        string | undefined
    >(undefined);

    // Get all unique subjects from the data for the dropdown
    const allSubjectsForDropdown = useMemo(() => {
        const uniqueSubjects = new Set<string>();
        data.forEach((item) => {
            uniqueSubjects.add(item.subjectName);
        });
        return Array.from(uniqueSubjects).sort();
    }, [data]);

    // Effect to set initial selected subject or reset if data changes
    useEffect(() => {
        if (data.length > 0) {
            // If no subject is currently selected OR the selected subject is no longer in the data,
            // default to the first available subject.
            if (
                !selectedSubjectName ||
                !allSubjectsForDropdown.includes(selectedSubjectName)
            ) {
                setSelectedSubjectName(allSubjectsForDropdown[0]);
            }
        } else {
            // If no data, ensure selectedSubjectName is reset
            setSelectedSubjectName(undefined);
        }
    }, [data, selectedSubjectName, allSubjectsForDropdown]);

    // Filter the data based on the internal subject selection
    const filteredData = useMemo(() => {
        if (!selectedSubjectName) {
            return null; // No subject selected or no data
        }
        return (
            data.find((item) => item.subjectName === selectedSubjectName) ||
            null
        );
    }, [data, selectedSubjectName]);

    // Process data for the chart (always for a specific subject)
    const { chartData, overallStats } = useMemo(() => {
        if (!filteredData) {
            return {
                chartData: [],
                overallStats: {
                    totalResponses: 0,
                    avgOverallRating: "N/A",
                    totalFaculties: 0,
                },
            };
        }

        const processed: {
            name: string;
            averageRating: number | null;
            responseCount: number;
            fill: string;
        }[] = [];

        // Add individual faculty data for BARS
        filteredData.facultyData.forEach((faculty, idx) => {
            processed.push({
                name: faculty.facultyName,
                averageRating: faculty.averageRating ?? 0, // Ensure numeric for bar height
                responseCount: faculty.responseCount,
                fill: CHART_COLORS[(idx % (CHART_COLORS.length - 1)) + 1], // Cycle through colors for bars
            });
        });

        const totalResponses = filteredData.overallSubjectResponses;
        const avgOverallRating =
            filteredData.overallSubjectAverage?.toFixed(2) ?? "N/A";
        const totalFaculties = filteredData.facultyData.length;

        return {
            chartData: processed,
            overallStats: {
                totalResponses,
                avgOverallRating,
                totalFaculties,
            },
        };
    }, [filteredData]); // Dependency on filteredData

    // Export function
    const exportToCsv = () => {
        if (!filteredData || chartData.length === 0) {
            showToast.error("No data to export.");
            return;
        }

        const headers = [
            "Faculty Name",
            "Average Rating",
            "Total Responses",
            "Overall Subject Average", // Added for clarity in export
        ];

        // Create a temporary object to hold the overall average for export
        const dataForExport = [...chartData];
        if (overallStats.avgOverallRating !== "N/A") {
            dataForExport.push({
                name: "Overall Subject Average",
                averageRating: parseFloat(
                    overallStats.avgOverallRating as string
                ),
                responseCount: overallStats.totalResponses, // Use total responses for overall average
                fill: CHART_COLORS[0], // Use the line color
            });
        }

        const csvContent = [
            headers.join(","),
            ...dataForExport.map((row) =>
                [
                    row.name,
                    row.averageRating !== null
                        ? row.averageRating.toFixed(2)
                        : "N/A",
                    row.responseCount,
                    // For the overall average row, its own averageRating is the overall average.
                    // For faculty rows, the overall subject average is the one from overallStats.
                    row.name === "Overall Subject Average"
                        ? row.averageRating !== null
                            ? row.averageRating.toFixed(2)
                            : "N/A"
                        : overallStats.avgOverallRating,
                ].join(",")
            ),
        ].join("\n");

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute(
                "download",
                `faculty_performance_${
                    selectedSubjectName || "selected_subject"
                }.csv`
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            showToast.warning(
                "Your browser does not support downloading files directly. Please copy the data manually."
            );
        }
    };

    // Handle dropdown change
    const handleDropdownChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedSubjectName(event.target.value);
    };

    // --- Loading State ---
    if (isLoading) {
        return (
            <Card className="border rounded-2xl shadow-sm bg-light-background dark:bg-dark-muted-background">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-light-secondary dark:bg-dark-secondary">
                            <BookOpen className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Subject & Faculty Performance
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                            <LoadingSpinner
                                variant="dots"
                                size="lg"
                                className="mb-4"
                            />
                            <p className="text-light-muted-text dark:text-dark-muted-text">
                                Loading subject and faculty performance data...
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // --- No Data State or No Subject Selected ---
    if (!data.length || !selectedSubjectName || !filteredData) {
        return (
            <Card className="border border-light-secondary dark:border-dark-secondary rounded-2xl shadow-sm bg-light-background dark:bg-dark-muted-background">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-light-secondary dark:bg-dark-secondary">
                                <BookOpen className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                            </div>
                            <CardTitle className="text-light-text dark:text-dark-text">
                                Subject & Faculty Performance
                            </CardTitle>
                        </div>
                        {/* Subject Filter Dropdown */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="subject-select" className="sr-only">
                                Select Subject
                            </label>
                            <select
                                id="subject-select"
                                className="px-3 py-2 rounded-xl border border-light-secondary dark:border-dark-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
                                value={selectedSubjectName || ""} // Handle undefined
                                onChange={handleDropdownChange}
                                disabled={
                                    isLoading ||
                                    allSubjectsForDropdown.length === 0
                                }
                            >
                                <option value="">Select a Subject</option>{" "}
                                {/* Default prompt */}
                                {allSubjectsForDropdown.map((subjectName) => (
                                    <option
                                        key={subjectName}
                                        value={subjectName}
                                    >
                                        {subjectName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-light-muted-text dark:text-dark-muted-text opacity-50" />
                            <p className="text-light-text dark:text-dark-text font-medium mb-2">
                                Select a subject from the dropdown to view
                                detailed faculty performance.
                            </p>
                            <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                This chart displays detailed faculty performance
                                for a single subject.
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
                            <BookOpen className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Faculty Performance for{" "}
                            <span className="text-light-highlight dark:text-dark-highlight">
                                {selectedSubjectName}
                            </span>
                        </CardTitle>
                    </div>
                    {/* Subject Filter Dropdown */}
                    <div className="flex items-center gap-4">
                        <label htmlFor="subject-select" className="sr-only">
                            Select Subject
                        </label>
                        <Select
                            name="subject-select"
                            id="subject-select"
                            value={selectedSubjectName || ""} // Handle undefined
                            onChange={handleDropdownChange}
                            disabled={
                                isLoading || allSubjectsForDropdown.length === 0
                            }
                        >
                            <option value="">Select a Subject</option>{" "}
                            {/* Default prompt */}
                            {allSubjectsForDropdown.map((subjectName) => (
                                <option key={subjectName} value={subjectName}>
                                    {subjectName}
                                </option>
                            ))}
                        </Select>
                        {overallStats.avgOverallRating !== "N/A" && (
                            <Badge
                                variant="outline"
                                className="text-sm text-light-text dark:text-dark-text py-2 px-4"
                            >
                                Overall Average Rating{" "}
                                {overallStats.avgOverallRating}
                            </Badge>
                        )}
                        <button
                            onClick={exportToCsv}
                            className="flex text-sm items-center gap-2 bg-transparent border border-primary-main text-light-highlight dark:text-dark-highlight py-2 px-4 rounded-xl
                            hover:bg-dark-highlight/10 focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                            transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="h-5 w-5" />
                            Export Chart
                        </button>
                    </div>
                </div>
                <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                    Comparing performance of {overallStats.totalFaculties}{" "}
                    faculties in this subject &bull;{" "}
                    {overallStats.totalResponses} total responses
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={425}>
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        className="fill-light-text dark:fill-dark-text"
                        barCategoryGap="20%"
                        barGap={4}
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
                            formatter={(value) => (
                                <span className="text-md gap-2 text-light-text dark:text-dark-text">
                                    {value}
                                </span>
                            )}
                        />

                        <Bar
                            dataKey="averageRating"
                            name="Faculty Average"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                            isAnimationActive={true}
                            minPointSize={3}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`bar-cell-${index}`}
                                    fill={entry.fill}
                                />
                            ))}
                        </Bar>

                        {/* Render the ReferenceLine for Overall Subject Average */}
                        {overallStats.avgOverallRating !== "N/A" && (
                            <ReferenceLine
                                y={parseFloat(
                                    overallStats.avgOverallRating as string
                                )} // Use the calculated overall average directly
                                stroke={CHART_COLORS[0]}
                                strokeDasharray="5 5" // Dotted line
                                strokeWidth={2}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>

                {/* Summary Statistics below the chart */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-light-secondary dark:border-dark-secondary">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                            {overallStats.totalFaculties}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Faculties Compared
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#f97316]">
                            {overallStats.avgOverallRating}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Overall Subject Average Rating
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                            {overallStats.totalResponses}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Total Responses
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SubjectFacultyPerformanceChart;
