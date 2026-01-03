import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Settings, Timer } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const PRESET_TIMES = [
  { label: "15min", value: 15 * 60 },
  { label: "25min", value: 25 * 60 },
  { label: "45min", value: 45 * 60 },
  { label: "60min", value: 60 * 60 },
];

export function PomodoroWidget() {
  const { profile, updatePomodoroDuration } = useProfile();
  const defaultDuration = profile?.pomodoro_duration || 25 * 60;
  
  const [duration, setDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (profile?.pomodoro_duration && !isRunning) {
      setDuration(profile.pomodoro_duration);
      setTimeLeft(profile.pomodoro_duration);
    }
  }, [profile?.pomodoro_duration]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration);
  };

  const selectDuration = (seconds: number) => {
    setDuration(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
    setShowSettings(false);
    updatePomodoroDuration.mutate(seconds);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className="widget-card h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-light text-muted-foreground">Foco</h3>
        </div>
        <motion.button
          onClick={() => setShowSettings(!showSettings)}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-card/50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          className="flex gap-2 mb-4 flex-wrap"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          {PRESET_TIMES.map((preset) => (
            <motion.button
              key={preset.label}
              onClick={() => selectDuration(preset.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-light transition-all ${
                duration === preset.value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card/50 text-muted-foreground hover:bg-muted'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {preset.label}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Timer Display */}
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 mb-4">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="45"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="56"
              cy="56"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-regular">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={resetTimer}
            className="w-10 h-10 rounded-full bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={toggleTimer}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isRunning 
                ? 'bg-orange-500/20 text-orange-400' 
                : 'bg-primary text-primary-foreground'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRunning ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </motion.button>
          <div className="w-10 h-10" /> {/* Spacer for symmetry */}
        </div>
      </div>
    </motion.div>
  );
}
