/**
 * @file src/app/(main)/me/page.tsx
 * @description User profile and settings page
 */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner, PageLoader } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { User, Shield, Key } from "lucide-react";
import authService from "@/services/authService";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsUpdating(true);

    try {
      await authService.updatePassword(
        passwords.currentPassword,
        passwords.newPassword,
      );

      toast.success("Password updated successfully");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setIsUpdating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (!user) {
    return <PageLoader text="Loading Profile" />;
  }

  return (
    <div className="min-h-screen bg-light-muted-background dark:bg-dark-background">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
              Profile Settings
            </h1>
            <p className="text-light-muted-text dark:text-dark-muted-text">
              Manage your account information and security settings
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information Card */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="bg-light-background dark:bg-dark-muted-background border-light-secondary dark:border-dark-secondary">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary-lighter dark:bg-primary-darker/20">
                      <User className="h-6 w-6 text-primary-main" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                        Profile Information
                      </h2>
                      <p className="text-light-muted-text dark:text-dark-muted-text">
                        Your account details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-light-muted-text dark:text-dark-muted-text">
                        <UserIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Full Name</span>
                      </div>
                      <p className="text-lg font-medium text-light-text dark:text-dark-text">
                        {user.name}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-light-muted-text dark:text-dark-muted-text">
                        <EnvelopeIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Email Address
                        </span>
                      </div>
                      <p className="text-lg font-medium text-light-text dark:text-dark-text">
                        {user.email}
                      </p>
                    </div>

                    {user.designation && (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-light-muted-text dark:text-dark-muted-text">
                          <BriefcaseIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Designation
                          </span>
                        </div>
                        <p className="text-lg font-medium text-light-text dark:text-dark-text">
                          {user.designation}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-light-muted-text dark:text-dark-muted-text">
                        <ShieldCheckIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">Role</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-lighter dark:bg-primary-darker/20 text-primary-dark dark:text-primary-textDark border border-primary-light dark:border-primary-darker">
                          <Shield className="h-3 w-3 mr-1" />
                          {user.isSuper ? "Super Admin" : "Admin"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Account Status Card */}
            <motion.div variants={itemVariants}>
              <Card className="bg-light-background dark:bg-dark-muted-background border-light-secondary dark:border-dark-secondary">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 rounded-lg bg-positive-lighter dark:bg-positive-darker/20">
                      <Shield className="h-5 w-5 text-positive-main dark:text-positive-textDark" />
                    </div>
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                      Account Status
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-light-muted-text dark:text-dark-muted-text">
                        Status
                      </span>
                      <span className="text-positive-main dark:text-positive-textDark font-medium">
                        Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-light-muted-text dark:text-dark-muted-text">
                        Verified
                      </span>
                      <span className="text-positive-main dark:text-positive-textDark font-medium">
                        Yes
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Change Password Section */}
          <motion.div variants={itemVariants}>
            <Card className="bg-light-background dark:bg-dark-muted-background border-light-secondary dark:border-dark-secondary">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 rounded-lg bg-warning-lighter dark:bg-warning-darker/20">
                    <Key className="h-6 w-6 text-warning-main dark:text-warning-textDark" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                      Change Password
                    </h2>
                    <p className="text-light-muted-text dark:text-dark-muted-text">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwords.currentPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-light-secondary dark:border-dark-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text placeholder-light-muted-text dark:placeholder-dark-muted-text focus:ring-2 focus:ring-primary-main focus:border-primary-main transition-colors"
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("current")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted-text dark:text-dark-muted-text hover:text-light-text dark:hover:text-dark-text transition-colors"
                        >
                          {showPasswords.current ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={passwords.newPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-light-secondary dark:border-dark-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text placeholder-light-muted-text dark:placeholder-dark-muted-text focus:ring-2 focus:ring-primary-main focus:border-primary-main transition-colors"
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("new")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted-text dark:text-dark-muted-text hover:text-light-text dark:hover:text-dark-text transition-colors"
                        >
                          {showPasswords.new ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-light-text dark:text-dark-text">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwords.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-light-secondary dark:border-dark-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text placeholder-light-muted-text dark:placeholder-dark-muted-text focus:ring-2 focus:ring-primary-main focus:border-primary-main transition-colors"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("confirm")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted-text dark:text-dark-muted-text hover:text-light-text dark:hover:text-dark-text transition-colors"
                        >
                          {showPasswords.confirm ? (
                            <EyeSlashIcon className="h-5 w-5" />
                          ) : (
                            <EyeIcon className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-primary-main hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isUpdating ? (
                        <>
                          <LoadingSpinner
                            variant="dots"
                            size="sm"
                            color="white"
                          />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4" />
                          <span>Update Password</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
