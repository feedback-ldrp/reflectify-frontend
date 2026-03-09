/**
 * @file src/components/analytics/charts/SubjectRatingsChart.tsx
 * @description Subject ratings visualization with lecture/lab breakdown
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
import { BookOpen, Monitor, Laptop, Download, ExternalLink } from "lucide-react";
import { SubjectRatingAggregated } from "@/interfaces/analytics";

interface SubjectRatingsChartProps {
    data: SubjectRatingAggregated[];
    isLoading?: boolean;
    onSubjectClick?: (subjectId: string, subjectName: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-light-background dark:bg-dark-muted-background p-4 border border-light-secondary dark:border-dark-secondary rounded-xl shadow-lg">
                <p className="font-semibold text-light-text dark:text-dark-text mb-3">
                    {label} {/* Display subjectAbbreviation as the label */}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div
                        key={index}
                        className="flex items-center justify-between gap-4 mb-2"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${entry.color === "#f97316"
                                        ? "bg-[#f97316]"
                                        : "bg-[#9ba2ae]"
                                    }`}
                            />
                            <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                {entry.dataKey === "lectureRating"
                                    ? "Lecture"
                                    : "Lab"}
                                :
                            </span>
                        </div>
                        <span className="font-semibold text-light-text dark:text-dark-text">
                            {entry.value ? entry.value.toFixed(2) : "N/A"}
                        </span>
                    </div>
                ))}
                {payload[0]?.payload?.totalResponses && (
                    <div className="mt-3 pt-2 border-t border-light-secondary dark:border-dark-secondary">
                        <span className="text-xs text-light-muted-text dark:text-dark-muted-text">
                            Total Responses:{" "}
                            <span className="font-semibold text-light-text dark:text-dark-text">
                                {payload[0].payload.totalResponses}
                            </span>
                        </span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export const SubjectRatingsChart: React.FC<SubjectRatingsChartProps> = ({
    data,
    isLoading = false,
    onSubjectClick,
}) => {
    const chartData = useMemo(() => {
        return data.map(item => ({
            ...item,
            subject: item.subjectAbbreviation || item.subjectName,
        }));
    }, [data]);

    const stats = useMemo(() => {
        let totalLectureRatings = 0;
        let totalLabRatings = 0;
        let lectureRatingCount = 0;
        let labRatingCount = 0;
        let totalResponses = 0;

        data.forEach((item) => {
            if (item.lectureRating && item.lectureRating > 0) {
                totalLectureRatings += item.lectureRating;
                lectureRatingCount++;
            }
            if (item.labRating && item.labRating > 0) {
                totalLabRatings += item.labRating;
                labRatingCount++;
            }
            totalResponses += item.totalResponses;
        });

        const avgLectureRating =
            lectureRatingCount > 0
                ? totalLectureRatings / lectureRatingCount
                : 0;
        const avgLabRating =
            labRatingCount > 0 ? totalLabRatings / labRatingCount : 0;

        return {
            totalSubjects: data.length,
            avgLectureRating: Number(avgLectureRating.toFixed(2)),
            avgLabRating: Number(avgLabRating.toFixed(2)),
            totalResponses,
        };
    }, [data]);

    const exportToCsv = () => {
        if (!chartData || chartData.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = [
            "Subject Name",
            "Subject Abbreviation",
            "Lecture Average Rating",
            "Lab Average Rating",
            "Overall Average Rating",
            "Total Lecture Responses",
            "Total Lab Responses",
            "Total Overall Responses",
            "Faculty Names",
        ];

        const csvContent = [
            headers.join(","),
            ...chartData.map((row) =>
                [
                    `"${row.subjectName}"`,
                    `"${row.subject}"`,
                    row.lectureRating !== null
                        ? row.lectureRating
                        : "N/A",
                    row.labRating !== null
                        ? row.labRating
                        : "N/A",
                    row.overallRating !== null
                        ? row.overallRating
                        : "N/A",
                    row.lectureResponses,
                    row.labResponses,
                    row.totalResponses,
                    `"${row.facultyCount} faculties"`,
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
            link.setAttribute("download", "subject_ratings_data.csv");
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

    if (isLoading) {
        return (
            <Card className="border rounded-2xl shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-light-secondary dark:bg-dark-secondary">
                            <BookOpen className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Subject Ratings Comparison
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center">
                        <LoadingSpinner
                            variant="dots"
                            size="lg"
                            color="primary"
                            text="Loading"
                        />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data.length) {
        return (
            <Card className=" border border-light-secondary dark:border-dark-secondary rounded-2xl shadow-sm">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-light-secondary dark:bg-dark-secondary">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Subject Ratings Comparison
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-light-muted-text dark:text-dark-muted-text opacity-50" />
                            <p className="text-light-text dark:text-dark-text font-medium mb-2">
                                No subject ratings data available
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
                            <BookOpen className="h-5 w-5 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <CardTitle className="text-light-text dark:text-dark-text">
                            Subject Ratings Comparison
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Monitor className="h-6 w-6 text-light-text dark:text-dark-text" />
                            <Badge
                                variant="outline"
                                className="text-sm text-light-text dark:text-dark-text py-2 px-4"
                            >
                                Lecture Average: {stats.avgLectureRating}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Laptop className="h-6 w-6 text-light-text dark:text-dark-text" />
                            <Badge
                                variant="outline"
                                className="text-sm text-light-text dark:text-dark-text py-2 px-4"
                            >
                                Lab Average: {stats.avgLabRating}
                            </Badge>
                        </div>
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
                    Comparing ratings across {stats.totalSubjects} subjects •{" "}
                    {stats.totalResponses} total responses
                    {onSubjectClick && (
                        <span className="ml-2 inline-flex items-center gap-1 text-light-highlight dark:text-dark-highlight">
                            <ExternalLink className="h-3 w-3" />
                            Click bars for details
                        </span>
                    )}
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
                            dataKey="subject"
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
                            dataKey="lectureRating"
                            fill="#f97316"
                            name="Lecture Rating"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                            cursor={onSubjectClick ? "pointer" : undefined}
                            onClick={(data: any) => {
                                if (onSubjectClick && data?.subjectId) {
                                    onSubjectClick(data.subjectId, data.subjectName);
                                }
                            }}
                        />
                        <Bar
                            dataKey="labRating"
                            fill="#3b82f6"
                            name="Lab Rating"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                            cursor={onSubjectClick ? "pointer" : undefined}
                            onClick={(data: any) => {
                                if (onSubjectClick && data?.subjectId) {
                                    onSubjectClick(data.subjectId, data.subjectName);
                                }
                            }}
                        />
                    </BarChart>
                </ResponsiveContainer>

                {/* Summary Statistics */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-light-secondary dark:border-dark-secondary">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                            {stats.totalSubjects}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Subjects
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                            {stats.totalResponses}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Responses
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#f97316]">
                            {stats.avgLectureRating}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Average Lecture Rating
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#3b82f6]">
                            {stats.avgLabRating}
                        </div>
                        <div className="text-md text-light-muted-text dark:text-dark-muted-text">
                            Average Lab Rating
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
