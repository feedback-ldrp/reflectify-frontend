// src/components/faculty/FacultyFilters.tsx

"use client";

import {
  UserGroupIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Department } from "@/interfaces/department"; // Corrected import path for Department
import { SortOrder } from "@/hooks/faculty/useFacultyData"; // Corrected import for SortOrder
import { IdType } from "@/interfaces/common"; // Import IdType

interface FacultyFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDepartment: IdType | ""; // Changed type to match useFacultyData hook
  setSelectedDepartment: (deptId: IdType | "") => void; // Changed type to match useFacultyData hook
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  departments: Department[];
  onAddFaculty: () => void;
}

export const FacultyFilters = ({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  sortOrder,
  setSortOrder,
  departments,
  onAddFaculty,
}: FacultyFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-stretch bg-light-background dark:bg-dark-muted-background p-4 rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search faculty by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text border-light-secondary dark:border-dark-secondary focus:border-primary-main dark:focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <UserGroupIcon className="h-5 w-5 text-light-tertiary dark:text-dark-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative">
          <label htmlFor="department-select" className="sr-only">
            Select Department
          </label>
          <select
            id="department-select"
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text border-light-secondary dark:border-dark-secondary focus:border-primary-main dark:focus:border-primary-main focus:ring-2 focus:ring-primary-main/20 shadow-sm min-w-[200px] cursor-pointer appearance-none pr-10"
            value={selectedDepartment}
            onChange={(e) =>
              setSelectedDepartment(e.target.value as IdType | "")
            } // Cast to IdType | ""
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={String(dept.id)}>
                {" "}
                {/* Ensure value is string */}
                {dept.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="h-5 w-5 text-light-tertiary dark:text-dark-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-4 py-2.5 rounded-lg border bg-light-background dark:bg-dark-muted-background hover:bg-light-muted-background dark:hover:bg-dark-noisy-background border-light-secondary dark:border-dark-secondary flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap"
        >
          <span className="text-light-text dark:text-dark-text">
            Sort {sortOrder === "asc" ? "A→Z" : "Z→A"}
          </span>
          {sortOrder === "asc" ? (
            <ArrowUpIcon className="h-4 w-4 text-light-highlight dark:text-dark-highlight" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 text-light-highlight dark:text-dark-highlight" />
          )}
        </button>

        <button
          onClick={onAddFaculty}
          className="flex items-center justify-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors duration-200 shadow-sm whitespace-nowrap"
        >
          <PlusIcon className="h-5 w-5" />
          Add Faculty
        </button>
      </div>
    </div>
  );
};
