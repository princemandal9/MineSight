"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Phone, Lock, EyeOff, Eye, CheckCircle2, ArrowRight } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setPhone("");
        setOtp(["", "", "", "", "", ""]);
        setNewPassword("");
        setConfirmPassword("");
        setIsLoading(false);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      // Focus first OTP input after transition
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1); // only 1 char
    if (!/^\d*$/.test(value)) return; // only numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== "" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(digit => digit === "")) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Password successfully reset!");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-mine-950/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-mine-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-mine-950 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-mine-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-10">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="w-12 h-12 bg-mine-100 dark:bg-mine-800 rounded-full flex items-center justify-center text-mine-700 dark:text-mine-300 mb-6">
                <Phone className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-2">Forgot Password?</h2>
              <p className="text-sm text-neutral-500 dark:text-mine-400 mb-8">
                Enter your registered phone number to receive a secure One-Time Password (OTP) for verification.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-mine-950 dark:text-white">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-neutral-500 dark:text-mine-400 text-sm font-medium">+1</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-mine-800 bg-neutral-50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 transition-all"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !phone}
                  className="w-full bg-mine-950 hover:bg-mine-900 dark:bg-mine-100 dark:hover:bg-white text-white dark:text-mine-950 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 dark:border-mine-950/30 border-t-white dark:border-t-mine-950 rounded-full animate-spin"></div>
                  ) : (
                    <>Send OTP <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="w-12 h-12 bg-mine-100 dark:bg-mine-800 rounded-full flex items-center justify-center text-mine-700 dark:text-mine-300 mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-2">Verify Phone</h2>
              <p className="text-sm text-neutral-500 dark:text-mine-400 mb-8">
                Enter the 6-digit code sent to <span className="font-semibold text-mine-700 dark:text-mine-200">+1 {phone}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-neutral-200 dark:border-mine-800 bg-neutral-50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 focus:border-mine-400 transition-all shadow-sm"
                      required
                    />
                  ))}
                </div>
                
                <div className="text-center">
                  <button type="button" className="text-sm font-semibold text-mine-600 dark:text-mine-300 hover:underline">
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.some(d => d === "")}
                  className="w-full bg-mine-950 hover:bg-mine-900 dark:bg-mine-100 dark:hover:bg-white text-white dark:text-mine-950 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 dark:border-mine-950/30 border-t-white dark:border-t-mine-950 rounded-full animate-spin"></div>
                  ) : (
                    <>Verify Code <CheckCircle2 className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-2">Create New Password</h2>
              <p className="text-sm text-neutral-500 dark:text-mine-400 mb-8">
                Your phone was verified! Please enter your new password below.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-mine-950 dark:text-white">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-neutral-400 dark:text-mine-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-neutral-200 dark:border-mine-800 bg-neutral-50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-mine-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-mine-950 dark:text-white">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 text-neutral-400 dark:text-mine-500" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-neutral-200 dark:border-mine-800 bg-neutral-50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-mine-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full bg-mine-950 hover:bg-mine-900 dark:bg-mine-100 dark:hover:bg-white text-white dark:text-mine-950 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 dark:border-mine-950/30 border-t-white dark:border-t-mine-950 rounded-full animate-spin"></div>
                  ) : (
                    <>Reset Password</>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
