import React, { useState } from "react";
import { motion } from "motion/react";
import { Badge, LearnTask } from "../types";
import { Flame, Star, Trophy, CheckCircle, Calendar, Sparkles, BookOpen, Clock, Target } from "lucide-react";

interface DashboardProps {
  streak: number;
  onIncrementStreak: () => void;
  badges: Badge[];
  userCareer: string;
}

export default function DailyDashboard({
  streak,
  onIncrementStreak,
  badges,
  userCareer,
}: DashboardProps) {
  const [tasks, setTasks] = useState<LearnTask[]>([
    { id: "task-1", title: "Read 1 key article or documentation regarding " + userCareer, phaseId: "1", completed: false },
    { id: "task-2", title: "Add 1 conceptual element to your personal project", phaseId: "1", completed: false },
    { id: "task-3", title: "Audit an AI automation stability score or demand index", phaseId: "2", completed: false },
    { id: "task-4", title: "Ask path mentor a question about industry certifications", phaseId: "2", completed: false },
  ]);

  const [reminderActive, setReminderActive] = useState(true);
  const [dailyGoal, setDailyGoal] = useState("Complete Python fundamentals & setup index");

  const completedCount = tasks.filter((t) => t.completed).count || tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          return { ...t, completed: !t.completed };
        }
        return t;
      })
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="daily-dashboard-section">
      {/* 1. Streak Tracker & Daily Motivation */}
      <div className="lg:col-span-2 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Active Streak Engine
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-2 font-sans tracking-tight">
                Daily Learning Progress
              </h2>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onIncrementStreak}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-rose-500/15 transition-all"
              id="streak-button"
            >
              <Flame className="w-4 h-4 text-white animate-bounce" />
              Claim Practice Streak ({streak} Days)
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-orange-50/40 border border-orange-100/50 p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Practice Streak</p>
                <p className="text-[#111] font-mono font-bold text-lg">{streak} Days</p>
              </div>
            </div>

            <div className="bg-emerald-50/40 border border-emerald-100/50 p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Daily Completed</p>
                <p className="text-[#111] font-mono font-bold text-lg">{completedCount} / {tasks.length}</p>
              </div>
            </div>

            <div className="bg-indigo-50/40 border border-indigo-100/50 p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium font-mono">Current Focus</p>
                <p className="text-[#111] font-semibold text-[#111] text-xs truncate max-w-[130px]" title={userCareer}>
                  {userCareer || "Designing Route"}
                </p>
              </div>
            </div>
          </div>

          {/* Core Daily Goals list */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-500" />
              Interactive Daily Study List
            </h3>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    task.completed
                      ? "bg-emerald-50/30 border-emerald-100 text-gray-400"
                      : "bg-white border-gray-100 text-gray-700 hover:border-gray-200"
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all ${
                    task.completed
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "border-gray-300 bg-white"
                  }`}>
                    {task.completed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-xs ${task.completed ? "line-through" : ""}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Motivation Reminders Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-50 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-500" />
            <span>Reminders motivate your learning momentum.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Daily Study Reminders:</span>
            <button
              onClick={() => setReminderActive(!reminderActive)}
              className={`px-3 py-1.5 rounded-full font-semibold border transition-all ${
                reminderActive
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {reminderActive ? "Active Logged" : "Paused"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Achievements and Badges Panel */}
      <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 tracking-tight">Milestone Forge Badges</h3>
              <p className="text-xs text-gray-400">Locked with progression and AI interaction</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            Gamify your transformation. Career shifts require persistence. Get certificates, complete roadmaps, and challenge AI to unlock elite visual validation.
          </p>

          <div className="space-y-3">
            {badges.map((badge) => {
              const IconComponent = Trophy; // Default icon
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    badge.unlockedAt
                      ? "bg-gradient-to-r from-amber-50/40 to-yellow-50/10 border-amber-100/60"
                      : "bg-gray-50/50 border-gray-100 opacity-60 text-gray-400"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    badge.unlockedAt ? "bg-amber-100 text-amber-600" : "bg-gray-200 text-gray-400"
                  }`}>
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      {badge.title}
                      {badge.unlockedAt && (
                        <span className="text-[9px] bg-amber-500/10 text-amber-700 px-1.5 py-0.2 rounded font-normal font-mono animate-pulse">
                          Active
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate" title={badge.description}>
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 text-center">
          <div className="inline-flex items-center gap-1 bg-yellow-50 text-amber-800 text-[10px] uppercase tracking-wider font-mono px-3 py-1 rounded-full font-bold">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Unlocked {badges.filter((b) => b.unlockedAt).length} of {badges.length} Core badges
          </div>
        </div>
      </div>
    </div>
  );
}
