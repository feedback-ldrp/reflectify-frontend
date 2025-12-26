/**
 * @file src/app/(auth)/login/page.tsx
 * @description Login page for the application, utilizing the AuthLayout and LoginForm components.
 */

"use client";

import { AuthLayout } from "@/components/auth/AuthLayout"; // Import the new layout
import { LoginForm } from "@/components/auth/LoginForm"; // Import the new form component

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}
