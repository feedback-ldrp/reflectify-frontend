// src/components/upload/FacultyMatrixUploadInputs.tsx

"use client";

import React from "react";
import { Select } from "@/components/ui/Select";
import { SemesterTypeEnum } from "@/constants/semesterTypes";
import { useAllAcademicYears } from "@/hooks/useAcademicYears"; // Corrected hook import
import { useAllDepartments } from "@/hooks/useDepartments"; // Corrected hook import
import { FacultyMatrixUploadParams } from "@/interfaces/upload";

interface FacultyMatrixUploadInputsProps {
  params: FacultyMatrixUploadParams;
  onParamChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

export const FacultyMatrixUploadInputs: React.FC<
  FacultyMatrixUploadInputsProps
> = ({ params, onParamChange }) => {
  const { data: academicYears = [] } = useAllAcademicYears();
  const { data: departments = [] } = useAllDepartments();

  return (
    <div className="space-y-3 pt-2">
      <Select
        id="academicYear"
        name="academicYear"
        label="Academic Year"
        value={params.academicYear}
        onChange={onParamChange}
        required
      >
        <option value="">Select Academic Year</option>
        {academicYears.map((year) => (
          <option key={year.id} value={year.yearString}>
            {year.yearString}
          </option>
        ))}
      </Select>

      <Select
        id="semesterRun"
        name="semesterRun"
        label="Semester Run"
        value={params.semesterRun}
        onChange={onParamChange}
        required
      >
        <option value="">Select Semester Type</option>
        {Object.values(SemesterTypeEnum).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </Select>

      <Select
        id="deptAbbreviation"
        name="deptAbbreviation"
        label="Department"
        value={params.deptAbbreviation}
        onChange={onParamChange}
        required
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.abbreviation}>
            {dept.name} ({dept.abbreviation})
          </option>
        ))}
      </Select>
    </div>
  );
};
