// src/components/feedback/OverrideStudentsStats.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import overrideStudentsService from "@/services/overrideStudentsService";
import showToast from "@/lib/toast";

interface OverrideStudentsStatsProps {
    formId: string;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const OverrideStudentsStats = ({
    formId,
}: OverrideStudentsStatsProps) => {
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                setLoading(true);
                const data =
                    await overrideStudentsService.getOverrideStudentsCount(
                        formId
                    );
                setCount(data);
            } catch (err: any) {
                showToast.error(
                    "Failed to fetch override students count: " + err
                );
                setError(
                    err.message || "Failed to fetch override students count"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchCount();
    }, [formId]);

    return (
        <motion.div variants={itemVariants}>
            <StatCard
                title="Override Students"
                value={loading ? "-" : count}
                icon={Users}
                isLoading={loading}
                error={error}
            />
        </motion.div>
    );
};
