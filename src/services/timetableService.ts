/**
 * @file src/services/timetableService.ts
 * @description Service for fetching division timetable data (day/slot grid).
 */

import axiosInstance from "@/lib/axiosInstance";
import { DIVISION_ENDPOINTS } from "@/constants/apiEndpoints";
import { ApiResponse, IdType } from "@/interfaces/common";

export interface TimetableEntry {
  Subject: string;
  Type: string;
  Batch: string;
  Day: string;
  Time_Slot: number | string;
  Faculty: string;
}

export interface DivisionTimetableData {
  id: string;
  divisionId: string;
  timetableData: TimetableEntry[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

const timetableService = {
  /**
   * Fetch timetable data for a specific division.
   */
  getTimetableByDivisionId: async (
    divisionId: IdType
  ): Promise<DivisionTimetableData | null> => {
    const response = await axiosInstance.get<
      ApiResponse<{ timetable: DivisionTimetableData | null }>
    >(DIVISION_ENDPOINTS.getTimetable(divisionId as string));
    return response.data.data.timetable;
  },
};

export default timetableService;
