// src/components/analytics/BaseChart.tsx

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader } from "@/components/common/Loader";

// Dynamic import for ApexCharts (CSR only)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ChartType =
    | "area"
    | "line"
    | "bar"
    | "pie"
    | "donut"
    | "radialBar"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "candlestick"
    | "boxPlot"
    | "radar"
    | "polarArea"
    | "rangeBar"
    | "rangeArea"
    | "treemap";

interface BaseChartProps {
    title: string;
    subtitle?: string;
    isLoading?: boolean;
    error?: string | null;
    noDataMessage?: string;
    options: any;
    series: any;
    type: ChartType;
    height?: number;
    className?: string;
}

export const BaseChart: React.FC<BaseChartProps> = ({
    title,
    subtitle,
    isLoading = false,
    error = null,
    noDataMessage = "No data available",
    options,
    series,
    type,
    height = 300,
    className = "",
}) => {
    // Enhanced data validation
    const hasData = React.useMemo(() => {
        if (Array.isArray(series)) {
            const validSeries = series.filter((s) => {
                if (Array.isArray(s.data)) {
                    return s.data.length > 0;
                }
                return s && typeof s === "object";
            });
            return validSeries.length > 0;
        } else if (Array.isArray(series)) {
            return series.length > 0;
        }
        return series && Object.keys(series).length > 0;
    }, [series]);

    return (
        <div
            className={`bg-light-background dark:bg-dark-background rounded-lg p-4 ${className}`}
        >
            <div className="mb-4">
                <h4 className="text-md font-medium text-light-text dark:text-dark-text">
                    {title}
                </h4>
                {subtitle && (
                    <p className="text-sm text-light-muted-text dark:text-dark-muted-text mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader />
                </div>
            ) : error ? (
                <div className="flex justify-center py-8">
                    <p className="text-negative-main text-sm">
                        Error loading chart: {error}
                    </p>
                </div>
            ) : hasData ? (
                <div className="w-full">
                    <Chart
                        options={options}
                        series={series}
                        type={type}
                        height={height}
                    />
                </div>
            ) : (
                <div className="flex justify-center py-8">
                    <p className="text-light-muted-text dark:text-dark-muted-text text-sm">
                        {noDataMessage}
                    </p>
                </div>
            )}
        </div>
    );
};

export default BaseChart;
