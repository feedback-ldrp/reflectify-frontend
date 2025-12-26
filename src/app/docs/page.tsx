// src/app/(main)/documentation/page.tsx

"use client";

import { PublicRoute } from "@/components/PublicRoute";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
    FaGithub,
    FaBook,
    FaExternalLinkAlt,
} from "react-icons/fa";
import {
    SiNextdotjs,
    SiFlask,
    SiNodedotjs,
    SiReact,
    SiPython,
    SiJavascript,
} from "react-icons/si";
import { motion } from "framer-motion";

const documentationSections = [
    {
        id: "frontend",
        title: "Frontend Documentation",
        description:
            "Complete guide to our React/Next.js frontend architecture, component library, and user interface implementations.",
        icon: SiNextdotjs,
        color: "blue",
        technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
        techIcons: [SiReact, SiNextdotjs],
        features: [
            "Component architecture and design system",
            "State management with React hooks",
            "Responsive design implementation",
            "Authentication and routing",
            "Performance optimization techniques",
        ],
        docsLink: "https://deepwiki.com/slantie/reflectify-frontend",
        githubLink: "https://github.com/slantie/reflectify-frontend",
        // Using your color system
        gradientFrom: "from-highlight1-main",
        gradientTo: "to-highlight1-dark",
        bgColor: "bg-highlight1-lighter dark:bg-dark-secondary",
        textColor: "text-highlight1-main dark:text-highlight1-textDark",
        borderColor: "border-highlight1-light dark:border-highlight1-dark",
        hoverColor:
            "hover:text-highlight1-dark dark:hover:text-highlight1-light",
    },
    {
        id: "backend",
        title: "Backend Documentation",
        description:
            "Comprehensive documentation for our Node.js backend services, API endpoints, and database management.",
        icon: SiNodedotjs,
        color: "green",
        technologies: ["Node.js", "Express", "PostgreSQL", "Prisma"],
        techIcons: [SiNodedotjs, SiJavascript],
        features: [
            "RESTful API design and implementation",
            "Database schema and relationships",
            "Authentication and authorization",
            "Data validation and error handling",
            "Performance monitoring and logging",
        ],
        docsLink: "https://deepwiki.com/slantie/reflectify-backend",
        githubLink: "https://github.com/slantie/reflectify-backend",
        // Using your color system
        gradientFrom: "from-positive-main",
        gradientTo: "to-positive-dark",
        bgColor: "bg-positive-lighter dark:bg-dark-secondary",
        textColor: "text-positive-main dark:text-positive-textDark",
        borderColor: "border-positive-light dark:border-positive-dark",
        hoverColor: "hover:text-positive-dark dark:hover:text-positive-light",
    },
    {
        id: "server",
        title: "Server Documentation",
        description:
            "Detailed guide to our Flask server infrastructure, deployment strategies, and system administration.",
        icon: SiFlask,
        color: "purple",
        technologies: ["Python", "Flask", "Docker", "DevOps"],
        techIcons: [SiPython, SiFlask],
        features: [
            "Flask application structure",
            "Docker containerization setup",
            "CI/CD pipeline configuration",
            "Server deployment and scaling",
            "Monitoring and maintenance procedures",
        ],
        docsLink: "https://deepwiki.com/slantie/reflectify-server",
        githubLink: "https://github.com/slantie/reflectify-server",
        // Using your color system
        gradientFrom: "from-highlight2-main",
        gradientTo: "to-highlight2-dark",
        bgColor: "bg-highlight2-lighter dark:bg-dark-secondary",
        textColor: "text-highlight2-main dark:text-highlight2-light",
        borderColor: "border-highlight2-light dark:border-highlight2-dark",
        hoverColor:
            "hover:text-highlight2-dark dark:hover:text-highlight2-light",
    },
];

export default function DocumentationPage() {
    const router = useRouter();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    return (
        <>
            <PublicRoute>
                <Header />
                <div
                    suppressHydrationWarning
                    className="max-w-[1920px] min-h-[92.5vh] flex mx-auto px-3 sm:px-6 py-4 sm:py-8 bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text"
                >
                    <div className="space-y-8 sm:space-y-12 lg:space-y-16">
                        {/* Header */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-1.5 sm:p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-full transition-colors"
                                title="Go back"
                                aria-label="Go back"
                            >
                                <ArrowLeftIcon className="h-5 w-5 sm:h-6 sm:w-6 text-light-text dark:text-dark-tertiary" />
                            </button>
                            <h1 className="text-2xl sm:text-3xl font-semibold text-light-text dark:text-dark-text">
                                Documentation
                            </h1>
                        </div>

                        {/* Hero Section */}
                        <div className="text-center px-4 sm:px-8 lg:px-16">
                            <div className="min-w-[80vw] mx-auto">
                                <h2 className="text-3xl  sm:text-4xl lg:text-5xl font-bold text-light-text dark:text-dark-text mb-4">
                                    Comprehensive
                                    <span className="text-primary-main dark:text-primary-light">
                                        {" "}
                                        Developer{" "}
                                    </span>
                                    Documentation
                                </h2>
                                <p className="text-lg sm:text-xl text-light-muted-text dark:text-dark-tertiary leading-relaxed min-w-[80vw]">
                                    Everything you need to understand,
                                    contribute to, and extend the Reflectify
                                    platform. From frontend components to
                                    backend APIs and server infrastructure.
                                </p>
                            </div>
                        </div>

                        {/* Documentation Cards */}
                        <div className="flex items-center justify-center">
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-6 lg:px-14"
                            >
                                {documentationSections.map(
                                    (section, _index) => (
                                        <motion.div
                                            key={section.id}
                                            variants={itemVariants}
                                            className="group relative"
                                        >
                                            {/* Background gradient effect */}
                                            <div
                                                className={`absolute inset-0 bg-gradient-to-r ${section.gradientFrom} ${section.gradientTo} rounded-3xl transform transition-transform group-hover:translate-x-2 group-hover:translate-y-2 opacity-75`}
                                            ></div>

                                            {/* Main card */}
                                            <div
                                                className={`relative ${section.bgColor} rounded-3xl border ${section.borderColor} p-6 sm:p-8 h-full flex flex-col transition-all duration-300 group-hover:shadow-2xl`}
                                            >
                                                {/* Header */}
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div
                                                        className={`p-3 rounded-2xl bg-gradient-to-r ${section.gradientFrom} ${section.gradientTo}`}
                                                    >
                                                        <section.icon className="h-8 w-8 text-white" />
                                                    </div>
                                                    <h3 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                                                        {section.title}
                                                    </h3>
                                                </div>

                                                {/* Description */}
                                                <p className="text-light-muted-text dark:text-dark-tertiary mb-6 leading-relaxed flex-grow">
                                                    {section.description}
                                                </p>

                                                {/* Technologies */}
                                                <div className="mb-6">
                                                    <h4 className="text-sm font-semibold text-secondary-main dark:text-dark-tertiary uppercase tracking-wide mb-3">
                                                        Technologies
                                                    </h4>
                                                    <div className="flex items-center gap-3">
                                                        {section.techIcons.map(
                                                            (
                                                                TechIcon,
                                                                techIndex
                                                            ) => (
                                                                <TechIcon
                                                                    key={
                                                                        techIndex
                                                                    }
                                                                    className={`h-6 w-6 ${section.textColor} opacity-80`}
                                                                />
                                                            )
                                                        )}
                                                        <div className="flex flex-wrap gap-2">
                                                            {section.technologies
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        tech,
                                                                        techIndex
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                techIndex
                                                                            }
                                                                            className={`px-2 py-1 ${section.bgColor} ${section.textColor} text-xs font-medium rounded-full border ${section.borderColor}`}
                                                                        >
                                                                            {
                                                                                tech
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Features */}
                                                <div className="mb-8">
                                                    <h4 className="text-sm font-semibold text-secondary-main dark:text-dark-tertiary uppercase tracking-wide mb-3">
                                                        What&apos;s Included
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {section.features
                                                            .slice(0, 3)
                                                            .map(
                                                                (
                                                                    feature,
                                                                    featureIndex
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            featureIndex
                                                                        }
                                                                        className="flex items-start gap-2"
                                                                    >
                                                                        <div
                                                                            className={`w-1.5 h-1.5 rounded-full ${section.gradientFrom.replace(
                                                                                "from-",
                                                                                "bg-"
                                                                            )} mt-2 flex-shrink-0`}
                                                                        ></div>
                                                                        <span className="text-sm text-light-muted-text dark:text-dark-tertiary">
                                                                            {
                                                                                feature
                                                                            }
                                                                        </span>
                                                                    </li>
                                                                )
                                                            )}
                                                    </ul>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <a
                                                        href={section.docsLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${section.gradientFrom} ${section.gradientTo} text-white rounded-xl font-semibold hover:scale-[1.02] hover:shadow-lg transition-all duration-300 group/btn`}
                                                    >
                                                        <FaBook className="h-4 w-4" />
                                                        <span>View Docs</span>
                                                        <FaExternalLinkAlt className="h-3 w-3 opacity-75 group-hover/btn:opacity-100 transition-opacity" />
                                                    </a>
                                                    <a
                                                        href={
                                                            section.githubLink
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 ${section.borderColor} ${section.textColor} ${section.hoverColor} rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 group/btn`}
                                                    >
                                                        <FaGithub className="h-4 w-4" />
                                                        <span>GitHub</span>
                                                        <FaExternalLinkAlt className="h-3 w-3 opacity-75 group-hover/btn:opacity-100 transition-opacity" />
                                                    </a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
                <Footer />
            </PublicRoute>
        </>
    );
}
