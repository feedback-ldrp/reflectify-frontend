// src/components/faculty/FacultyTable.tsx

"use client";

import {
    PencilIcon,
    TrashIcon,
    ClipboardIcon,
} from "@heroicons/react/24/outline";
import { UserGroupIcon } from "@heroicons/react/24/outline"; // For no data state
import { Faculty } from "@/interfaces/faculty"; // Ensure this is the updated interface
import { designationDisplayMap } from "@/constants/designations"; // Import the map
import { showToast } from "@/lib/toast"; // For copy email toast

interface FacultyTableProps {
    faculty: Faculty[];
    onEdit: (faculty: Faculty) => void;
    onDelete: (faculty: Faculty) => void;
}

export const FacultyTable = ({
    faculty,
    onEdit,
    onDelete,
}: FacultyTableProps) => {
    const handleCopyEmail = (email: string) => {
        navigator.clipboard
            .writeText(email)
            .then(() => {
                showToast.success(`${email} copied to clipboard`);
            })
            .catch((err) => {
                showToast.error("Failed to copy email: " + err);
            });
    };

    return (
        <div className="overflow-x-auto bg-light-background dark:bg-dark-muted-background rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary">
            <table className="min-w-full divide-y divide-light-secondary dark:divide-dark-secondary">
                <thead className="bg-light-muted-background dark:bg-dark-noisy-background">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-muted-text dark:text-dark-muted-text uppercase tracking-wider">
                            Faculty Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-muted-text dark:text-dark-muted-text uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-muted-text dark:text-dark-muted-text uppercase tracking-wider">
                            Designation
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-muted-text dark:text-dark-muted-text uppercase tracking-wider">
                            Department
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-muted-text dark:text-dark-muted-text uppercase tracking-wider">
                            Joining Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-light-muted-text dark:text-dark-muted-text uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-light-secondary dark:divide-dark-secondary">
                    {faculty.length > 0 ? (
                        faculty.map((f) => (
                            <tr
                                key={f.id}
                                className="hover:bg-light-muted-background dark:hover:bg-dark-noisy-background transition-colors duration-200"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-lighter flex items-center justify-center">
                                            <span className="text-primary-dark font-medium">
                                                {f.abbreviation
                                                    ? f.abbreviation.toUpperCase()
                                                    : f.name
                                                          ?.charAt(0)
                                                          .toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-light-text dark:text-dark-text">
                                                {f.name}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-muted-text dark:text-dark-muted-text">
                                    <div className="flex items-center gap-2">
                                        {f.email}
                                        <button
                                            onClick={() =>
                                                handleCopyEmail(f.email)
                                            }
                                            className="p-1 text-light-tertiary dark:text-dark-tertiary hover:text-light-text dark:hover:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover rounded-md transition-colors"
                                            aria-label={`Copy ${f.email} to clipboard`}
                                        >
                                            <ClipboardIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-muted-text dark:text-dark-muted-text">
                                    {designationDisplayMap[f.designation] ||
                                        f.designation}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-muted-text dark:text-dark-muted-text">
                                    {f.department?.name || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-muted-text dark:text-dark-muted-text">
                                    {f.joiningDate
                                        ? new Date(
                                              f.joiningDate
                                          ).toLocaleDateString()
                                        : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => onEdit(f)}
                                            className="text-highlight1-main hover:text-highlight1-dark"
                                            aria-label={`Edit ${f.name}`}
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(f)}
                                            className="text-negative-main hover:text-negative-dark"
                                            aria-label={`Delete ${f.name}`}
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <UserGroupIcon className="h-12 w-12 text-light-secondary dark:text-dark-secondary" />
                                    <p className="text-light-muted-text dark:text-dark-muted-text font-medium">
                                        No matching faculty members found
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
