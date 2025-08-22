import React, { useState, useEffect } from "react";

const Countdown = ({ lastFeedbackDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, min: 0, sec: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // следующее оценивание через 7 дней после последнего
      const next = new Date(lastFeedbackDate);
      next.setDate(next.getDate() + 7);

      const diff = next - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, min: 0, sec: 0 });
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        min: Math.floor((diff / (1000 * 60)) % 60),
        sec: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastFeedbackDate]);

  return (
    <div className="grid grid-flow-col gap-5 text-center auto-cols-max">
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">
          <span style={{ "--value": timeLeft.days }} />
        </span>
        days
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">
          <span style={{ "--value": timeLeft.hours }} />
        </span>
        hours
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">
          <span style={{ "--value": timeLeft.min }} />
        </span>
        min
      </div>
      <div className="flex flex-col">
        <span className="countdown font-mono text-5xl">
          <span style={{ "--value": timeLeft.sec }} />
        </span>
        sec
      </div>
    </div>
  );
};

export default Countdown;
