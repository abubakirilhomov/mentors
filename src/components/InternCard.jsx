import React, { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";

const InternCard = ({ intern, onRate, mentorId }) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function getWeekOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff =
      date -
      start +
      (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000;
    return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
  }

  const now = new Date();
  
  const hasRatedThisWeek = intern.feedbacks.some((fb) => {
    const feedbackDate = new Date(fb.date);
    return (
      String(fb.mentorId) === String(mentorId) &&
      getWeekOfYear(feedbackDate) === getWeekOfYear(now) &&
      feedbackDate.getFullYear() === now.getFullYear()
    );
  });

  const handleSubmitRating = async () => {
    if (rating === 0 || hasRatedThisWeek) return;

    setIsSubmitting(true);
    try {
      await onRate(intern._id, rating, feedback.trim() || undefined);
      setRating(0);
      setFeedback("");
      setShowFeedback(false);
    } catch (error) {
      console.error("Ошибка при отправке оценки:", error);
    }
    setIsSubmitting(false);
  };

  const renderStars = (interactive = true) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;
      const isActive = interactive
        ? hoveredStar >= starNumber || (!hoveredStar && rating >= starNumber)
        : rating >= starNumber;

      return (
        <button
          key={starNumber}
          type="button"
          disabled={!interactive || hasRatedThisWeek}
          className={`transition-all duration-200 ${
            interactive && !hasRatedThisWeek
              ? "cursor-pointer hover:scale-110"
              : "cursor-default"
          }`}
          onClick={() =>
            interactive && !hasRatedThisWeek && setRating(starNumber)
          }
          onMouseEnter={() =>
            interactive && !hasRatedThisWeek && setHoveredStar(starNumber)
          }
          onMouseLeave={() =>
            interactive && !hasRatedThisWeek && setHoveredStar(0)
          }
        >
          <Star
            className={`w-8 h-8 ${
              isActive ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } transition-colors duration-200`}
          />
        </button>
      );
    });
  };

  const totalLessons = Object.values(intern.lessonsVisited).reduce(
    (sum, count) => sum + count,
    0 
  );

  const myFeedback = intern.feedbacks.find((fb) => {
    const feedbackDate = new Date(fb.date);
    return (
      String(fb.mentorId) === String(mentorId) &&
      getWeekOfYear(feedbackDate) === getWeekOfYear(now) &&
      feedbackDate.getFullYear() === now.getFullYear()
    );
  });
  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm mx-auto h-[600px] flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-bold text-white">
            {intern.name[0]}
            {intern.lastName[0]}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {intern.name} {intern.lastName}
        </h2>
        <p className="text-gray-600">{intern.branch.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-0">
        <div className="bg-red-50 rounded-xl p-2 text-center">
          <div className="text-2xl font-bold text-red-600">{intern.score}</div>
          <div className="text-sm text-gray-600">Общий балл</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-2 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {totalLessons}
          </div>
          <div className="text-sm text-gray-600">Уроков посещено</div>
        </div>
      </div>

      {/* Rating Section */}
      <div className="flex-1 flex flex-col justify-center">
        {hasRatedThisWeek && myFeedback ? (
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-green-600 font-medium mb-2">
              Вы уже оценили этого стажёра на этой неделе
            </div>
            <div className="flex justify-center gap-1 mb-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={`w-8 h-8 ${
                    index < myFeedback.stars
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-700">
              Ваша оценка:{" "}
              <span className="font-semibold">{myFeedback.stars} из 5</span>
            </p>
            {myFeedback.feedback && (
              <p className="text-sm text-gray-600 mt-2 italic">
                “{myFeedback.feedback}”
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="text-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Оцените стажёра
              </h3>
              <div className="flex justify-center gap-1 mb-4">
                {renderStars()}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600">
                  Ваша оценка: {rating} из 5
                </p>
              )}
            </div>

            {/* Feedback Toggle */}
            {rating > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowFeedback(!showFeedback)}
                  className="flex items-center gap-2 mx-auto text-red-600 hover:text-red-700 transition-colors duration-200"
                >
                  <MessageSquare className="w-4 h-4" />
                  {showFeedback ? "Скрыть комментарий" : "Добавить комментарий"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Feedback Input */}
      {showFeedback && rating > 0 && !hasRatedThisWeek && (
        <div className="mt-4">
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
        </div>
      )}

      {/* Submit Button */}
      {rating > 0 && !hasRatedThisWeek && (
        <button
          onClick={handleSubmitRating}
          disabled={isSubmitting}
          className="mt-4 w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
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
        </button>
      )}
    </div>
  );
};

export default InternCard;
