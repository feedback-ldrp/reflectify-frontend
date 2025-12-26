// src/components/upload/UploadHeader.tsx

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import React from "react";

interface UploadHeaderProps {
    title: string;
}

export const UploadHeader: React.FC<UploadHeaderProps> = ({ title }) => {
    const router = useRouter();

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={() => router.back()}
                className="p-2 rounded-full transition-colors text-light-muted-text dark:text-dark-muted-text hover:bg-light-hover dark:hover:bg-dark-hover"
                title="Go back"
                aria-label="Go back"
            >
                <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                {title}
            </h1>
        </div>
    );
};
