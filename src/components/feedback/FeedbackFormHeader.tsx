// src/components/feedback/FeedbackFormHeader.tsx
"use client";

import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import { DocumentChartBarIcon } from "@heroicons/react/24/outline";

interface FeedbackFormHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const FeedbackFormHeader = ({
  isRefreshing,
  onRefresh,
  onCreateNew,
}: FeedbackFormHeaderProps) => {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-light-background dark:bg-dark-muted-background p-6 rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary"
    >
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Section: Title and Descriptions */}
        <div>
          {/* Responsive text sizing */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-light-text dark:text-dark-text flex items-center gap-3">
            Feedback Forms
          </h1>
          <p className="text-base text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
            <DocumentChartBarIcon className="h-6 w-6 text-positive-main" />
            Manage and monitor feedback forms across departments
          </p>
        </div>

        {/* Right Section: Response Count and Last Updated */}
        {/* Full width on small screens, auto width and right aligned on sm and up */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 py-2.5 px-4 text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-xl hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
            title="Refresh Feedback Forms"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing ..." : "Refresh Data"}
          </button>

          <button
            onClick={onCreateNew}
            className="flex-1 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                                    hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                                    transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="h-5 w-5 border-light-text dark:border-dark-text" />
              <span className="flex items-center justify-center gap-2">
                Create Feedback Form
              </span>
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
