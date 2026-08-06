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
        githubLink: "https://github.com/feedback-ce/reflectify-frontend",
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
        githubLink: "https://github.com/feedback-ce/reflectify-backend",
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
        githubLink: "https://github.com/feedback-ce/reflectify-server",
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

    return (
        <PublicRoute>
            <Header />
            <main className="min-h-screen bg-light-background dark:bg-dark-background pt-16 pb-20 overflow-hidden relative">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-main/5 blur-[120px] rounded-full -z-10" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-main/5 blur-[100px] rounded-full -z-10" />

                <div className="max-w-[1400px] mx-auto px-10">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-20 text-center md:text-left"
                    >
                        <h1 className="text-8xl md:text-9xl font-black text-light-highlight dark:text-dark-highlight tracking-tighter leading-[0.8] mb-8">
                            Library.<br />
                            <span className="text-light-text dark:text-dark-text opacity-50">Docs.</span>
                        </h1>
                        <p className="text-2xl text-light-muted-text dark:text-dark-muted-text max-w-2xl leading-relaxed mx-auto md:mx-0">
                            Everything you need to understand, contribute to, and extend the Reflectify platform. Architecture, APIs, and beyond.
                        </p>
                    </motion.div>

                    {/* Documentation Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {documentationSections.map((section, index) => (
                            <motion.div
                                key={section.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="glass-card group p-10 rounded-[3rem] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/20 transition-all duration-500 flex flex-col justify-between h-full"
                            >
                                <div>
                                    <div className="w-16 h-16 bg-primary-main/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary-main transition-colors duration-500">
                                        <section.icon className="w-8 h-8 text-primary-main group-hover:text-white transition-colors" />
                                    </div>
                                    <h2 className="text-3xl font-black mb-4 tracking-tight">{section.title}</h2>
                                    <p className="text-light-muted-text dark:text-dark-muted-text leading-relaxed mb-8">
                                        {section.description}
                                    </p>

                                    <div className="space-y-4 mb-10">
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-main">Core Technologies</p>
                                        <div className="flex flex-wrap gap-2">
                                            {section.technologies.map((tech, i) => (
                                                <span key={i} className="px-4 py-1.5 bg-white/5 rounded-full text-sm font-medium border border-white/5">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <a
                                        href={section.docsLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full h-14 bg-primary-main rounded-2xl text-white font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        <FaBook size={18} /> View Docs
                                    </a>
                                    <a
                                        href={section.githubLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full h-14 border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/5 transition-all"
                                    >
                                        <FaGithub size={18} /> GitHub
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </PublicRoute>
    );
}
