/**
@file src/app/page.tsx
@description Home page for the Reflectify app with light/dark mode and feature highlights.
*/

"use client";

import { PublicRoute } from "@/components/PublicRoute";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { Features } from "@/components/landing/Features";
import { TechStack } from "@/components/landing/TechStack";

// Main content for the home page
function HomePageContent() {
  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text flex flex-col">
      {/* Header section */}
      <Header />
      <div className="mx-auto px-16 py-6 md:py-20">
        <HeroSection />
        <Features />
      </div>
      <TechStack />
      {/* Footer section */}

      <Footer />
    </div>
  );
}

// Home page wrapped with public route
export default function HomePage() {
  return (
    <PublicRoute>
      <HomePageContent />
    </PublicRoute>
  );
}
