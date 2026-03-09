/**
@file src/components/landing/TechStack.tsx
@description Tech stack section for the Reflectify landing page.
*/

"use client";

import { motion } from "framer-motion";
import {
    SiNextdotjs,
    SiPostgresql,
    SiPrisma,
    SiTailwindcss,
    SiTypescript,
} from "react-icons/si";
import { FaNodeJs } from "react-icons/fa";

const techStack = [
    { icon: SiNextdotjs, name: "Next.js" },
    { icon: SiPostgresql, name: "PostgreSQL" },
    { icon: FaNodeJs, name: "Node.js" },
    { icon: SiTailwindcss, name: "Tailwind" },
    { icon: SiPrisma, name: "Prisma" },
    { icon: SiTypescript, name: "TypeScript" },
];

// Tech stack section component
export function TechStack() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-10 mb-16 text-center">
                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-primary-main opacity-80 mb-4">
                    The Power Behind
                </h2>
                <p className="text-7xl font-black text-light-highlight dark:text-dark-highlight tracking-tight">
                    Modern Tech Stack
                </p>
            </div>

            <div className="relative flex overflow-hidden">
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop",
                    }}
                    className="flex space-x-[20rem] text-light-text dark:text-dark-text py-10"
                >
                    {[...techStack, ...techStack, ...techStack].map((tech, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-4 group flex-shrink-0"
                        >
                            <tech.icon className="w-24 h-24 text-light-text/50 dark:text-dark-text/50 group-hover:text-primary-main transition-all duration-500 transform group-hover:scale-110" />
                            <span className="text-lg font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-primary-main">
                                {tech.name}
                            </span>
                        </div>
                    ))}
                </motion.div>

                {/* Side Gradients for Smooth Fade */}
                <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-light-background dark:from-dark-background to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-light-background dark:from-dark-background to-transparent z-10" />
            </div>
        </section>
    );
}
