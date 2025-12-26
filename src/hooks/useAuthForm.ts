/**
 * @file src/hooks/useAuthForm.ts
 * @description React hook for managing authentication form state
 */

import { useState, ChangeEvent } from "react";
import { LoginFormInputs } from "@/interfaces/auth";

// Manage authentication form state
export const useAuthForm = (initialState: LoginFormInputs) => {
  const [formData, setFormData] = useState<LoginFormInputs>(initialState);
  // Handle input changes for form fields
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };
  return { formData, setFormData, handleInputChange };
};
