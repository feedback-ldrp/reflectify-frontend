/**
 * @file src/components/landing/Features.tsx
 * @description Redesigned Features section with premium glassmorphism cards.
 */

"use client";

import { motion } from "framer-motion";
import { Lock, PenTool, BarChart3, Users, Zap, Globe } from "lucide-react";

const features = [
  {
    title: "Absolute Anonymity",
    description: "Our zero-knowledge architecture ensures identities remain completely shielded, fostering 100% honest feedback.",
    icon: Lock,
    color: "text-blue-500",
  },
  {
    title: "Dynamic Form Builder",
    description: "Craft sophisticated, multi-criteria evaluation forms tailored to specific academic departments and subjects.",
    icon: PenTool,
    color: "text-purple-500",
  },
  {
    title: "Faculty Ecosystem",
    description: "Seamlessly manage faculty allocations, divisions, and semesters with an intuitive administrative interface.",
    icon: Users,
    color: "text-orange-500",
  },
  {
    title: "Real-time Processing",
    description: "Experience sub-millisecond response times even when aggregating thousands of feedback records.",
    icon: Zap,
    color: "text-yellow-500",
  },
];

export function Features() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-7xl md:text-8xl font-black text-light-highlight dark:text-dark-highlight mb-6 tracking-tighter">
            Engineered for <span className="text-primary-main opacity-50">Transparency</span>
          </h2>
          <p className="text-2xl text-light-muted-text dark:text-dark-muted-text max-w-2xl mx-auto leading-relaxed">
            A comprehensive suite of tools designed to elevate the academic experience through structured, honest communication.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-12 rounded-[3rem] group hover:bg-white/5 transition-all duration-500 border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/20"
            >
              <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 ${feature.color}`}>
                <feature.icon size={40} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-light-highlight dark:text-dark-highlight group-hover:text-primary-main transition-colors tracking-tight">
                {feature.title}
              </h3>
              <p className="text-xl text-light-muted-text dark:text-dark-muted-text leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
