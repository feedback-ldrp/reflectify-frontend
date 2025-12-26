/**
@file src/constants/designations.ts
@description Designation types, display map, and options for faculty roles
*/

// Designation literal type
export type Designation = "HOD" | "AsstProf" | "LabAsst";

// Display map for designations
export const designationDisplayMap: Record<Designation, string> = {
    HOD: "Head of Department",
    AsstProf: "Assistant Professor",
    LabAsst: "Lab Assistant",
};

// Enum-like object for Zod validation
export const DesignationEnumForZod = {
    HOD: "HOD",
    AsstProf: "AsstProf",
    LabAsst: "LabAsst",
} as const;

// Dropdown options for designations
export const designationOptions = Object.entries(designationDisplayMap).map(
    ([value, label]) => ({
        value: value as Designation,
        label,
    })
);
