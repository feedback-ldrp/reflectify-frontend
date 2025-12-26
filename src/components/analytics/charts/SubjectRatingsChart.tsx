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
import { BookOpen, Monitor, Laptop, Download } from "lucide-react";
import { SubjectLectureLabRating } from "@/interfaces/analytics";

interface SubjectRatingsChartProps {
    data: SubjectLectureLabRating[];
    isLoading?: boolean;
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
                                className={`w-2 h-2 rounded-full ${
                                    entry.color === "#f97316"
                                        ? "bg-[#f97316]"
                                        : "bg-[#9ba2ae]"
                                }`}
                            />
                            <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                {entry.dataKey === "lectureAverageRating"
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
                {payload[0]?.payload?.totalOverallResponses && (
                    <div className="mt-3 pt-2 border-t border-light-secondary dark:border-dark-secondary">
                        <span className="text-xs text-light-muted-text dark:text-dark-muted-text">
                            Total Responses:{" "}
                            <span className="font-semibold text-light-text dark:text-dark-text">
                                {payload[0].payload.totalOverallResponses}
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
}) => {
    const chartData = useMemo(() => {
        // Group data by subjectAbbreviation to aggregate multiple faculty entries for same subject
        const subjectGroups = new Map<
            string,
            {
                subject: string;
                subjectName: string; // Add this
                subjectAbbreviation: string;
                lectureRatings: number[];
                labRatings: number[];
                overallRatings: number[];
                totalLectureResponses: number;
                totalLabResponses: number;
                totalOverallResponses: number;
                facultyNames: string[];
            }
        >();

        data.forEach((item) => {
            const key = item.subjectAbbreviation || item.subjectName;

            if (!subjectGroups.has(key)) {
                subjectGroups.set(key, {
                    subject: item.subjectName, // Full subject name
                    subjectName: item.subjectName, // Add this
                    subjectAbbreviation:
                        item.subjectAbbreviation || item.subjectName,
                    lectureRatings: [],
                    labRatings: [],
                    overallRatings: [],
                    totalLectureResponses: 0,
                    totalLabResponses: 0,
                    totalOverallResponses: 0,
                    facultyNames: [],
                });
            }

            const group = subjectGroups.get(key)!;

            // Collect ratings (only non-null and > 0)
            if (item.lectureAverageRating && item.lectureAverageRating > 0) {
                group.lectureRatings.push(item.lectureAverageRating);
            }
            if (item.labAverageRating && item.labAverageRating > 0) {
                group.labRatings.push(item.labAverageRating);
            }
            if (item.overallAverageRating && item.overallAverageRating > 0) {
                group.overallRatings.push(item.overallAverageRating);
            }

            // Sum responses
            group.totalLectureResponses += item.totalLectureResponses;
            group.totalLabResponses += item.totalLabResponses;
            group.totalOverallResponses += item.totalOverallResponses;

            // Collect faculty names
            if (
                item.facultyName &&
                !group.facultyNames.includes(item.facultyName)
            ) {
                group.facultyNames.push(item.facultyName);
            }
        });

        // Convert to chart data format
        return Array.from(subjectGroups.values())
            .map((group) => ({
                subject: group.subjectAbbreviation, // For display (abbreviation)
                subjectName: group.subjectName, // Add full name for export
                lectureAverageRating:
                    group.lectureRatings.length > 0
                        ? Number(
                              (
                                  group.lectureRatings.reduce(
                                      (sum, r) => sum + r,
                                      0
                                  ) / group.lectureRatings.length
                              ).toFixed(2)
                          )
                        : null,
                labAverageRating:
                    group.labRatings.length > 0
                        ? Number(
                              (
                                  group.labRatings.reduce(
                                      (sum, r) => sum + r,
                                      0
                                  ) / group.labRatings.length
                              ).toFixed(2)
                          )
                        : null,
                overallAverageRating:
                    group.overallRatings.length > 0
                        ? Number(
                              (
                                  group.overallRatings.reduce(
                                      (sum, r) => sum + r,
                                      0
                                  ) / group.overallRatings.length
                              ).toFixed(2)
                          )
                        : null,
                totalLectureResponses: group.totalLectureResponses,
                totalLabResponses: group.totalLabResponses,
                totalOverallResponses: group.totalOverallResponses,
                facultyName: group.facultyNames.join(", "), // Multiple faculties
            }))
            .sort(
                (a, b) =>
                    (b.overallAverageRating || 0) -
                    (a.overallAverageRating || 0)
            );
    }, [data]);

    const stats = useMemo(() => {
        // Group by subjectAbbreviation to get unique subjects
        const subjectGroups = new Map<
            string,
            {
                lectureRatings: number[];
                labRatings: number[];
                totalLectureResponses: number;
                totalLabResponses: number;
                totalOverallResponses: number;
            }
        >();

        // Group data by subject abbreviation
        data.forEach((item) => {
            const key = item.subjectAbbreviation || item.subjectName;

            if (!subjectGroups.has(key)) {
                subjectGroups.set(key, {
                    lectureRatings: [],
                    labRatings: [],
                    totalLectureResponses: 0,
                    totalLabResponses: 0,
                    totalOverallResponses: 0,
                });
            }

            const group = subjectGroups.get(key)!;

            // Add lecture rating if it exists and is > 0
            if (item.lectureAverageRating && item.lectureAverageRating > 0) {
                group.lectureRatings.push(item.lectureAverageRating);
            }

            // Add lab rating if it exists and is > 0
            if (item.labAverageRating && item.labAverageRating > 0) {
                group.labRatings.push(item.labAverageRating);
            }

            // Sum up responses
            group.totalLectureResponses += item.totalLectureResponses;
            group.totalLabResponses += item.totalLabResponses;
            group.totalOverallResponses += item.totalOverallResponses;
        });

        // Calculate aggregated stats
        const uniqueSubjects = subjectGroups.size;
        let totalLectureRatings = 0;
        let totalLabRatings = 0;
        let lectureRatingCount = 0;
        let labRatingCount = 0;
        let totalResponses = 0;

        subjectGroups.forEach((group) => {
            // Calculate average for this subject's lecture ratings
            if (group.lectureRatings.length > 0) {
                const subjectLectureAvg =
                    group.lectureRatings.reduce(
                        (sum, rating) => sum + rating,
                        0
                    ) / group.lectureRatings.length;
                totalLectureRatings += subjectLectureAvg;
                lectureRatingCount++;
            }

            // Calculate average for this subject's lab ratings
            if (group.labRatings.length > 0) {
                const subjectLabAvg =
                    group.labRatings.reduce((sum, rating) => sum + rating, 0) /
                    group.labRatings.length;
                totalLabRatings += subjectLabAvg;
                labRatingCount++;
            }

            totalResponses += group.totalOverallResponses;
        });

        const avgLectureRating =
            lectureRatingCount > 0
                ? totalLectureRatings / lectureRatingCount
                : 0;
        const avgLabRating =
            labRatingCount > 0 ? totalLabRatings / labRatingCount : 0;

        return {
            totalSubjects: uniqueSubjects,
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
                    row.lectureAverageRating !== null
                        ? row.lectureAverageRating
                        : "N/A",
                    row.labAverageRating !== null
                        ? row.labAverageRating
                        : "N/A",
                    row.overallAverageRating !== null
                        ? row.overallAverageRating
                        : "N/A",
                    row.totalLectureResponses,
                    row.totalLabResponses,
                    row.totalOverallResponses,
                    `"${row.facultyName}"`,
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
                            dataKey="lectureAverageRating"
                            fill="#f97316"
                            name="Lecture Rating"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                        <Bar
                            dataKey="labAverageRating"
                            fill="#3b82f6"
                            name="Lab Rating"
                            radius={[4, 4, 0, 0]}
                            barSize={20}
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
