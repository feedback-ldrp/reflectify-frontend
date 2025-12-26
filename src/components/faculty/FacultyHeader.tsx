// src/components/faculty/FacultyHeader.tsx

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

interface FacultyHeaderProps {
    onExport: () => void;
}

export const FacultyHeader = ({ onExport }: FacultyHeaderProps) => {
    const router = useRouter();

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full transition-colors text-light-muted-text dark:text-dark-muted-text hover:bg-light-hover dark:hover:bg-dark-hover"
                    aria-label="Go back"
                >
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">
                    Faculty Management
                </h1>
            </div>
            <button
                onClick={onExport}
                className="flex w-full sm:w-auto items-center justify-center gap-2 bg-positive-main text-white px-4 py-2 rounded-lg hover:bg-positive-dark transition-colors duration-200 shadow-sm whitespace-nowrap"
            >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Export Excel</span>
            </button>
        </div>
    );
};
