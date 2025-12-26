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
import kandarp from "../../../public/Kandarp.jpg";
import { FlipWords } from "../../components/ui/FlipWords";

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
    const words = ["innovative", "seamless", "powerful", "intuitive"];
    const [currentIndex, setCurrentIndex] = useState(0);
    const duration = 3250;

    const teamMembers = [
        {
            name: "Kandarp Gajjar",
            role: "Full Stack Developer",
            email: "kandarp_22091@ldrp.ac.in",
            linkedin: "https://www.linkedin.com/in/kandarpgajjar",
            portfolio: "https://slantie.vercel.app/",
            github: "https://github.com/slantie/",
            bio: "A passionate full-stack developer with expertise in modern web technologies and AI/ML systems. Kandarp architected the core frontend infrastructure of Reflectify using Next.js, TypeScript, and React, while also implementing intelligent data analytics features. His specialization in artificial intelligence and machine learning has been instrumental in developing the platform's advanced feedback analysis capabilities, enabling institutions to derive meaningful insights from student responses. With a keen eye for user experience design and system architecture, he ensures that complex educational workflows are transformed into intuitive, seamless interfaces.",
            image: kandarp,
        },
        {
            name: "Harsh Dodiya",
            role: "Full Stack Developer",
            email: "harsh_22087@ldrp.ac.in",
            linkedin: "https://www.linkedin.com/in/dodiyaharsh",
            portfolio: "https://harshdodiya.me/",
            github: "https://github.com/HarshDodiya1/",
            bio: "An accomplished full-stack developer with deep expertise in system design and DevOps practices. Harsh has been the driving force behind Reflectify's scalable architecture, designing robust backend systems that handle complex educational data workflows with high performance and reliability. His mastery of system design principles ensures the platform can efficiently manage thousands of concurrent feedback submissions while maintaining data integrity. Through his DevOps expertise, he has established seamless CI/CD pipelines and deployment strategies that enable rapid feature delivery and system maintenance, making Reflectify a truly enterprise-ready solution for educational institutions.",
            image: harsh,
        },
        {
            name: "Parin Dave",
            role: "Full Stack Developer",
            email: "parin_22088@ldrp.ac.in",
            linkedin: "https://www.linkedin.com/in/parin-dave-800938267/",
            // portfolio: "#",
            // github: "#",
            bio: "A skilled Python developer who played a crucial role in building Reflectify's backend infrastructure. Parin developed the Flask-based server that powers the platform's core operations, handling everything from user authentication to complex feedback data processing. His expertise in Python ecosystem technologies enabled the creation of robust APIs that seamlessly integrate with the frontend while maintaining high security standards. Through his work on the server architecture, he ensured that Reflectify can efficiently process and store large volumes of educational feedback data, providing the reliable foundation that institutions depend on for their critical feedback collection processes.",
            image: parin,
        },
    ];

    useEffect(() => {
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const cycles = Math.floor(elapsed / duration);

            setCurrentIndex(cycles % teamMembers.length);
        }, duration);

        return () => clearInterval(interval);
    }, [duration, teamMembers.length]);

    return (
        <>
            <PublicRoute>
                <Header />
                <div
                    suppressHydrationWarning
                    className="max-w-[1920px] mx-auto px-3 sm:px-6 py-4 sm:py-8 bg-light-background text-light-text dark:bg-dark-background dark:text-dark-text"
                >
                    <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                        {/* Header */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-1.5 sm:p-2 hover:bg-orange-100 rounded-full transition-colors dark:hover:bg-dark-hover"
                                title="Go back"
                                aria-label="Go back"
                            >
                                <ArrowLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 dark:text-dark-tertiary" />
                            </button>
                            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-dark-text">
                                About Us
                            </h1>
                        </div>

                        {/* Hero Section - Responsive Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 lg:gap-8 xl:gap-0 min-h-[400px] sm:min-h-[500px] xl:min-h-[600px] px-2 sm:px-6 lg:px-14">
                            {/* Left column - FlipWords */}
                            <div className="xl:col-span-4 flex items-center justify-center xl:justify-start text-center xl:text-left">
                                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-4xl font-bold text-light-text dark:text-dark-text leading-tight">
                                    Building
                                    <FlipWords
                                        words={words}
                                        duration={duration}
                                    />
                                    <br />
                                    feedback systems for education
                                </div>
                            </div>

                            {/* Right column - Team Carousel */}
                            <div className="xl:col-span-6 relative h-[500px] sm:h-[550px] lg:h-[600px]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 10 }}
                                        className="absolute inset-0"
                                    >
                                        <div className="group relative h-full">
                                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl transform transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                                            <div className="relative bg-white dark:bg-dark-secondary rounded-2xl border border-orange-100 dark:border-dark-secondary h-full flex flex-col sm:flex-row overflow-hidden">
                                                {/* Image Section - Responsive */}
                                                <div className="relative w-full sm:w-[40%] h-40 sm:h-full flex-shrink-0">
                                                    <Image
                                                        src={
                                                            teamMembers[
                                                                currentIndex
                                                            ].image
                                                        }
                                                        alt={
                                                            teamMembers[
                                                                currentIndex
                                                            ].name
                                                        }
                                                        fill
                                                        className="object-cover object-center"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                                                        priority
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-r sm:bg-gradient-to-r from-black/10 to-transparent" />
                                                </div>

                                                {/* Content Section - Responsive */}
                                                <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                                                    <div className="mb-4">
                                                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-dark-text mb-1 sm:mb-2">
                                                            {
                                                                teamMembers[
                                                                    currentIndex
                                                                ].name
                                                            }
                                                        </h3>
                                                        <p className="text-lg sm:text-xl text-orange-600 font-medium">
                                                            {
                                                                teamMembers[
                                                                    currentIndex
                                                                ].role
                                                            }
                                                        </p>
                                                    </div>

                                                    <p className="text-[15px] text-gray-600 dark:text-dark-tertiary leading-relaxed flex-grow mb-4 sm:mb-0">
                                                        {
                                                            teamMembers[
                                                                currentIndex
                                                            ].bio
                                                        }
                                                    </p>

                                                    {/* Social Links - Responsive */}
                                                    <div className="flex flex-wrap gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100 dark:border-dark-secondary">
                                                        <a
                                                            href={`mailto:${teamMembers[currentIndex].email}`}
                                                            className="flex items-center gap-2 text-gray-500 dark:text-dark-tertiary hover:text-orange-500 dark:hover:text-orange-400 transition-colors group"
                                                        >
                                                            <FaEnvelope className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                                                            <span className="text-sm sm:text-md font-medium hidden sm:inline">
                                                                Email
                                                            </span>
                                                        </a>
                                                        {teamMembers[
                                                            currentIndex
                                                        ].linkedin && (
                                                            <a
                                                                href={`${teamMembers[currentIndex].linkedin}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-gray-500 dark:text-dark-tertiary hover:text-orange-500 dark:hover:text-orange-400 transition-colors group"
                                                            >
                                                                <FaLinkedin className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                                                                <span className="text-sm sm:text-md font-medium hidden sm:inline">
                                                                    LinkedIn
                                                                </span>
                                                            </a>
                                                        )}
                                                        {teamMembers[
                                                            currentIndex
                                                        ].github && (
                                                            <a
                                                                href={`${teamMembers[currentIndex].github}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-gray-500 dark:text-dark-tertiary hover:text-orange-500 dark:hover:text-orange-400 transition-colors group"
                                                            >
                                                                <FaGithub className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                                                                <span className="text-sm sm:text-md font-medium hidden sm:inline">
                                                                    GitHub
                                                                </span>
                                                            </a>
                                                        )}
                                                    </div>

                                                    {/* Navigation Dots - Responsive positioning */}
                                                    <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex gap-2">
                                                        {teamMembers.map(
                                                            (_, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() =>
                                                                        setCurrentIndex(
                                                                            idx
                                                                        )
                                                                    }
                                                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                                                        idx ===
                                                                        currentIndex
                                                                            ? "bg-orange-500 w-4 sm:w-6"
                                                                            : "bg-orange-200 dark:bg-dark-tertiary hover:bg-orange-300"
                                                                    }`}
                                                                    title={`Show ${teamMembers[idx].name}'s profile`}
                                                                    aria-label={`Show ${teamMembers[idx].name}'s profile`}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Tech Stack Section - Responsive */}
                        <div className="rounded-2xl bg-gray-50 dark:bg-dark-secondary p-6 sm:p-8 lg:p-12 overflow-hidden">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-500 mb-6 sm:mb-8 lg:mb-10 text-center sm:text-left">
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
                                className="flex space-x-12 sm:space-x-16 lg:space-x-[16rem]"
                            >
                                {[...techStack, ...techStack].map(
                                    (tech, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center gap-2 sm:gap-3 group flex-shrink-0"
                                        >
                                            <tech.icon className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-600 dark:text-dark-tertiary group-hover:text-orange-500 transition-colors transform group-hover:scale-110 duration-300" />
                                            <span className="text-sm sm:text-base font-medium text-gray-600 dark:text-dark-tertiary whitespace-nowrap">
                                                {tech.name}
                                            </span>
                                        </div>
                                    )
                                )}
                            </motion.div>
                        </div>

                        {/* Contact Section - Responsive */}
                        <div className="rounded-2xl bg-orange-50 dark:bg-dark-secondary p-6 sm:p-8 lg:p-12 text-center">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-dark-text mb-3 sm:mb-4">
                                Let&apos;s Connect
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-dark-tertiary mb-6 sm:mb-8 max-w-2xl mx-auto">
                                Have questions about Reflectify? We&apos;d love
                                to hear from you and discuss how we can help
                                transform your institution&apos;s feedback
                                system.
                            </p>
                            <a
                                href="mailto:team@reflectify.com"
                                className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors text-sm sm:text-base"
                            >
                                Get in Touch
                            </a>
                        </div>
                    </div>
                </div>
                <Footer />
            </PublicRoute>
        </>
    );
}
