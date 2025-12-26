/**
 * @file src/interfaces/admin.ts
 * @description Interface for Admin user entity
 */

/**
 * Represents an admin user (as returned by /auth/me and related endpoints).
 */
export interface Admin {
  id: string;
  name: string;
  email: string;
  designation: string;
  isSuper: boolean;
}
