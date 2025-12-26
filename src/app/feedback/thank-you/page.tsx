"use client";

import { motion } from "framer-motion";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
// import { Card } from "@/components/ui/Card";

export default function ThankYouPage() {
    return (
        <div className="min-h-screen bg-light-muted-background dark:bg-dark-background flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className=""
            >
                <div className="p-12 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            delay: 0.2,
                            type: "spring",
                            stiffness: 200,
                        }}
                        className="mb-8"
                    >
                        <CheckCircleIcon className="mx-auto h-24 w-24 text-green-600" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-bold text-light-text dark:text-dark-text mb-4"
                    >
                        Thank You for Your Feedback!
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-light-muted-text dark:text-dark-muted-text mb-8"
                    >
                        Your responses have been successfully recorded and will
                        help us improve our services.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-4"
                    >
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-green-800 dark:text-green-200 font-medium">
                                ✓ Your feedback has been submitted successfully
                            </p>
                        </div>

                        <div className="text-light-muted-text dark:text-dark-muted-text">
                            <p className="text-sm">
                                You can now close this window or tab.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-8 pt-6 border-t border-light-secondary dark:border-dark-secondary"
                    >
                        <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                            Thank you for taking the time to provide your
                            valuable feedback.
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
