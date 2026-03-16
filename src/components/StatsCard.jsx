import React, { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StatsCard = ({ stats, loading }) => {
    const [debtOpen, setDebtOpen] = useState(false);

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!stats) return null;

    // Progress: what % of this month's lessons have been rated
    const ratePercent = stats.monthLessons > 0
        ? Math.round((stats.monthFeedbacks / stats.monthLessons) * 100)
        : 100;

    return (
        <div className="mb-8 space-y-4">
            {/* Stat tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <span>Оценено (мес)</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mt-2">
                        {stats.monthFeedbacks}
                    </div>
                </motion.div>

                {/* Rating progress */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"
                >
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span>Оценённость</span>
                    </div>
                    <div className="mt-2">
                        <div className="text-2xl font-bold text-gray-800">
                            {ratePercent}%
                        </div>
                        <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${ratePercent === 100 ? "bg-green-400" : ratePercent >= 70 ? "bg-yellow-400" : "bg-red-400"}`}
                                style={{ width: `${ratePercent}%` }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Debt counter */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`p-4 rounded-2xl shadow-sm border flex flex-col justify-between ${
                        stats.totalDebt > 0 ? "border-red-200 bg-red-50" : "border-gray-100 bg-white"
                    }`}
                >
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <AlertTriangle
                            className={`w-4 h-4 ${stats.totalDebt > 0 ? "text-red-500" : "text-gray-400"}`}
                        />
                        <span className={stats.totalDebt > 0 ? "text-red-700" : ""}>
                            Долг (всего)
                        </span>
                    </div>
                    <div className={`text-2xl font-bold mt-2 ${stats.totalDebt > 0 ? "text-red-600" : "text-gray-800"}`}>
                        {stats.totalDebt}
                    </div>
                    {stats.totalDebt > 0 && (
                        <div className="text-xs text-red-500 mt-1">Нужно оценить!</div>
                    )}
                </motion.div>
            </div>

            {/* Debt details — collapsible */}
            {stats.totalDebt > 0 && Array.isArray(stats.debtDetails) && stats.debtDetails.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden"
                >
                    <button
                        onClick={() => setDebtOpen((v) => !v)}
                        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-red-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="font-semibold text-red-700 text-sm">
                                Долг по урокам — {stats.totalDebt} неоценённых
                            </span>
                        </div>
                        {debtOpen
                            ? <ChevronUp className="w-4 h-4 text-red-400" />
                            : <ChevronDown className="w-4 h-4 text-red-400" />
                        }
                    </button>

                    <AnimatePresence initial={false}>
                        {debtOpen && (
                            <motion.div
                                key="debt-list"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="divide-y divide-red-100 max-h-72 overflow-y-auto">
                                    {stats.debtDetails.map((item, idx) => {
                                        const dateStr = item.date
                                            ? new Date(item.date).toLocaleDateString("ru-RU", {
                                                day: "numeric",
                                                month: "short",
                                              })
                                            : "—";
                                        return (
                                            <div key={item.lessonId || idx} className="flex items-center justify-between px-5 py-2.5 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800">
                                                        {item.internName}
                                                    </span>
                                                    {item.topic && (
                                                        <span className="text-xs text-gray-500 truncate max-w-xs">
                                                            {item.topic}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-red-500 whitespace-nowrap ml-3 shrink-0">
                                                    {dateStr}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
};

export default StatsCard;
