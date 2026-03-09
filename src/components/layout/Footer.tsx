// src/components/layout/Footer.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Linkedin, Mail, MapPin } from "lucide-react";

// Quick links data
const quickLinks = [
    { name: "Documentation", href: "/docs" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact", href: "/contact" },
    // { name: "Features", href: "/features" }, // Commented as per original
    // { name: "Privacy Policy", href: "/privacy" }, // Commented as per original
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-light-background dark:bg-dark-background border-t border-white/5 pt-20 pb-10"
        >
            <div className="mx-auto px-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <div className="text-3xl font-black text-light-highlight dark:text-dark-highlight tracking-tighter">
                            Reflectify.
                        </div>
                        <p className="text-light-muted-text dark:text-dark-muted-text leading-relaxed text-lg max-w-sm">
                            Redefining academic feedback through transparency, anonymity, and data-driven insights. Built by students, for the future of education.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-8">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary-main">
                            Explore
                        </h3>
                        <ul className="space-y-4">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-lg text-light-text dark:text-dark-text opacity-60 hover:opacity-100 transition-opacity">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-primary-main">
                            Connect
                        </h3>
                        <div className="space-y-4">
                            <a href="mailto:feedback_ce@ldrp.ac.in" className="flex items-center gap-4 group">
                                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary-main/20 transition-colors">
                                    <Mail size={24} className="text-primary-main" />
                                </div>
                                <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">feedback_ce@ldrp.ac.in</span>
                            </a>
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 bg-white/5 rounded-xl">
                                    <MapPin size={24} className="text-primary-main" />
                                </div>
                                <span className="text-lg opacity-60 leading-tight">
                                    LDRP Institute of Technology & Research,<br />
                                    Gandhinagar, Gujarat 382015
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-center items-center gap-6">
                    <p className="text-sm opacity-40">
                        © {currentYear} Reflectify. Some rights reserved.
                    </p>
                </div>
            </div>
        </motion.footer>
    );
}
