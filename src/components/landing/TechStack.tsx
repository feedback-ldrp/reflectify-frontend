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
        <>
            <div className="rounded-2xl  bg-light-background dark:bg-dark-background p-12 overflow-hidden">
                <h2 className="text-4xl font-bold text-light-highlight dark:text-dark-highlight mb-10 text-center">
                    Our Tech Stack
                </h2>
                <motion.div
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop",
                    }}
                    className="flex space-x-[16rem] text-light-text dark:text-dark-text
                    group-hover:text-light-highlight dark:group-hover:text-dark-highlight"
                >
                    {[...techStack, ...techStack].map((tech, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center gap-3 group flex-shrink-0"
                        >
                            <tech.icon className="w-24 h-24 text-light-text dark:text-dark-text group-hover:text-orange-500 transition-colors transform group-hover:scale-110 duration-300" />
                            <span className="text-base font-medium text-light-text dark:text-dark-text">
                                {tech.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </>
    );
}
