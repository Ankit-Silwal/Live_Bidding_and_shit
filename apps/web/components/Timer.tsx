"use client";

import { useEffect, useState } from "react";

export default function Timer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!endTime) return;

    const updateTimer = () => {
      const diff = new Date(endTime).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <div className="flex flex-col justify-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
        Time Remaining
      </p>
      <h2 className="text-3xl font-sans font-medium text-gray-900 tabular-nums">
        {timeLeft || "--:--:--"}
      </h2>
    </div>
  );
}