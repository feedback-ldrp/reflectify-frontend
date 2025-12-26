/**
 * @file src/components/analytics/charts/BatchComparisonChart.tsx
 * @description Visualizes performance comparison between batches within a selected division.
 */

"use client";

import React from "react";
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
import { Download, GitBranch } from "lucide-react"; // GitBranch for batches

import { DivisionBatchComparison } from "@/interfaces/analytics";
import showToast from "@/lib/toast";

interface BatchComparisonChartProps {
    data: DivisionBatchComparison[];
    selectedDivisionName: string | null; // To display in the title
    isLoading?: boolean;
}

// Define a consistent color palette for batches
const BATCH_COLORS = [
    "#10b981", // Green
    "#3b82f6", // Blue
    "#f97316", // Orange
    "#ef4444", // Red
    "#6366f1", // Purple
    "#eab308", // Yellow
    "#06b6d4", // Cyan
    "#f43f5e", // Rose
    "#8b5cf6", // Violet
    "#ec4899", // Pink
];

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        // The label is the batch name
        const entry = payload[0]; // Assuming only one bar per batch
        return (
            <div className="bg-light-background dark:bg-dark-muted-background p-4 border border-light-secondary dark:border-dark-secondary rounded-xl shadow-lg">
                <p className="font-semibold text-light-text dark:text-dark-text mb-3">
                    Batch: {label}
                </p>
                <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" />
                        <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                            Average Rating:
                        </span>
                    </div>
                    <span className="font-semibold text-light-text dark:text-dark-text">
                        {entry.value ? entry.value.toFixed(2) : "N/A"}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                            Total Responses:
                        </span>
                    </div>
                    <span className="font-semibold text-light-text dark:text-dark-text">
                        {entry.payload.totalResponses}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export const BatchComparisonChart: React.FC<BatchComparisonChartProps> = ({
    data,
    selectedDivisionName,
    isLoading = false,
}) => {
    // Calculate overall stats for the chart
    const overallStats = React.useMemo(() => {
        let totalResponses = 0;
        let totalRatingSum = 0;
        const totalBatches = data.length;

        data.forEach((item) => {
            totalResponses += item.totalResponses;
            totalRatingSum += item.averageRating * item.totalResponses; // Sum of (avg * count)
        });

        const avgOverallRating =
            totalResponses > 0
                ? Number((totalRatingSum / totalResponses).toFixed(2))
                : "N/A";

        return {
            totalResponses,
            avgOverallRating,
            totalBatches,
        };
    }, [data]);

    // Export function
    const exportToCsv = () => {
        if (!data || data.length === 0) {
            showToast.error("No data to export.");
            return;
        }

        const headers = [
            "Division Name",
            "Batch",
            "Average Rating",
            "Total Responses",
            "Engagement Score",
        ];

        const csvContent = [
            headers.join(","),
            ...data.map((row) =>
                [
                    selectedDivisionName || "N/A",
                    row.batch,
                    row.averageRating.toFixed(2),
                    row.totalResponses,
                    row.engagementScore,
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
                `batch_comparison_${selectedDivisionName || "all"}.csv`
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

    // --- No Data State or No Division Selected ---
    if (!selectedDivisionName || data.length === 0) {
        return (
            <Card className="border border-light-secondary dark:border-dark-secondary rounded-2xl shadow-sm bg-light-background dark:bg-dark-muted-background">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-light-secondary dark:bg-dark-secondary">
                            <GitBranch className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Batch Performance Comparison
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                            <GitBranch className="h-12 w-12 mx-auto mb-4 text-light-muted-text dark:text-dark-muted-text opacity-50" />
                            <p className="text-light-text dark:text-dark-text font-medium mb-2">
                                {selectedDivisionName
                                    ? `No batch data available for ${selectedDivisionName}`
                                    : "Select a single division from the filters to view batch comparisons."}
                            </p>
                            <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                {selectedDivisionName
                                    ? "Try adjusting other filters or ensure data exists for this division."
                                    : "Use the 'Division' filter above to narrow down the data."}
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
                            <GitBranch className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Batch Performance Comparison{" "}
                            {selectedDivisionName && (
                                <span className="ml-2 text-light-highlight dark:text-dark-highlight text-lg">
                                    {selectedDivisionName} Division
                                </span>
                            )}
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-4">
                        {overallStats.avgOverallRating !== "N/A" && (
                            <Badge
                                variant="outline"
                                className="text-sm text-light-text dark:text-dark-text py-2 px-4"
                            >
                                Division Average Rating:{" "}
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
                    Comparing performance across {overallStats.totalBatches}{" "}
                    batches in {selectedDivisionName} &bull;{" "}
                    {overallStats.totalResponses} total responses
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={425}>
                    <BarChart
                        data={data} // Data is already filtered for a single division
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        className="fill-light-text dark:fill-dark-text"
                    >
                        <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="#AAAAAA"
                            strokeOpacity={0.2}
                        />
                        <XAxis
                            dataKey="batch" // X-axis displays batch names
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
                        <Bar
                            dataKey="averageRating" // Data key for the bar height
                            fill={BATCH_COLORS[0]} // Use a single color or cycle if you have many batches
                            name="Average Rating" // Name for tooltip if legend is hidden
                            radius={[4, 4, 0, 0]}
                            barSize={20} // Adjust bar size as needed
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default BatchComparisonChart;
