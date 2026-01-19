/**
 * @file src/components/auth/AuthLayout.tsx
 * @description Layout component for authentication pages, providing a consistent structure with a theme toggle and responsive
 */

"use client";

import Image from "next/image";
import LightLogin from "/public/LightLogin.svg";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-5 bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text">
      {/* Left Section - Image (Takes 3/5 width on large screens) */}
      <div className="hidden lg:flex flex-col col-span-3 p-8 items-center justify-center">
        <div className="flex-grow flex items-center justify-center h-full max-h-screen">
          <Image
            src={LightLogin}
            alt="Authentication illustration"
            priority
            className="max-w-full min-h-[85vh] w-auto object-contain"
          />
        </div>
      </div>

      {/* Right Section - Content (Takes 2/5 width on large screens) */}
      <div className="w-full lg:col-span-2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
};
