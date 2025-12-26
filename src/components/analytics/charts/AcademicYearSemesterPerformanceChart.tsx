/**
 * @file src/components/analytics/charts/AcademicYearSemesterPerformanceChart.tsx
 * @description Visualizes semester performance trends across different academic years using a grouped bar chart.
 */

"use client";

import React, { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CalendarDays, Download } from "lucide-react"; // Using CalendarDays for academic year focus
import { AcademicYearSemesterTrend } from "@/interfaces/analytics";

interface AcademicYearSemesterPerformanceChartProps {
    data: AcademicYearSemesterTrend[];
    isLoading?: boolean;
}

// Define a consistent color palette for academic years
// You can expand this array if you expect more academic years
const ACADEMIC_YEAR_COLORS = [
    "#f97316", // Your primary highlight color (orange)
    "#3b82f6", // A complementary blue
    "#10b981", // A green
    "#ef4444", // A red
    "#6366f1", // A purple
    "#eab308", // A yellow
    "#06b6d4", // A cyan
    "#f43f5e", // A rose
];

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // The label is the semesterNumber
        return (
            <div className="bg-light-background dark:bg-dark-muted-background p-4 border border-light-secondary dark:border-dark-secondary rounded-xl shadow-lg">
                <p className="font-semibold text-light-text dark:text-dark-text mb-3">
                    Semester: {label}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div
                        key={index}
                        className="flex items-center justify-between gap-4 mb-2"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                // style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                {entry.name}:
                            </span>
                        </div>
                        <span className="font-semibold text-light-text dark:text-dark-text">
                            {entry.value ? entry.value.toFixed(2) : "N/A"}
                        </span>
                    </div>
                ))}
                {payload.some(
                    (entry: any) =>
                        entry.payload &&
                        entry.payload[`${entry.name}_responses`]
                ) && (
                    <div className="mt-3 pt-2 border-t border-light-secondary dark:border-dark-secondary">
                        <p className="text-xs text-light-muted-text dark:text-dark-muted-text">
                            Responses:
                        </p>
                        {payload.map(
                            (entry: any, index: number) =>
                                entry.payload &&
                                entry.payload[`${entry.name}_responses`] !==
                                    undefined && (
                                    <span
                                        key={`responses-${index}`}
                                        className="text-xs text-light-muted-text dark:text-dark-muted-text block"
                                    >
                                        {entry.name}:{" "}
                                        <span className="font-semibold text-light-text dark:text-dark-text">
                                            {
                                                entry.payload[
                                                    `${entry.name}_responses`
                                                ]
                                            }
                                        </span>
                                    </span>
                                )
                        )}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export const AcademicYearSemesterPerformanceChart: React.FC<
    AcademicYearSemesterPerformanceChartProps
> = ({ data, isLoading = false }) => {
    // Process data for the chart: flatten academicYearData into properties for each semester
    const { chartData, uniqueAcademicYears, overallStats } = useMemo(() => {
        const allAcademicYears = new Set<string>();
        let totalOverallResponses = 0;
        let totalOverallRatingSum = 0;
        let totalOverallRatingCount = 0;

        const processedChartData = data.map((semesterTrend) => {
            const semesterEntry: { [key: string]: any } = {
                semesterNumber: semesterTrend.semesterNumber,
            };
            semesterTrend.academicYearData.forEach((ayData) => {
                allAcademicYears.add(ayData.academicYearString);
                semesterEntry[ayData.academicYearString] = ayData.averageRating;
                // Add response count for tooltip if needed
                semesterEntry[`${ayData.academicYearString}_responses`] =
                    ayData.responseCount;

                if (ayData.averageRating > 0) {
                    // Only sum non-zero ratings for overall average
                    totalOverallRatingSum += ayData.averageRating;
                    totalOverallRatingCount++;
                }
                totalOverallResponses += ayData.responseCount;
            });
            return semesterEntry;
        });

        const sortedUniqueAcademicYears = Array.from(allAcademicYears).sort();

        const avgOverallRating =
            totalOverallRatingCount > 0
                ? Number(
                      (totalOverallRatingSum / totalOverallRatingCount).toFixed(
                          2
                      )
                  )
                : "N/A";

        return {
            chartData: processedChartData,
            uniqueAcademicYears: sortedUniqueAcademicYears,
            overallStats: {
                totalResponses: totalOverallResponses,
                avgOverallRating,
                totalSemesters: data.length,
                totalAcademicYears: sortedUniqueAcademicYears.length,
            },
        };
    }, [data]);

    // Export function
    const exportToCsv = () => {
        if (!chartData || chartData.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = [
            "Semester Number",
            ...uniqueAcademicYears.flatMap((year) => [
                `${year} Avg Rating`,
                `${year} Responses`,
            ]),
        ];

        const csvContent = [
            headers.join(","),
            ...chartData.map((row) => {
                const rowValues: (string | number)[] = [row.semesterNumber];
                uniqueAcademicYears.forEach((year) => {
                    rowValues.push(
                        row[year] !== undefined ? row[year].toFixed(2) : "N/A"
                    );
                    rowValues.push(
                        row[`${year}_responses`] !== undefined
                            ? row[`${year}_responses`]
                            : "N/A"
                    );
                });
                return rowValues.join(",");
            }),
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
                "academic_year_semester_performance_data.csv"
            );
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert(
                "Your browser does not support downloading files directly. Please copy the data manually."
            );
        }
    };

    // --- Loading State ---
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

    // --- No Data State ---
    if (!data.length) {
        return (
            <Card className="border border-light-secondary dark:border-dark-secondary rounded-2xl shadow-sm bg-light-background dark:bg-dark-muted-background">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-light-secondary dark:bg-dark-secondary">
                            <CalendarDays className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Semester Performance by Academic Year
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                            <CalendarDays className="h-12 w-12 mx-auto mb-4 text-light-muted-text dark:text-dark-muted-text opacity-50" />
                            <p className="text-light-text dark:text-dark-text font-medium mb-2">
                                No academic year trend data available
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
                            <CalendarDays className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Semester Performance by Academic Year
                        </CardTitle>
                    </div>
                    {/* Consistent header actions: Badge for stat + Export Button */}
                    <div className="flex items-center gap-4">
                        {overallStats.avgOverallRating !== "N/A" && (
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="text-sm text-light-text dark:text-dark-text py-2 px-4"
                                >
                                    Average Overall Rating:{" "}
                                    {overallStats.avgOverallRating}
                                </Badge>
                            </div>
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
                    Comparing semester performance across{" "}
                    {overallStats.totalAcademicYears} academic years •{" "}
                    {overallStats.totalResponses} total responses
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={425}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        className="fill-light-text dark:fill-dark-text"
                    >
                        <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="#AAAAAA"
                            strokeOpacity={0.2}
                        />
                        <XAxis
                            dataKey="semesterNumber"
                            height={10}
                            interval={0}
                            fontSize={13}
                            stroke="#AAAAAA"
                            padding={{ left: 10, right: 10 }}
                            tickFormatter={(value) => `Semester ${value}`}
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
                                fill: "#f97316", // Primary brand color
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
                        {uniqueAcademicYears.map((year, index) => (
                            <Bar
                                key={year}
                                dataKey={year}
                                fill={
                                    ACADEMIC_YEAR_COLORS[
                                        index % ACADEMIC_YEAR_COLORS.length
                                    ]
                                }
                                name={year} // This will be used in the legend and tooltip
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>

                {/* Optional: Summary Statistics below the chart */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-light-secondary dark:border-dark-secondary">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                            {overallStats.totalAcademicYears}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Academic Years
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                            {overallStats.totalSemesters}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Semesters Displayed
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#f97316]">
                            {overallStats.avgOverallRating}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Overall Avg Rating
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AcademicYearSemesterPerformanceChart;
