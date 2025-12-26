// src/app/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { StatCard } from "@/components/ui/StatCard";
import {
    ArrowTrendingUpIcon,
    BuildingOfficeIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    AcademicCapIcon,
    CalendarIcon,
} from "@heroicons/react/24/outline";
import CountUp from "react-countup";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { BookIcon, LayoutGrid, RefreshCw } from "lucide-react"; // Import RefreshCw

import { useState, useCallback } from "react"; // Import useState and useCallback
import { showToast } from "@/lib/toast"; // Import showToast

export default function Dashboard() {
    const router = useRouter();
    // Destructure data, isLoading, isError, error, and refetch from the TanStack Query hook
    const { data: stats, isLoading, isError, refetch } = useDashboardStats();

    // State for refresh button loading
    const [isRefreshing, setIsRefreshing] = useState(false); // Using isRefreshing for clarity

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetch(); // Call refetch from useDashboardStats
            showToast.success("Dashboard data refreshed!");
        } catch (refreshError) {
            showToast.error(
                "Failed to refresh dashboard data: " + refreshError
            );
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch]);

    if (isLoading) {
        return <PageLoader text="Loading Dashboard" />;
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-muted-background dark:bg-dark-background">
                <p className="text-lg text-light-text dark:text-dark-text">
                    Failed to load dashboard data.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-muted-background dark:bg-dark-background">
            {/* Max width and responsive padding for the main container */}
            <div className="max-w-[1920px] mx-auto px-6 py-6">
                {/* Responsive layout for main sections: column on smaller screens, row on large screens */}
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Main Content - Right Side */}
                    {/* Ensures this div takes full width on large screens */}
                    <div className="lg:w-full space-y-6">
                        {/* Header Section */}
                        <div
                            className="relative bg-light-background dark:bg-dark-muted-background p-6 rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer dark:hover:bg-dark-noisy-background"
                            onClick={() => router.push("/analytics")}
                        >
                            {/* Optional: Subtle background pattern or gradient for modern bento feel */}
                            <div className="absolute inset-0 bg-gradient-to-br from-light-background/50 to-light-secondary/20 dark:from-dark-muted-background/50 dark:to-dark-secondary/20 opacity-30 pointer-events-none rounded-xl"></div>
                            <div className="absolute top-0 left-0 w-24 h-24 bg-primary-main rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent-light-main rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

                            {/* Responsive flex container for header content */}
                            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                {/* Left Section: Title and Descriptions */}
                                <div>
                                    {/* Responsive text sizing */}
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-light-text dark:text-dark-text flex items-center gap-3">
                                        Feedback Dashboard
                                        <ChartBarIcon className="h-8 w-8 text-primary-main" />
                                    </h1>
                                    <p className="text-base text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
                                        <ArrowTrendingUpIcon className="h-5 w-5 text-positive-main" />
                                        Real-time system metrics and quick
                                        actions at a glance.
                                    </p>
                                    {/* Active Academic Year */}
                                    {stats?.activeAcademicYear && (
                                        <p className="text-sm text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2 font-medium">
                                            <CalendarIcon className="h-4 w-4 text-primary-main" />
                                            Active Academic Year:{" "}
                                            <span className="font-semibold text-primary-main">
                                                {
                                                    stats.activeAcademicYear
                                                        .yearString
                                                }
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Right Section: Response Count and Last Updated */}
                                {/* Full width on small screens, auto width and right aligned on sm and up */}
                                <div className="w-full sm:w-auto text-left sm:text-right space-y-3">
                                    <div className="flex justify-start flex-row sm:justify-end">
                                        <div className="flex items-center gap-2 mt-1">
                                            {/* Responsive text sizing for the count number */}
                                            <div className="text-7xl md:text-5xl font-bold text-primary-main">
                                                <CountUp
                                                    end={
                                                        stats?.responseCount ||
                                                        0
                                                    }
                                                    duration={2.5} // Slightly longer duration for smoother count
                                                    separator=","
                                                    enableScrollSpy={true}
                                                    scrollSpyOnce={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                            Responses Collected
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="bg-light-background dark:bg-dark-muted-background p-6 rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-light-text dark:text-dark-text flex items-center gap-2">
                                    Core System Metrics
                                </h2>
                                {/* Refresh Button added here */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleRefresh}
                                        disabled={isRefreshing} // Use the new state variable
                                        className="flex items-center gap-1.5 py-2 px-4 text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-xl hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
                                        title="Refresh Dashboard Data" // Updated title
                                    >
                                        <RefreshCw
                                            className={`w-5 h-5 ${
                                                isRefreshing
                                                    ? "animate-spin"
                                                    : ""
                                            }`}
                                        />
                                        {isRefreshing
                                            ? "Refreshing ..."
                                            : "Refresh Data"}
                                    </button>
                                    <Button
                                        onClick={() =>
                                            router.push("/analytics")
                                        }
                                        className="bg-primary-main hover:bg-primary-dark text-white"
                                    >
                                        <span className="flex items-center gap-2">
                                            {/* <PresentationChartLineIcon className="h-5 w-5" /> */}
                                            View Analytics
                                        </span>
                                    </Button>
                                </div>
                            </div>
                            {/* Enhanced Grid for the 6 StatCards with better spacing and hover effects */}
                            {/* Responsive grid columns: 1 on mobile, 2 on sm, 3 on lg */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <StatCard
                                    title="Academic Years"
                                    value={stats?.academicYearCount || 0}
                                    icon={CalendarIcon}
                                    onClick={() => router.push("/years")}
                                    subtitle="Total academic periods"
                                    className="hover:scale-105 transition-transform duration-300"
                                />
                                <StatCard
                                    title="Departments"
                                    value={stats?.departmentCount || 0}
                                    icon={BuildingOfficeIcon}
                                    onClick={() => router.push("/departments")}
                                    subtitle="Organizational units"
                                    className="hover:scale-105 transition-transform duration-300"
                                />
                                <StatCard
                                    title="Faculty"
                                    value={stats?.facultyCount || 0}
                                    icon={AcademicCapIcon}
                                    onClick={() => router.push("/faculties")}
                                    subtitle="Registered faculty members"
                                    className="hover:scale-105 transition-transform duration-300"
                                />
                                <StatCard
                                    title="Semesters"
                                    value={stats?.semesterCount || 0}
                                    icon={ClipboardDocumentListIcon}
                                    onClick={() => router.push("/semesters")}
                                    subtitle="Defined academic terms"
                                    className="hover:scale-105 transition-transform duration-300"
                                />
                                <StatCard
                                    title="Divisions"
                                    value={stats?.divisionCount || 0}
                                    icon={LayoutGrid}
                                    onClick={() => router.push("/divisions")}
                                    subtitle="Sub-units within departments"
                                    className="hover:scale-105 transition-transform duration-300"
                                />
                                <StatCard
                                    title="Subjects"
                                    value={stats?.subjectCount || 0}
                                    icon={BookIcon}
                                    onClick={() => router.push("/subjects")}
                                    subtitle="Available course subjects"
                                    className="hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
