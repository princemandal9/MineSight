"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Check, Bomb, Truck, Pickaxe, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * LoginPage component - Main authentication page for MineSight portal.
 * Supports both contractor and supervisor login flows with task selection for contractors.
 *
 * @returns React component rendering the login interface with role toggle and task selection
 */
export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginRole, setLoginRole] = useState<'contractor' | 'supervisor'>('contractor');
  
  // Dummy credentials state
  const [email, setEmail] = useState("contractor@abc.com");
  const [password, setPassword] = useState("password123");

  // Step state: 'login' -> 'select-task'
  const [step, setStep] = useState<'login' | 'select-task'>('login');

  const taskOptions = [
    { id: "blasting", label: "Blasting", icon: Bomb },
    { id: "transport", label: "Transportation", icon: Truck },
    { id: "excavation", label: "Excavation / OB", icon: Pickaxe },
  ];

  /**
   * Handles form submission for login authentication.
   * For contractors, advances to task selection; supervisors see an alert placeholder.
   *
   * @param e - Form submission event
   */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginRole === 'contractor') {
      // Move to task selection step for contractor
      setStep('select-task');
    } else {
      // Supervisor login flow (placeholder)
      alert("Supervisor login not implemented in this demo.");
    }
  };

  /**
   * Handles task selection after successful contractor login.
   * Navigates to contractor page with selected task as query parameter.
   *
   * @param taskId - The ID of the selected task (blasting, transport, excavation)
   */
  const handleTaskSelect = (taskId: string) => {
    // Navigate to contractor page with the selected task
    router.push(`/contractor?task=${taskId}`);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row">

        {/* Left Form Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-28 py-12 relative z-10">

          <div className="max-w-md w-full mx-auto">
            {/* Logo */}
            <div className="mb-10">
              <Image 
                src="/logo.jpg" 
                alt="MineSight Logo" 
                width={64} 
                height={64} 
                className="rounded-full shadow-sm border border-mine-300/30 object-contain bg-white"
                priority
              />
            </div>

            {step === 'login' ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-black text-mine-950 tracking-tight">
                    {loginRole === 'contractor' ? 'Contractor Portal' : 'Supervisor Portal'}
                  </h1>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold transition-colors ${loginRole === 'contractor' ? 'text-mine-950' : 'text-neutral-400'}`}>
                      Contractor
                    </span>
                    <div className="checkbox-wrapper-41">
                      <input
                        type="checkbox"
                        checked={loginRole === 'supervisor'}
                        onChange={(e) => setLoginRole(e.target.checked ? 'supervisor' : 'contractor')}
                      />
                    </div>
                    <span className={`text-sm font-bold transition-colors ${loginRole === 'supervisor' ? 'text-mine-950' : 'text-neutral-400'}`}>
                      Supervisor
                    </span>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 mb-10">
                  {loginRole === 'contractor' ? (
                    <>Contractor registration is not yet available.</>
                  ) : (
                    <>Supervisors must be registered by an administrator.</>
                  )}
                </p>

                <form className="space-y-5" onSubmit={handleLogin}>

                  {/* Email Input */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-mine-950 hidden">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-mine-950 focus:outline-none focus:ring-2 focus:ring-mine-300 focus:border-transparent transition-all placeholder:text-neutral-400"
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1 relative">
                    <label className="text-sm font-medium text-mine-950 hidden">Password</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white text-mine-950 focus:outline-none focus:ring-2 focus:ring-mine-300 focus:border-transparent transition-all placeholder:text-neutral-400 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-mine-700 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Options Row */}
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${rememberMe ? 'bg-mine-700 border-mine-700' : 'bg-white border-neutral-300 group-hover:border-mine-300'}`}>
                        <Check size={14} className={`text-white transition-opacity ${rememberMe ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                      />
                      <span className="text-sm text-neutral-600 font-medium select-none">Remember me</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button type="submit" className="animated-button">
                      Log in
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="mt-8 flex items-center justify-center gap-4">
                  <div className="h-px bg-neutral-200 flex-1"></div>
                  <span className="text-xs font-bold text-neutral-400 tracking-wider">OR</span>
                  <div className="h-px bg-neutral-200 flex-1"></div>
                </div>

                {/* SSO Button */}
                <div className="mt-8 text-center">
                  <button className="text-sm font-semibold text-mine-700 hover:text-mine-800 transition-colors">
                    Log in with SSO
                  </button>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <button 
                  onClick={() => setStep('login')}
                  className="text-sm font-bold text-mine-700 mb-6 hover:underline flex items-center gap-1"
                >
                  &larr; Back to Login
                </button>
                <h1 className="text-3xl font-black text-mine-950 tracking-tight mb-2">
                  Select Task Profile
                </h1>
                <p className="text-sm text-neutral-500 mb-8">
                  Welcome back! Please select the specific task profile you want to access for this session.
                </p>

                <div className="space-y-3">
                  {taskOptions.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleTaskSelect(task.id)}
                      className="w-full bg-white border-2 border-mine-300/30 hover:border-mine-700 hover:bg-mine-50 text-mine-900 rounded-xl p-4 flex items-center justify-between transition-all group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-mine-100 flex items-center justify-center text-mine-700 group-hover:scale-110 transition-transform">
                          <task.icon size={20} />
                        </div>
                        <span className="font-semibold text-base">{task.label}</span>
                      </div>
                      <ChevronRight className="text-mine-300 group-hover:text-mine-700 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Visual Section */}
        <div className="hidden lg:block lg:w-1/2 bg-mine-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-mine-900 via-mine-900/90 to-mine-800/80 z-10"></div>
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 C 40 100 100 60 100 0 L 0 0 Z' fill='%23163B32'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
            backgroundPosition: 'center center'
          }}></div>
          <div className="absolute top-1/4 -left-24 w-96 h-96 bg-mine-300/10 rounded-full blur-3xl z-10"></div>
          <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-mine-700/20 rounded-full blur-3xl z-10"></div>
        </div>

      </div>

      {/* Footer Banner */}
      <footer className="w-full bg-mine-950 py-4 px-6 sm:px-12 flex items-center justify-between shrink-0 border-t border-mine-800 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-mine-700 text-white flex items-center justify-center font-bold text-xs">
            M
          </div>
          <span className="text-white font-bold text-sm tracking-wide">MineSight</span>
        </div>
        <div className="text-xs text-mine-300 font-medium">
          curated by <span className="text-white font-bold uppercase tracking-widest ml-1">Mobbin</span>
        </div>
      </footer>
    </main>
  );
}
