/**
 * @file src/components/landing/StatsSection.tsx
 * @description Animated statistics section for the Reflectify landing page.
 */

"use client";

import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import { useRef } from "react";

const stats = [
    { label: "Total Feedbacks", value: 5000, suffix: "+" },
    { label: "Faculty Members", value: 70, suffix: "+" },
    { label: "Allocations", value: 400, suffix: "+" },
    { label: "Anonymity Rate", value: 100, suffix: "%" },
];

export function StatsSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    return (
        <section ref={ref} className="py-20 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-glow -z-10" />

            <div className="max-w-[1400px] mx-auto px-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="glass-card p-8 rounded-3xl text-center flex flex-col items-center justify-center group"
                        >
                            <h3 className="text-4xl md:text-5xl font-black text-light-highlight dark:text-dark-highlight mb-2 tabular-nums">
                                {isInView ? (
                                    <CountUp end={stat.value} duration={2.5} separator="," />
                                ) : (
                                    "0"
                                )}
                                {stat.suffix}
                            </h3>
                            <p className="text-light-muted-text dark:text-dark-muted-text font-medium uppercase tracking-widest text-xs md:text-sm">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
