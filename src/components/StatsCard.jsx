import React from "react";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

const StatsCard = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Month Lessons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"
            >
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Уроков (мес)</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">
                    {stats.monthLessons}
                </div>
            </motion.div>

            {/* Month Feedbacks */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"
            >
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Фидбэков (мес)</span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mt-2">
                    {stats.monthFeedbacks}
                </div>
            </motion.div>

            {/* Debt (Takes full width on mobile if needed, or just regular cell) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`bg-white p-4 rounded-2xl shadow-sm border flex flex-col justify-between col-span-2 lg:col-span-1 ${stats.totalDebt > 0 ? "border-red-200 bg-red-50" : "border-gray-100"
                    }`}
            >
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                    <AlertTriangle
                        className={`w-4 h-4 ${stats.totalDebt > 0 ? "text-red-500" : "text-gray-400"
                            }`}
                    />
                    <span className={stats.totalDebt > 0 ? "text-red-700" : ""}>
                        Долги по фидбэкам
                    </span>
                </div>
                <div
                    className={`text-2xl font-bold mt-2 ${stats.totalDebt > 0 ? "text-red-600" : "text-gray-800"
                        }`}
                >
                    {stats.totalDebt}
                </div>
                {stats.totalDebt > 0 && (
                    <div className="text-xs text-red-500 mt-1">
                        Нужно оценить!
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default StatsCard;
