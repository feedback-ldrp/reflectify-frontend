/**
@file src/app/contact/page.tsx
@description Enhanced contact page for Reflectify with improved UI/UX and accessibility.
*/

"use client";

import { PublicRoute } from "@/components/PublicRoute";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import {
    EnvelopeIcon,
    MapPinIcon,
} from "@heroicons/react/24/outline";
import Textarea from "@/components/ui/Textarea";
import { Input } from "@/components/ui";
import { Header } from "@/components/layout/Header";
import { CONTACT_ENDPOINTS } from "@/constants/apiEndpoints";
import showToast from "@/lib/toast";

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
}

export default function ContactPage() {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!formData.subject.trim()) {
            newErrors.subject = "Subject is required";
        }

        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "Message must be at least 10 characters long";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const backendUrl = CONTACT_ENDPOINTS.BASE;
            const response = await fetch(`${backendUrl}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to send message from backend."
                );
            }

            showToast.success("Message sent successfully!");
            setFormData({ name: "", email: "", subject: "", message: "" });
            setErrors({});
        } catch (error: any) {
            showToast.error("Failed to send message: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const contactInfo = [
        {
            icon: EnvelopeIcon,
            label: "Email",
            value: "reflectify.ldrp@gmail.com",
            href: "mailto:reflectify.ldrp@gmail.com",
        },
        {
            icon: MapPinIcon,
            label: "Address",
            value: "LDRP Institute of Technology and Research, Gandhinagar, Gujarat, India",
            href: "https://maps.app.goo.gl/6Dh75Kw8tDKk7WTU7",
        },
    ];

    return (
        <PublicRoute>
            <Header />
            <div className="bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text flex flex-col">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-light-highlight dark:text-dark-highlight mb-6">
                            Get in Touch
                        </h1>
                        <p className="text-lg sm:text-xl text-light-text dark:text-dark-text mx-auto leading-relaxed">
                            Have questions or feedback? We&apos;d love to hear
                            from you. Reach out to us and let&apos;s start a
                            conversation.
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:col-span-2"
                        >
                            <div className="bg-light-muted dark:bg-dark-muted p-6 sm:p-8 rounded-3xl shadow-xl border border-light-secondary dark:border-dark-secondary">
                                <h2 className="text-2xl font-bold text-light-highlight dark:text-dark-highlight mb-6">
                                    Send us a message
                                </h2>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Name and Email Row */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2"
                                            >
                                                Name *
                                            </label>
                                            <Input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-light-background dark:bg-dark-background border-2 rounded-xl text-light-text dark:text-dark-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-highlight dark:focus:ring-dark-highlight focus:border-transparent ${
                                                    errors.name
                                                        ? "border-red-500 dark:border-red-400"
                                                        : "border-light-secondary dark:border-dark-secondary hover:border-light-highlight dark:hover:border-dark-highlight"
                                                }`}
                                                placeholder="Your full name"
                                                aria-invalid={
                                                    errors.name
                                                        ? "true"
                                                        : "false"
                                                }
                                                aria-describedby={
                                                    errors.name
                                                        ? "name-error"
                                                        : undefined
                                                }
                                            />
                                            {errors.name && (
                                                <p
                                                    id="name-error"
                                                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                                                >
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2"
                                            >
                                                Email *
                                            </label>
                                            <Input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 bg-light-background dark:bg-dark-background border-2 rounded-xl text-light-text dark:text-dark-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-highlight dark:focus:ring-dark-highlight focus:border-transparent ${
                                                    errors.email
                                                        ? "border-red-500 dark:border-red-400"
                                                        : "border-light-secondary dark:border-dark-secondary hover:border-light-highlight dark:hover:border-dark-highlight"
                                                }`}
                                                placeholder="your.email@example.com"
                                                aria-invalid={
                                                    errors.email
                                                        ? "true"
                                                        : "false"
                                                }
                                                aria-describedby={
                                                    errors.email
                                                        ? "email-error"
                                                        : undefined
                                                }
                                            />
                                            {errors.email && (
                                                <p
                                                    id="email-error"
                                                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                                                >
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label
                                            htmlFor="subject"
                                            className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2"
                                        >
                                            Subject *
                                        </label>
                                        <Input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-light-background dark:bg-dark-background border-2 rounded-xl text-light-text dark:text-dark-text transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-light-highlight dark:focus:ring-dark-highlight focus:border-transparent ${
                                                errors.subject
                                                    ? "border-red-500 dark:border-red-400"
                                                    : "border-light-secondary dark:border-dark-secondary hover:border-light-highlight dark:hover:border-dark-highlight"
                                            }`}
                                            placeholder="What's this about?"
                                            aria-invalid={
                                                errors.subject
                                                    ? "true"
                                                    : "false"
                                            }
                                            aria-describedby={
                                                errors.subject
                                                    ? "subject-error"
                                                    : undefined
                                            }
                                        />
                                        {errors.subject && (
                                            <p
                                                id="subject-error"
                                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                            >
                                                {errors.subject}
                                            </p>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="block text-sm font-semibold text-light-text dark:text-dark-text mb-2"
                                        >
                                            Message *
                                        </label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            rows={6}
                                            className={`w-full px-4 py-3 bg-light-background dark:bg-dark-background border-2 rounded-xl text-light-text dark:text-dark-text transition-all duration-200 resize-none focus:outline-none focus:ring-2 focus:ring-light-highlight dark:focus:ring-dark-highlight focus:border-transparent ${
                                                errors.message
                                                    ? "border-red-500 dark:border-red-400"
                                                    : "border-light-secondary dark:border-dark-secondary hover:border-light-highlight dark:hover:border-dark-highlight"
                                            }`}
                                            placeholder="Tell us more about your inquiry..."
                                            aria-invalid={
                                                errors.message
                                                    ? "true"
                                                    : "false"
                                            }
                                            aria-describedby={
                                                errors.message
                                                    ? "message-error"
                                                    : undefined
                                            }
                                        />
                                        {errors.message && (
                                            <p
                                                id="message-error"
                                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                                            >
                                                {errors.message}
                                            </p>
                                        )}
                                        <p className="mt-2 text-sm text-light-text/70 dark:text-dark-text/70">
                                            {formData.message.length}/500
                                            characters
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-light-highlight to-light-highlight/90 dark:from-dark-highlight dark:to-dark-highlight/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </div>
                                        ) : (
                                            "Send Message"
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>

                        {/* Contact Information */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="space-y-4"
                        >
                            <div className="bg-light-muted dark:bg-dark-muted p-6 sm:p-8 rounded-3xl shadow-xl border border-light-secondary dark:border-dark-secondary">
                                <h2 className="text-2xl font-bold text-light-highlight dark:text-dark-highlight mb-6">
                                    Contact Information
                                </h2>
                                <div className="space-y-6">
                                    {contactInfo.map((info, index) => (
                                        <motion.a
                                            key={index}
                                            href={info.href}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.4,
                                                delay: 0.6 + index * 0.1,
                                            }}
                                            className="flex items-start gap-4 p-4 rounded-xl hover:bg-light-background dark:hover:bg-dark-background transition-all duration-200 group"
                                        >
                                            <div className="flex-shrink-0 w-12 h-12 bg-light-highlight dark:bg-dark-highlight rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                <info.icon className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-light-text dark:text-dark-text mb-1">
                                                    {info.label}
                                                </h3>
                                                <p className="text-light-text/70 dark:text-dark-text/70 group-hover:text-light-highlight dark:group-hover:text-dark-highlight transition-colors duration-200">
                                                    {info.value}
                                                </p>
                                            </div>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>

                            {/* Response Time */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.8 }}
                                className="bg-gradient-to-br from-light-highlight/10 to-light-highlight/5 dark:from-dark-highlight/10 dark:to-dark-highlight/5 p-6 rounded-2xl border border-light-highlight/20 dark:border-dark-highlight/20"
                            >
                                <h3 className="text-lg font-semibold text-light-highlight dark:text-dark-highlight mb-3">
                                    Quick Response
                                </h3>
                                <p className="text-sm text-light-text/80 dark:text-dark-text/80">
                                    We typically respond to all inquiries within
                                    24 hours during business days.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                <Footer />
            </div>
        </PublicRoute>
    );
}
