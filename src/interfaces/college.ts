/**
 * @file src/interfaces/college.ts
 * @description Interfaces for College entity and related API data
 */

import { IdType } from "./common";
import { Department } from "./department";

/**
 * Represents a college entity.
 */
export interface College {
    id: IdType;
    name: string;
    websiteUrl: string;
    address: string;
    contactNumber: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    departments?: Department[];
}

/**
 * Data required to create a new college.
 */
export interface CreateCollegeData {
    name: string;
    websiteUrl: string;
    address: string;
    contactNumber: string;
}

/**
 * Data for updating an existing college (all fields optional).
 */
export interface UpdateCollegeData {
    name?: string;
    websiteUrl?: string;
    address?: string;
    contactNumber?: string;
}

/**
 * Data structure for batch updating college.
 */
export interface BatchUpdateCollegeInput {
    updates: UpdateCollegeData;
}
