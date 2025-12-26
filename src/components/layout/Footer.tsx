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
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-dark-background border-t border-secondary-lighter dark:border-dark-secondary"
        >
            <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                <div className="flex items-center justify-between gap-4 sm:gap-12 py-12 sm:py-16">
                    {/* Brand Section */}
                    <div className="space-y-6 sm:col-span-2 lg:col-span-1 max-w-xl">
                        <motion.div
                            className="text-2xl sm:text-3xl font-bold"
                            animate={{
                                opacity: [0.8, 1, 0.8],
                            }}
                            transition={{
                                duration: 3,
                                ease: "easeInOut",
                                repeat: Infinity,
                            }}
                        >
                            <span className="text-light-highlight dark:text-dark-highlight">
                                Reflectify: Coordinated Feedbacks
                            </span>
                        </motion.div>
                        <p className="text-secondary-dark dark:text-dark-tertiary leading-relaxed text-sm sm:text-base">
                            Empowering educational institutions with
                            comprehensive feedback management solutions for a
                            better learning experience.
                        </p>
                        <div className="flex space-x-4 sm:space-x-5">
                            {[
                                // { icon: Facebook, href: "#" },
                                // { icon: Twitter, href: "#" },
                                // { icon: Instagram, href: "#" },
                                {
                                    icon: Linkedin,
                                    href: "https://www.linkedin.com/school/ldrp-institute-of-technology-research-gujarat-technological-university-india/",
                                },
                            ].map((social, index) => (
                                <motion.a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-2 rounded-full bg-primary-lighter dark:bg-primary-darker/20 text-primary-dark dark:text-primary-light hover:bg-primary-lighter dark:hover:bg-primary-darker/30 transition-colors"
                                >
                                    <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4 sm:space-y-6">
                        <h3 className="text-base sm:text-lg font-semibold text-secondary-darker dark:text-dark-text">
                            Quick Links
                        </h3>
                        <ul className="space-y-3 sm:space-y-4">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href}>
                                        <motion.span
                                            className="text-sm sm:text-base text-secondary-dark dark:text-dark-tertiary hover:text-primary-dark dark:hover:text-primary-light cursor-pointer inline-block"
                                            whileHover={{ x: 5 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                            }}
                                        >
                                            {link.name}
                                        </motion.span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4 sm:space-y-6">
                        <h3 className="text-base sm:text-lg font-semibold text-secondary-darker dark:text-dark-text">
                            Contact Us
                        </h3>
                        <ul className="space-y-3 sm:space-y-4">
                            <li className="flex items-start space-x-3">
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary-dark dark:text-primary-light mt-1 shrink-0" />
                                <span className="text-sm sm:text-base text-secondary-dark dark:text-dark-tertiary break-all">
                                    reflectify.ldrp@gmail.com
                                </span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-dark dark:text-primary-light mt-1 shrink-0" />
                                <span className="text-sm sm:text-base text-secondary-dark dark:text-dark-tertiary">
                                    LDRP Institute of Technology & Research,
                                    <br />
                                    Near KH-5, Sector-15,
                                    <br />
                                    Gandhinagar, Gujarat 382015
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-secondary-lighter dark:border-dark-secondary py-6 sm:py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-center sm:text-left">
                        {typeof window !== "undefined" && (
                            <p className="text-sm sm:text-base text-secondary-dark dark:text-dark-tertiary">
                                © {currentYear} Reflectify. All rights reserved.
                            </p>
                        )}
                        <a href="/about-us">
                            <motion.p
                                className="text-sm sm:text-base text-secondary-dark dark:text-dark-tertiary"
                                whileHover={{ scale: 1.02 }}
                            >
                                Created by Team Reflectify (Kandarp Gajjar,
                                Harsh Dodiya & Parin Dave)
                            </motion.p>
                        </a>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
}
