import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  initialMinutes: number;
  onTimeUp?: () => void;
  className?: string;
}

export function Timer({ initialMinutes, onTimeUp, className = "" }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60); // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const totalSeconds = initialMinutes * 60;
    const percentageLeft = (timeLeft / totalSeconds) * 100;
    
    if (percentageLeft <= 10) return "text-red-600";
    if (percentageLeft <= 25) return "text-orange-600";
    return "text-textPrimary";
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`} data-testid="timer">
      <Clock className={`h-5 w-5 ${getTimerColor()}`} />
      <div className={`font-mono text-lg font-semibold ${getTimerColor()}`} data-testid="timer-display">
        {formatTime(timeLeft)}
      </div>
      <span className="text-sm text-textSecondary">remaining</span>
    </div>
  );
}
