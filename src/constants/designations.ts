/**
@file src/constants/designations.ts
@description Designation types, display map, and options for faculty roles
*/

// Designation literal type
export type Designation = "HOD" | "AsstProf" | "LabAsst" | "ResearchAssistant";

// Display map for designations
export const designationDisplayMap: Record<Designation, string> = {
    HOD: "Head of Department",
    AsstProf: "Assistant Professor",
    LabAsst: "Lab Assistant",
    ResearchAssistant: "Research Assistant",
};

// Enum-like object for Zod validation
export const DesignationEnumForZod = {
    HOD: "HOD",
    AsstProf: "AsstProf",
    LabAsst: "LabAsst",
    ResearchAssistant: "ResearchAssistant",
} as const;

// Dropdown options for designations
export const designationOptions = [
    { value: "HOD", label: "Head of Department" },
    { value: "AsstProf", label: "Assistant Professor" },
    { value: "LabAsst", label: "Lab Assistant" },
    { value: "ResearchAssistant", label: "Research Assistant" },
];

// For admin management UI
export const adminDesignationOptions = [
    { label: "HOD", value: "HOD" },
    { label: "AsstProf", value: "AsstProf" },
    { label: "LabAsst", value: "LabAsst" },
    { label: "Research Assistant", value: "ResearchAssistant" },
];
