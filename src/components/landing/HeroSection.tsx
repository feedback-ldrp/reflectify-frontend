/**
@file src/components/landing/HeroSection.tsx
@description Hero section for the Reflectify landing page.
*/

"use client";

import Image from "next/image";
import Link from "next/link";
import LightHeroElement from "../../../public/LightHeroElement.svg";
import DarkHeroElement from "../../../public/DarkHeroElement.svg";
import { useTheme } from "@/providers/ThemeProvider";
import { motion } from "framer-motion";

// Animation variants for framer-motion
const animations = {
    fadeInScale: {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 1 },
    },
};

// Hero section component
export function HeroSection() {
    const { isDarkMode } = useTheme();

    return (
        <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
            {...animations.fadeInScale}
        >
            <div className="space-y-4 mt-10 md:mt-20">
                <h1 className="text-7xl md:text-7xl font-black text-light-highlight dark:text-dark-highlight tracking-tight">
                    Reflectify
                    <span className="block text-xl md:text-5xl text-light-text dark:text-dark-text mt-4">
                        Empower Growth Through Anonymous Feedback
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-light-text dark:text-dark-text">
                    Create a culture of honest communication and continuous
                    improvement with our anonymous feedback platform.
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                    <Link
                        href="/login"
                        className="px-6 py-3 md:px-8 md:py-4 bg-light-highlight dark:bg-dark-highlight rounded-xl text-light-text dark:text-dark-text font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        Start Collecting Feedbacks
                    </Link>
                    <Link
                        href="/about-us"
                        className="px-6 py-3 md:px-8 md:py-4 border-2 border-light-highlight dark:border-dark-highlight text-light-highlight dark:text-dark-highlight rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        How It Works
                    </Link>
                </div>
            </div>
            <div className="relative h-56 md:h-[450px]">
                <Image
                    src={isDarkMode ? DarkHeroElement : LightHeroElement}
                    alt="Reflectify Hero Element"
                    fill
                    className="object-contain transition-colors duration-300"
                />
            </div>
        </motion.div>
    );
}
