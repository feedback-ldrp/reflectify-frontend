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
import { StatsSection } from "@/components/landing/StatsSection";

// Main content for the home page
function HomePageContent() {
  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text flex flex-col selection:bg-primary-main selection:text-white">
      {/* Header section */}
      <Header />

      <main className="flex-grow w-screen">
        <HeroSection />
        <StatsSection />
        <Features />
        <TechStack />
      </main>

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
