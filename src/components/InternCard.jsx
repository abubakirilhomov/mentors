import React, { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const InternCard = ({ intern, onRate, mentorId, rules = [] }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedViolations, setSelectedViolations] = useState([]);
  const [showViolations, setShowViolations] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onRate(
        intern._id,
        rating,
        feedback.trim() || undefined,
        selectedViolations,
        intern.lessonId || undefined
      );
      setRating(0);
      setFeedback("");
      setShowFeedback(false);
      setSelectedViolations([]);
      setShowViolations(false);
      toast.success("Стажер успешно оценен")
    } catch (error) {
      console.error("Ошибка при отправке оценки:", error);
      toast.error("Ошибка с оценкой стажеров")
    }
    setIsSubmitting(false);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isActive =
        hoveredStar >= starNumber || (!hoveredStar && rating >= starNumber);

      return (
        <motion.button
          key={starNumber}
          type="button"
          className="transition-all duration-200 cursor-pointer hover:scale-110"
          onClick={() => setRating(starNumber)}
          onMouseEnter={() => setHoveredStar(starNumber)}
          onMouseLeave={() => setHoveredStar(0)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <Star
            className={`w-8 h-8 ${
              isActive ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } transition-colors duration-200`}
          />
        </motion.button>
      );
    });
  };

  const getCategoryColorClass = (category) => {
    const colorMap = {
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      green: "bg-green-500",
      black: "bg-black",
    };
    return colorMap[category?.toLowerCase()] || "bg-gray-500";
  };

  // сортировка правил по категориям
  const categoryOrder = ["green", "yellow", "red", "black"];
  const sortedRules = [...rules].sort((a, b) => {
    const aCategory = a.category?.toLowerCase() || "";
    const bCategory = b.category?.toLowerCase() || "";
    const aIndex =
      categoryOrder.indexOf(aCategory) === -1
        ? categoryOrder.length
        : categoryOrder.indexOf(aCategory);
    const bIndex =
      categoryOrder.indexOf(bCategory) === -1
        ? categoryOrder.length
        : categoryOrder.indexOf(bCategory);
    return aIndex - bIndex;
  });
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGradeColorClass = (grade) => {
    const map = {
      junior: "bg-green-100 text-green-700",
      "strong-junior": "bg-blue-100 text-blue-700",
      middle: "bg-yellow-100 text-yellow-700",
      "strong-middle": "bg-orange-100 text-orange-700",
      senior: "bg-red-100 text-red-700",
    };
    return map[grade] || "bg-gray-100 text-gray-700";
  };

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-xl p-8 max-w-sm mx-auto flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Аватар + имя */}
      <div className="text-center mb-6">
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <span className="text-2xl font-bold text-white">
            {intern.name[0]}
            {intern.lastName[0]}
          </span>
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {intern.name} {intern.lastName}
        </h2>
        <div className="flex mb-3 justify-center items-center gap-2 text-gray-700 text-sm">
          <span className="font-medium">{intern.topic}</span>
          <span className="px-2 py-0.5 bg-gray-100 rounded-md text-gray-600">
            {intern.group}
          </span>
          <span className="text-gray-500">|</span>
          <span className="font-semibold text-red-500">
            {formatTime(intern.time)}
          </span>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getGradeColorClass(
            intern.grade
          )}`}
        >
          {intern.grade}
        </span>
        <p className="text-gray-600 text-sm">{intern.branch.name}</p>
      </div>

      {/* Общий балл и количество уроков */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-red-600">
            {intern?.score ? intern.score.toFixed(1) : "0.0"}
          </div>
          <div className="text-sm text-gray-600">Общий балл</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-2 text-center">
          <div className="text-xl font-bold text-orange-600">
            {Object.keys(intern.lessonsVisited || {}).length || 0}
          </div>
          <div className="text-sm text-gray-600">Уроков посещено</div>
        </div>
      </motion.div>

      {/* Блок оценивания */}
      <div className="flex-1 flex flex-col">
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Оцените стажёра
          </h3>
          <div className="flex justify-center gap-1 mb-4">{renderStars()}</div>
          {rating > 0 && (
            <p className="text-sm text-gray-600">Ваша оценка: {rating} из 5</p>
          )}
        </motion.div>

        {/* Кнопка комментария */}
        <AnimatePresence>
          {rating > 0 && (
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.1 }}
            >
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className="flex items-center gap-2 mx-auto text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                {showFeedback ? "Скрыть комментарий" : "Добавить комментарий"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Поле комментария */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Напишите комментарий (необязательно)"
                className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {feedback.length}/500
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопка нарушения */}
        <AnimatePresence>
          {rating > 0 && (
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setShowViolations(!showViolations)}
                className="flex items-center gap-2 mx-auto text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                <MessageSquare className="w-4 h-4" />
                {showViolations ? "Скрыть нарушения" : "Добавить нарушение"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Список правил */}
        <AnimatePresence>
          {rating > 0 && showViolations && rules.length > 0 && (
            <motion.div
              className="mb-4 flex-1 flex flex-col"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Выберите нарушения
              </h4>
              <div className="flex-1 border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="max-h-[400px] overflow-y-auto space-y-2">
                  {sortedRules.map((rule) => (
                    <motion.label
                      key={rule._id}
                      className="flex items-start gap-3 text-sm cursor-pointer hover:bg-white p-3 rounded-lg border border-transparent hover:border-gray-200 transition-all duration-200 bg-white shadow-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="checkbox"
                        value={rule._id}
                        checked={selectedViolations.includes(rule._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedViolations([
                              ...selectedViolations,
                              rule._id,
                            ]);
                          } else {
                            setSelectedViolations(
                              selectedViolations.filter((id) => id !== rule._id)
                            );
                          }
                        }}
                        className="mt-1 flex-shrink-0 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-white text-xs font-medium ${getCategoryColorClass(
                              rule.category
                            )} shadow-sm`}
                          >
                            {rule.category?.toUpperCase() || "ОБЩЕЕ"}
                          </span>
                        </div>
                        <span className="text-gray-800 font-medium">
                          {rule.title}
                        </span>
                        {rule.description && (
                          <span className="text-xs text-gray-500 leading-relaxed">
                            {rule.description}
                          </span>
                        )}
                      </div>
                    </motion.label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Кнопка отправки */}
        <motion.button
          onClick={handleSubmitRating}
          disabled={isSubmitting || rating === 0}
          className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Отправляем...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Отправить оценку
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default InternCard;
