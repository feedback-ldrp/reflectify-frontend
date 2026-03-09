// src/app/(main)/about-us/page.tsx

"use client";

import { PublicRoute } from "@/components/PublicRoute";
import Image from "next/image";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import {
    SiNextdotjs,
    SiPostgresql,
    SiPrisma,
    SiTailwindcss,
    SiTypescript,
} from "react-icons/si";
import { FaNodeJs } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import harsh from "../../../public/Harsh.jpg";
import parin from "../../../public/Parin.jpg";
import kandarp from "../../../public/Kandarp.png";

const techStack = [
    { icon: SiNextdotjs, name: "Next.js" },
    { icon: SiPostgresql, name: "PostgreSQL" },
    { icon: FaNodeJs, name: "Node.js" },
    { icon: SiTailwindcss, name: "Tailwind" },
    { icon: SiPrisma, name: "Prisma" },
    { icon: SiTypescript, name: "TypeScript" },
];

export default function AboutPage() {
    const router = useRouter();

    const teamMembers = [
        {
            name: "Kandarp Gajjar",
            role: "Full Stack Developer",
            email: "kandarp_22091@ldrp.ac.in",
            linkedin: "https://www.linkedin.com/in/kandarpgajjar",
            github: "https://github.com/slantie/",
            bio: "Architected the core frontend infrastructure and AI analytics. Specializes in transforming complex educational workflows into seamless, high-performance interfaces.",
            image: kandarp,
        },
        {
            name: "Harsh Dodiya",
            role: "Full Stack Developer",
            email: "harsh_22087@ldrp.ac.in",
            linkedin: "https://www.linkedin.com/in/dodiyaharsh",
            github: "https://github.com/HarshDodiya1/",
            bio: "Driving force behind the scalable backend architecture and DevOps. Ensures the platform handles thousands of concurrent submissions with enterprise-grade reliability.",
            image: harsh,
        },
        {
            name: "Parin Dave",
            role: "Full Stack Developer",
            email: "parin_22088@ldrp.ac.in",
            linkedin: "https://www.linkedin.com/in/parin-dave-800938267/",
            github: "https://github.com/ParinDave/",
            bio: "Expert in Python ecosystem and API infrastructure. Developed the robust server operations and data processing layers that form the reliable foundation of Reflectify.",
            image: parin,
        },
    ];

    return (
        <PublicRoute>
            <Header />
            <main className="min-h-screen bg-light-background dark:bg-dark-background pt-32 pb-20 overflow-hidden relative">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-main/5 blur-[120px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-main/5 blur-[100px] rounded-full -z-10" />

                <div className="max-w-[1400px] mx-auto px-10">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <h1 className="text-8xl md:text-9xl font-black text-light-highlight dark:text-dark-highlight tracking-tighter leading-[0.8] mb-12">
                            The Team<br />
                            <span className="text-light-text dark:text-dark-text opacity-50">Behind Reflectify</span>
                        </h1>
                    </motion.div>

                    {/* Team Section */}
                    <div className="mb-32">

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {teamMembers.map((member, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="glass-card group rounded-[3rem] overflow-hidden flex flex-col h-full border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/20 transition-all duration-500"
                                >
                                    <div className="relative aspect-square overflow-hidden">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                        
                                    </div>
                                    <div className="p-8 gap-4 flex flex-col flex-grow justify-between">
                                        <div className="flex flex-col items-start justify-start text-left">
                                            <h3 className="text-3xl font-bold text-primary-main mb-1">{member.name}</h3>
                                            <p className="text-black font-bold">{member.role}</p>
                                        </div>
                                        <p className="text-light-muted-text dark:text-dark-muted-text leading-relaxed">
                                            {member.bio}
                                        </p>
                                        <div className="flex gap-4">
                                            {member.github && (
                                                <a href={member.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                                                    <FaGithub size={20} />
                                                </a>
                                            )}
                                            {member.linkedin && (
                                                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                                                    <FaLinkedin size={20} />
                                                </a>
                                            )}
                                            <a href={`mailto:${member.email}`} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                                                <FaEnvelope size={20} />
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Mission Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="glass-card p-12 md:p-20 rounded-[4rem] text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-main/10 blur-[100px] -z-10" />
                        <h2 className="text-4xl md:text-6xl font-black mb-8 flex flex-col gap-4 leading-tight">
                            Transparency is not a feature.<br />
                            <span className="text-primary-main">It&apos;s our foundation.</span>
                        </h2>
                        <p className="text-xl text-light-muted-text dark:text-dark-muted-text max-w-3xl mx-auto leading-relaxed mb-12">
                            We believe that educational growth is only possible when feedback is honest and fearless. Our mission is to provide every student a voice that matters, and every faculty an insight that transforms.
                        </p>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </PublicRoute>
    );
}
