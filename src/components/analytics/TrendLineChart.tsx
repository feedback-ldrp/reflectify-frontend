// src/components/analytics/TrendLineChart.tsx

"use client";

import React, { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp } from "lucide-react"; // Using TrendingUp for trend charts
import LoadingSpinner from "../ui/LoadingSpinner";

// Actual backend trend data structure
interface ActualTrendData {
    semester: number;
    subject: string; // Keeping subject here, but XAxis will use semester for chronological order
    averageRating: number;
    responseCount: number;
}

interface TrendLineChartProps {
    data: ActualTrendData[];
    isLoading?: boolean;
    title?: string;
    subtitle?: string;
    height?: number; // Defaulting to 400 for consistency with BarChart ResponsiveContainer height
}

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload; // Get the full data object for the hovered point
        return (
            <div className="bg-light-background dark:bg-dark-muted-background p-4 border border-light-secondary dark:border-dark-secondary rounded-xl shadow-lg">
                <p className="font-semibold text-light-text dark:text-dark-text mb-3">
                    Semester: {label}
                </p>
                <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                        {/* Consistent color for the tooltip dot */}
                        <div className="w-2 h-2 rounded-full bg-[#f97316]" />
                        <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                            Average Rating:
                        </span>
                    </div>
                    <span className="font-semibold text-light-text dark:text-dark-text">
                        {dataPoint.averageRating
                            ? dataPoint.averageRating.toFixed(2)
                            : "N/A"}
                    </span>
                </div>
                {dataPoint.responseCount !== undefined && ( // Check for undefined/null rather than just truthiness for 0 responses
                    <div className="mt-3 pt-2 border-t border-light-secondary dark:border-dark-secondary">
                        <span className="text-xs text-light-muted-text dark:text-dark-muted-text">
                            Total Responses:{" "}
                            <span className="font-semibold text-light-text dark:text-dark-text">
                                {dataPoint.responseCount}
                            </span>
                        </span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
    data,
    isLoading = false,
    title = "Rating Trends Over Time",
    subtitle = "Track performance changes across semesters",
    height = 400, // Adjusted for consistency with SubjectRatingsChart's ResponsiveContainer height
}) => {
    const chartData = useMemo(() => {
        // Sort data by semester to ensure correct trend line
        return [...data].sort((a, b) => a.semester - b.semester);
    }, [data]);

    const stats = useMemo(() => {
        const totalSemesters = new Set(data.map((d) => d.semester)).size;
        const totalResponses = data.reduce(
            (sum, d) => sum + d.responseCount,
            0
        );

        const validRatings = data
            .filter((d) => d.averageRating > 0)
            .map((d) => d.averageRating);
        const overallAverageRating =
            validRatings.length > 0
                ? (
                      validRatings.reduce((sum, rating) => sum + rating, 0) /
                      validRatings.length
                  ).toFixed(2)
                : "N/A";

        return {
            totalSemesters,
            totalResponses,
            overallAverageRating,
        };
    }, [data]);

    // Export function (retained from SubjectRatingsChart for consistency)
    const exportToCsv = () => {
        if (!chartData || chartData.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = [
            "Semester",
            "Subject (if applicable)", // Clarify this header as 'subject' might not be unique per semester
            "Average Rating",
            "Response Count",
        ];

        const csvContent = [
            headers.join(","),
            ...chartData.map((row) =>
                [
                    row.semester,
                    `"${row.subject || "N/A"}"`, // Handle cases where subject might not be relevant/present for a combined trend
                    row.averageRating !== null
                        ? row.averageRating.toFixed(2)
                        : "N/A",
                    row.responseCount,
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
            link.setAttribute("download", "trend_data.csv");
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
                className="bg-light-background dark:bg-dark-background"
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
                            <TrendingUp className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />{" "}
                            {/* Consistent highlight color for icon */}
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            {title}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent style={{ height: height }}>
                    {" "}
                    {/* Apply height here */}
                    <div className="h-full flex items-center justify-center">
                        {" "}
                        {/* Use h-full for inner div */}
                        <div className="text-center">
                            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-light-muted-text dark:text-dark-muted-text opacity-50" />
                            <p className="text-light-text dark:text-dark-text font-medium mb-2">
                                No trend data available
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
                            <TrendingUp className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            {title}
                        </CardTitle>
                    </div>
                    {/* Consistent header actions: Badge for stat + Export Button */}
                    <div className="flex items-center gap-4">
                        <Badge
                            variant="outline"
                            className="text-sm text-light-text dark:text-dark-text py-2 px-4" // Added py-2 px-4 for consistency
                        >
                            Avg Rating: {stats.overallAverageRating}
                        </Badge>
                        <button
                            onClick={exportToCsv}
                            className="flex text-sm items-center gap-2 bg-transparent border border-primary-main text-light-highlight dark:text-dark-highlight py-2 px-4 rounded-xl
                            hover:bg-dark-highlight/10 focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                            transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Export Chart
                        </button>
                    </div>
                </div>
                <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                    {subtitle} • {stats.totalResponses} total responses across{" "}
                    {stats.totalSemesters} semesters
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={425}>
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        className="fill-light-text dark:fill-dark-text" // Apply fill to chart container for text elements
                    >
                        <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="#AAAAAA"
                            strokeOpacity={0.2}
                        />
                        <XAxis
                            dataKey="semester" // Use semester for chronological trend
                            height={10}
                            interval={0}
                            fontSize={13}
                            stroke="#AAAAAA" // Color for axis line and tick text
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
                        <Line
                            type="monotone" // For smooth curve
                            dataKey="averageRating"
                            stroke="#f97316"
                            name="Average Rating"
                            dot={{
                                stroke: "#f97316",
                                strokeWidth: 2,
                                r: 4,
                                fill: "#f97316",
                            }} // Styled dots to match line color and size
                            activeDot={{
                                stroke: "#f97316",
                                strokeWidth: 2,
                                r: 8,
                                fill: "#f97316", // Ensure active dot fill is also consistent
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-light-secondary dark:border-dark-secondary">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                            {stats.totalSemesters}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Semesters
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                            {stats.totalResponses}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Total Responses
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#f97316]">
                            {stats.overallAverageRating}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Overall Average Rating
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TrendLineChart;
