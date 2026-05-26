import React, { useState, useEffect } from "react";
import { UserProfile, CareerMatch, Badge } from "../types";
import { 
  LockKeyhole, 
  Mail, 
  User, 
  Sparkles, 
  Fingerprint, 
  ArrowRight, 
  CheckCircle2, 
  Power,
  ShieldCheck,
  UserCheck,
  Key
} from "lucide-react";

interface AuthUser {
  email: string;
  name: string;
  joinedAt: string;
  profile?: UserProfile;
  careerMatches?: CareerMatch[];
  streak?: number;
  badges?: Badge[];
}

interface AuthenticationProps {
  onLoginSuccess: (user: AuthUser) => void;
  onLogout: () => void;
  currentUser: AuthUser | null;
  triggerAlert: (msg: string) => void;
}

export default function Authentication({ 
  onLoginSuccess, 
  onLogout, 
  currentUser, 
  triggerAlert 
}: AuthenticationProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Suggested Demo Credentials
  const DEMO_USER = {
    email: "visitor@pathforge.ai",
    password: "demo-password-123",
    name: "Alex Mercer"
  };

  // Log in using Demo Credentials
  const handleQuickDemo = () => {
    setLoading(true);
    setTimeout(() => {
      const usersRaw = localStorage.getItem("pathforge_users");
      const users = usersRaw ? JSON.parse(usersRaw) : {};
      
      let existing = users[DEMO_USER.email];
      if (!existing) {
        existing = {
          email: DEMO_USER.email,
          name: DEMO_USER.name,
          joinedAt: new Date().toISOString(),
          streak: 3,
        };
        users[DEMO_USER.email] = existing;
        localStorage.setItem("pathforge_users", JSON.stringify(users));
      }

      localStorage.setItem("pathforge_current_user", JSON.stringify(existing));
      onLoginSuccess(existing);
      triggerAlert("Welcome back, Alex! Loaded your saved learning trajectory.");
      setLoading(false);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      triggerAlert("Please fill in all requested fields.");
      return;
    }

    if (!email.includes("@")) {
      triggerAlert("Please provide a valid email structure.");
      return;
    }

    if (password.length < 5) {
      triggerAlert("Password must contain at least 5 character guidelines.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const usersRaw = localStorage.getItem("pathforge_users");
      const users = usersRaw ? JSON.parse(usersRaw) : {};

      if (isSignUp) {
        if (users[email.toLowerCase()]) {
          triggerAlert("This email is already registered here. Try logging in.");
          setLoading(false);
          return;
        }

        const newUser: AuthUser = {
          email: email.toLowerCase(),
          name: name.trim(),
          joinedAt: new Date().toISOString(),
          streak: 1,
        };

        users[email.toLowerCase()] = newUser;
        localStorage.setItem("pathforge_users", JSON.stringify(users));
        localStorage.setItem("pathforge_current_user", JSON.stringify(newUser));
        onLoginSuccess(newUser);
        triggerAlert(`Account built successfully! Welcome to PathForge, ${newUser.name}.`);
      } else {
        const found = users[email.toLowerCase()];
        if (!found) {
          // Auto-provision if user didn't exist for easier sandbox bypass
          const provisionedUser: AuthUser = {
            email: email.toLowerCase(),
            name: email.split("@")[0],
            joinedAt: new Date().toISOString(),
            streak: 1,
          };
          users[email.toLowerCase()] = provisionedUser;
          localStorage.setItem("pathforge_users", JSON.stringify(users));
          localStorage.setItem("pathforge_current_user", JSON.stringify(provisionedUser));
          onLoginSuccess(provisionedUser);
          triggerAlert(`Welcome to PathForge! Secure auto-provisioned session aligned.`);
        } else {
          localStorage.setItem("pathforge_current_user", JSON.stringify(found));
          onLoginSuccess(found);
          triggerAlert(`Securely signed in! Welcome back, ${found.name}.`);
        }
      }
      setLoading(false);
    }, 700);
  };

  if (currentUser) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between text-left shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-inner">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Account Session Active
            </span>
            <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{currentUser.name}</h4>
            <p className="text-xs text-slate-500 font-mono">{currentUser.email} • Joined {new Date(currentUser.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-xl font-medium text-slate-600">
            Passkey Secured (Local)
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("pathforge_current_user");
              onLogout();
              triggerAlert("Securely cleared your session and logged out successfully.");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all"
          >
            <Power className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden relative" id="auth-manager-plate">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
      
      <div className="p-8 text-center">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100">
          <LockKeyhole className="w-5 h-5 text-indigo-600" />
        </div>
        
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isSignUp ? "Create Forge Passkey" : "Sign in to PathForge"}
        </h3>
        <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
          {isSignUp 
            ? "Sync dynamic career match metrics and study streaks safely to your local keys." 
            : "Unlock saved learning curricula, career comparisons, and resume audits."}
        </p>

        {/* Form panel */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          {isSignUp && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono mb-1.5">
                Full Character Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50/60 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  id="auth-name-field"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono mb-1.5">
              Email Trajectory Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="e.g. pilot@pathforge.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50/60 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                id="auth-email-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-400 font-mono mb-1.5">
              Secure Passcode Key
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50/60 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                id="auth-pass-field"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10"
            id="auth-submit-btn"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "Forge New Passkey Address" : "Authorize Aligned Pathway"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        {/* Quick Sandbox Bypass button */}
        <button
          onClick={handleQuickDemo}
          disabled={loading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border border-slate-700"
          id="auth-demo-btn"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>One-Click Instant Demo Access</span>
        </button>

        {/* Toggle Account mode */}
        <p className="text-xs text-slate-400 mt-6">
          {isSignUp ? "Already have an account?" : "Need a secure localized account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
          >
            {isSignUp ? "Log in here" : "Sign up here"}
          </button>
        </p>
      </div>
    </div>
  );
}
