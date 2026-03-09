import React from "react";
import AdminUserManagement from "../../../components/admin/AdminUserManagement";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requireSuper={true}>
      <AdminUserManagement />
    </ProtectedRoute>
  );
}
