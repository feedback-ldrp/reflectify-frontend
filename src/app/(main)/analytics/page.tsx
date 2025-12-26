/**
 * @file src/app/(main)/analytics/page.tsx
 * @description Completely revamped analytics dashboard with clean architecture
 */

"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { Users, Eye, RefreshCw, Book } from "lucide-react";

// Import our new components
import {
    useFilterDictionary,
    useProcessedAnalytics,
    useAnalyticsActions,
} from "@/hooks/useAnalyticsData";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { SubjectRatingsChart } from "@/components/analytics/charts/SubjectRatingsChart";
import { FacultyPerformanceChart } from "@/components/analytics/charts/FacultyPerformanceChart";
import AcademicYearSemesterPerformanceChart from "@/components/analytics/charts/AcademicYearSemesterPerformanceChart";
import AcademicYearDivisionPerformanceChart from "@/components/analytics/charts/AcademicYearDivisionPerformanceChart";
import { AnalyticsFilterParams } from "@/interfaces/analytics";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { BatchComparisonChart } from "@/components/analytics/charts/BatchComparisonChart";
import AcademicYearDepartmentComparisonChart from "@/components/analytics/charts/AcademicYearDepartmentComparisonChart";
import SubjectFacultyPerformanceChart from "@/components/analytics/charts/SubjectFacultyPerformanceComparisonChart";
import showToast from "@/lib/toast";
import { PageLoader } from "@/components/ui/LoadingSpinner";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const AnalyticsPage: React.FC = () => {
    // Filter state
    const [filters, setFilters] = useState<AnalyticsFilterParams>({});
    const [activeTab, setActiveTab] = useState<
        "subjects" | "trends" | "performance"
    >("trends");

    // Data fetching
    const {
        data: filterDictionary,
        isLoading: filterDictionaryLoading,
        error: filterDictionaryError,
    } = useFilterDictionary();

    const {
        data: processedData,
        rawData,
        isLoading: analyticsDataLoading,
        error: analyticsDataError,
        refetch: refetchAnalyticsData,
    } = useProcessedAnalytics(filters);

    const { invalidateAll } = useAnalyticsActions();

    const selectedDivisionId = filters.divisionId;
    const isSingleDivisionSelected =
        selectedDivisionId && typeof selectedDivisionId === "string";

    // Derive the division name from the selected division ID
    const selectedDivisionName = useMemo(() => {
        if (isSingleDivisionSelected && rawData?.feedbackSnapshots) {
            // Find the first snapshot that matches the selected divisionId
            const foundSnapshot = rawData.feedbackSnapshots.find(
                (s) => s.divisionId === selectedDivisionId
            );
            return foundSnapshot ? foundSnapshot.divisionName : null;
        }
        return null;
    }, [
        isSingleDivisionSelected,
        selectedDivisionId,
        rawData?.feedbackSnapshots,
    ]);

    // Handle filter changes
    const handleFilterChange = (newFilters: Partial<AnalyticsFilterParams>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handleRefresh = () => {
        refetchAnalyticsData();
        invalidateAll();
        showToast.success("Analytics data refreshed!");
    };

    // Loading state
    if (filterDictionaryLoading || analyticsDataLoading) {
        return (
            <PageLoader
                className="bg-light-background dark:bg-dark-background"
                text="Loading Analytics"
            />
        );
    }

    // Error state
    if (filterDictionaryError || analyticsDataError) {
        return (
            <div className="min-h-screen bg-light-muted-background dark:bg-dark-background">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 md:py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                                Failed to load analytics data
                            </h3>
                            <p className="text-light-muted-text dark:text-dark-muted-text mb-6">
                                We encountered an error while fetching your
                                analytics. Please try again.
                            </p>
                            <Button
                                onClick={handleRefresh}
                                className="bg-light-highlight dark:bg-dark-highlight hover:bg-primary-dark text-white"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-muted-background dark:bg-dark-background">
            <div className="max-w-[1920px] mx-auto px-6 py-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-4"
                >
                    {/* Header */}
                    <motion.div className="bg-light-background dark:bg-dark-muted-background p-6 rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary">
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {/* Left Section: Title and Descriptions */}
                            <div>
                                {/* Responsive text sizing */}
                                <h1 className="text-3xl md:text-4xl font-extrabold text-light-text dark:text-dark-text flex items-center gap-3">
                                    Analytics Dashboard
                                </h1>
                                <p className="text-base text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
                                    <ArrowTrendingUpIcon className="h-6 w-6 text-positive-main" />
                                    Comprehensive feedback analytics and
                                    insights
                                </p>
                            </div>

                            {/* Right Section: Response Count and Last Updated */}
                            {/* Full width on small screens, auto width and right aligned on sm and up */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRefresh}
                                    disabled={analyticsDataLoading}
                                    className="flex items-center gap-1.5 py-2.5 px-4 text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-xl hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
                                    title="Refresh Feedback Forms"
                                >
                                    <RefreshCw
                                        className={`w-5 h-5 ${
                                            analyticsDataLoading
                                                ? "animate-spin"
                                                : ""
                                        }`}
                                    />
                                    {analyticsDataLoading
                                        ? "Refreshing ..."
                                        : "Refresh Data"}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Filters */}
                    <Card className="bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary rounded-2xl shadow-sm">
                        <AnalyticsFilters
                            filters={filters}
                            filterDictionary={filterDictionary}
                            onFiltersChange={handleFilterChange}
                            onRefresh={handleRefresh}
                            isLoading={analyticsDataLoading}
                        />
                    </Card>

                    {/* Overview Stats */}
                    <AnalyticsOverview
                        stats={processedData?.overallStats || null}
                        isLoading={analyticsDataLoading}
                    />

                    {/* Main Content */}
                    <div className="bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary rounded-2xl shadow-sm">
                        <Tabs
                            value={activeTab}
                            onValueChange={(value: string) =>
                                setActiveTab(value as any)
                            }
                        >
                            <div className="p-4 border-b border-light-secondary dark:border-dark-secondary">
                                <TabsList className="grid w-full grid-cols-3 gap-4 rounded-xl p-1">
                                    <TabsTrigger
                                        value="trends"
                                        className="flex items-center gap-2 text-md"
                                    >
                                        <Eye className="w-6 h-6" />
                                        Yearly Trends
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="subjects"
                                        className="flex items-center gap-2 text-md"
                                    >
                                        <Book className="w-6 h-6" />
                                        Subjects & Ratings
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="performance"
                                        className="flex items-center gap-2 text-md"
                                    >
                                        <Users className="w-6 h-6" />
                                        Faculty Performance
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="p-6">
                                <TabsContent
                                    value="subjects"
                                    className="space-y-6 mt-0"
                                >
                                    <SubjectRatingsChart
                                        data={
                                            processedData?.subjectRatings || []
                                        }
                                        isLoading={analyticsDataLoading}
                                    />
                                    <SubjectFacultyPerformanceChart
                                        data={
                                            processedData?.subjectFacultyPerformance ||
                                            []
                                        }
                                        isLoading={analyticsDataLoading}
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="trends"
                                    className="space-y-6 mt-0"
                                >
                                    <AcademicYearDepartmentComparisonChart
                                        data={
                                            processedData?.academicYearDepartmentTrends ||
                                            []
                                        }
                                        isLoading={analyticsDataLoading}
                                    />
                                    <AcademicYearSemesterPerformanceChart
                                        data={
                                            processedData?.academicYearSemesterTrends ||
                                            []
                                        }
                                        isLoading={analyticsDataLoading}
                                    />
                                    <AcademicYearDivisionPerformanceChart
                                        data={
                                            processedData?.academicYearDivisionPerformance ||
                                            []
                                        }
                                        isLoading={analyticsDataLoading}
                                    />

                                    <BatchComparisonChart
                                        data={
                                            processedData?.batchComparisons ||
                                            []
                                        }
                                        selectedDivisionName={
                                            selectedDivisionName
                                        } // Pass the derived name here
                                        isLoading={analyticsDataLoading}
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="performance"
                                    className="space-y-6 mt-0"
                                >
                                    <FacultyPerformanceChart
                                        data={
                                            processedData?.facultyPerformance ||
                                            []
                                        }
                                        academicYearId={filters.academicYearId}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
