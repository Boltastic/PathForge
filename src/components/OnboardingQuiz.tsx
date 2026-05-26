import React, { useState } from "react";
import { motion } from "motion/react";
import { UserProfile } from "../types";
import { Sparkles, BrainCircuit, Wallet, Compass, Smile, Eye } from "lucide-react";

interface QuizProps {
  onComplete: (profile: UserProfile) => void;
  initialProfile: UserProfile;
}

export default function OnboardingQuiz({ onComplete, initialProfile }: QuizProps) {
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState(initialProfile.interests);
  const [skills, setSkills] = useState(initialProfile.skills);
  const [hobbies, setHobbies] = useState(initialProfile.hobbies);
  const [education, setEducation] = useState(initialProfile.education || "Bachelor's Degree");
  const [salaryGoal, setSalaryGoal] = useState(initialProfile.salaryGoal || "100,000");
  const [country, setCountry] = useState(initialProfile.country || "United States");
  const [workStyle, setWorkStyle] = useState(initialProfile.workStyle || "Remote Preferred");
  const [lifestyle, setLifestyle] = useState(initialProfile.lifestyle);
  const [realisticMode, setRealisticMode] = useState(initialProfile.realisticMode);

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({
        interests,
        skills,
        hobbies,
        education,
        salaryGoal,
        country,
        workStyle,
        lifestyle,
        onboarded: true,
        realisticMode,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white/70 backdrop-blur-md rounded-2xl border border-gray-100 p-8 shadow-xl relative overflow-hidden" id="onboarding-quiz-container">
      {/* Absolute top glow indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500" />

      {/* Progress header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase font-medium tracking-wider">
            Step {step} of {totalSteps}
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-1 font-sans tracking-tight">
            Forging Your Path
          </h2>
        </div>
        <div className="text-right text-xs text-gray-500 font-mono">
          {Math.round((step / totalSteps) * 100)}% Complete
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-400 to-indigo-600"
          initial={{ width: "20%" }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="min-h-[260px]">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">What excites and drives you?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Tell us about your core interests and primary skills. What are you naturally drawn to, and what do you do well?
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2 font-mono">
                  Interests & Domains
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., Artificial intelligence, creative writing, hiking, biology"
                  className="w-full text-sm px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  id="interests-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2 font-mono">
                  Core Skills (or things you want to apply)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., Coding basics, sketch design, public speaking, organization"
                  className="w-full text-sm px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  id="skills-input"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-800 text-lg font-sans">Hobbies & Play</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Your career should match who you are outside of work. What are your favourite hobbies? How do you recharge?
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2 font-mono">
                  Hobbies & Free Time
                </label>
                <textarea
                  value={hobbies}
                  onChange={(e) => setHobbies(e.target.value)}
                  placeholder="e.g., Video gaming, reading sci-fi, video editing, landscape photography"
                  rows={4}
                  className="w-full text-sm px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                  id="hobbies-textarea"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-800 text-lg font-sans">Goals & Location</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5 font-mono">
                  Education Level
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full text-sm px-3.5 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  id="education-select"
                >
                  <option value="Self-Taught / Schooling">Self-Taught / Schooling</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's / PhD">Master's / PhD</option>
                  <option value="Bootcamp Graduate">Bootcamp Graduate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5 font-mono">
                  Ideal Annual Salary (USD)
                </label>
                <select
                  value={salaryGoal}
                  onChange={(e) => setSalaryGoal(e.target.value)}
                  className="w-full text-sm px-3.5 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  id="salary-select"
                >
                  <option value="50000">$50,000+</option>
                  <option value="80000">$80,000+</option>
                  <option value="120000">$120,000+</option>
                  <option value="180000">$180,000+</option>
                  <option value="250000">$250,000+</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-1.5 font-mono">
                  Country / Region
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., United States, India, Germany, Global"
                  className="w-full text-sm px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  id="country-input"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <Smile className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-800 text-lg font-sans">Dream Lifestyle & Style</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Describe your ideal working layout. Do you value pure flexibility, a high paced office, collaborative teams, or deep isolation?
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2 font-mono">
                  Preferred Work Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Remote Preferred", "Hybrid Layout", "On-site Dynamic"].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setWorkStyle(style)}
                      className={`text-xs p-3 rounded-xl border font-medium transition-all ${
                        workStyle === style
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2 font-mono">
                  Dream Lifestyle Goals
                </label>
                <input
                  type="text"
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                  placeholder="e.g., Digital nomad traveling, rigid routine, flexible parent, quiet cabin"
                  className="w-full text-sm px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  id="lifestyle-input"
                />
              </div>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-4 animate-pulse">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 text-xl font-sans mb-2">Configure Realistic Mode</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                PathForge features a **Realistic Toggle**. When active, the AI mentor and analyst will be brutal about local job markets, wages, oversaturation, and actual learning grinds. Highlighting real risks instead of optimism.
              </p>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between pointer duration-150 select-none">
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">Trigger Realistic Mode</p>
                  <p className="text-xs text-gray-400">Brutal feedback on saturation, salaries, competition</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRealisticMode(!realisticMode)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    realisticMode ? "bg-rose-500" : "bg-gray-300"
                  }`}
                  id="toggle-realistic-quiz"
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                      realisticMode ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            step === 1
              ? "text-gray-300 pointer-events-none"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
          id="quiz-back-btn"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all"
          id="quiz-next-btn"
        >
          {step === totalSteps ? "Generate My Paths" : "Continue"}
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
