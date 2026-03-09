/**
 * @file src/components/landing/HeroSection.tsx
 * @description Redesigned high-impact Hero section for Reflectify.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, ShieldCheck } from "lucide-react";
import LightHeroElement from "../../../public/LightHeroElement.svg";
import DarkHeroElement from "../../../public/DarkHeroElement.svg";
import { useTheme } from "@/providers/ThemeProvider";

// Animation variants for framer-motion
const animations = {
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 1 },
  },
};

export function HeroSection() {
  const { isDarkMode } = useTheme();

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-primary-main/10 blur-[120px] rounded-full animate-pulse -z-10" />
      <div className="absolute bottom-20 left-[51%] w-[400px] h-[400px] bg-secondary-main/10 blur-[100px] rounded-full -z-10" />

      <motion.div
        className="max-w-[1400px] mx-auto px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        {...animations.fadeInScale}
      >
        <div className="space-y-8 z-10">
          <h1 className="text-8xl md:text-9xl font-black text-light-highlight dark:text-dark-highlight tracking-[-0.05em] leading-[0.8] text-glow">
            Reflectify
            <span className="block text-4xl xl:text-5xl font-bold text-light-text dark:text-dark-text tracking-tighter mt-8 opacity-50">
              Honesty Unleashed.<br />Growth Empowered.
            </span>
          </h1>

          <p className="text-2xl text-light-muted-text dark:text-dark-muted-text max-w-xl leading-relaxed">
            Bridge the gap between vision and reality with our anonymous feedback ecosystem. Built for transparency, designed for progress.
          </p>
          <div className="flex flex-wrap gap-6 pt-4">
            <Link
              href="/login"
              className="group relative px-10 py-5 bg-primary-main rounded-[2rem] text-white font-black text-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(79,70,229,0.3)]"
            >
              Launch Portal
            </Link>
            <Link
              href="/about-us"
              className="px-10 py-5 glass-card rounded-[2rem] font-black text-xl hover:bg-white/5 transition-colors border border-black/5 dark:border-white/10"
            >
              Meet the Team
            </Link>
          </div>
        </div>
        <div className="relative h-[500px] hidden lg:block animate-float">
          <Image
            src={isDarkMode ? DarkHeroElement : LightHeroElement}
            alt="Hero Element"
            fill
            className="object-contain transition-colors duration-300"
          />
        </div>
      </motion.div>
    </div>
  );
}
