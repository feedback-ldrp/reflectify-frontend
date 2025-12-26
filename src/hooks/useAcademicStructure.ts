/**
 * @file src/hooks/useAcademicStructure.ts
 * @description React Query hook for fetching academic structure data
 */

import { useQuery } from "@tanstack/react-query";
import academicStructureService from "@/services/academicStructure.service";
import { AcademicStructureData } from "@/interfaces/academicStructure";

// Query key for academic structure
export const ACADEMIC_STRUCTURE_QUERY_KEY = ["academicStructure"];

// Fetch the complete academic structure
export const useAcademicStructure = () => {
  return useQuery<AcademicStructureData, Error>({
    queryKey: ACADEMIC_STRUCTURE_QUERY_KEY,
    queryFn: () => academicStructureService.getAcademicStructure(),
  });
};
