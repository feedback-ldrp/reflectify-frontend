/**
@file src/app/contact/page.tsx
@description Enhanced contact page for Reflectify with improved UI/UX and accessibility.
*/

"use client";

import { PublicRoute } from "@/components/PublicRoute";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { useState } from "react";
import { EnvelopeIcon, MapPinIcon } from "@heroicons/react/24/outline";
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
          errorData.message || "Failed to send message from backend.",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
      value: "feedback_ce@ldrp.ac.in",
      href: "mailto:feedback_ce@ldrp.ac.in",
    },
    {
      icon: MapPinIcon,
      label: "Address",
      value:
        "LDRP Institute of Technology and Research, Gandhinagar, Gujarat, India",
      href: "https://maps.app.goo.gl/6Dh75Kw8tDKk7WTU7",
    },
  ];

  return (
    <PublicRoute>
      <Header />
      <main className="min-h-screen bg-light-background dark:bg-dark-background pt-16 pb-20 overflow-hidden relative">
        {/* Background Glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-main/5 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary-main/5 blur-[100px] rounded-full -z-10" />

        <div className="max-w-[1400px] mx-auto px-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-8xl md:text-9xl font-black text-light-highlight dark:text-dark-highlight tracking-tighter leading-[0.8] mb-8">
              Get in.<br />
              <span className="text-light-text dark:text-dark-text opacity-50">Touch.</span>
            </h1>
            <p className="text-2xl text-light-muted-text dark:text-dark-muted-text max-w-xl leading-relaxed">
              Have questions or feedback? We&apos;d love to hear from you. Reach out and let&apos;s start a conversation.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className="glass-card p-10 rounded-[3rem] border border-black/5 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-main/5 blur-[50px] -z-10" />

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-widest text-primary-main opacity-80 ml-1">Name</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 rounded-2xl h-14 px-6 text-lg focus:ring-primary-main/50"
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-widest text-primary-main opacity-80 ml-1">Email</label>
                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 rounded-2xl h-14 px-6 text-lg focus:ring-primary-main/50"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-primary-main opacity-80 ml-1">Subject</label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="How can we help?"
                      className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 rounded-2xl h-14 px-6 text-lg focus:ring-primary-main/50"
                    />
                    {errors.subject && <p className="text-red-500 text-xs mt-1 ml-1">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-primary-main opacity-80 ml-1">Message</label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Your message here..."
                      className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 rounded-[2rem] p-6 text-lg focus:ring-primary-main/50 resize-none"
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1 ml-1">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-16 bg-primary-main rounded-[2rem] text-white font-black text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-5 space-y-8"
            >
              <div className="glass-card p-10 rounded-[3rem] border border-black/5 dark:border-white/5">
                <h2 className="text-3xl font-black mb-10 text-glow">Connect.</h2>
                <div className="space-y-10">
                  {contactInfo.map((info, index) => (
                    <a
                      key={index}
                      href={info.href}
                      className="flex items-start gap-6 group"
                    >
                      <div className="w-14 h-14 bg-primary-main/10 rounded-2xl flex items-center justify-center group-hover:bg-primary-main transition-colors duration-500">
                        <info.icon className="w-7 h-7 text-primary-main group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-widest text-primary-main mb-1">{info.label}</p>
                        <p className="text-xl font-bold opacity-80 group-hover:opacity-100 transition-opacity leading-snug">
                          {info.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="glass-card p-10 rounded-[3rem] border border-black/5 dark:border-white/5 bg-gradient-to-br from-primary-main/5 to-transparent">
                <h3 className="text-xl font-bold mb-4">Quick Response</h3>
                <p className="text-light-muted-text dark:text-dark-muted-text leading-relaxed">
                  Our team typically responds to all inquiries within 24 hours during business days. We value your feedback and look forward to hearing from you.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </PublicRoute>
  );
}
