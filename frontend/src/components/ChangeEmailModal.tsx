"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Mail, CheckCircle2, ArrowRight } from "lucide-react";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSuccess: (newEmail: string) => void;
}

export function ChangeEmailModal({ isOpen, onClose, currentEmail, onSuccess }: ChangeEmailModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setOtp(["", "", "", "", "", ""]);
        setNewEmail("");
        setIsLoading(false);
      }, 300);
    } else {
      // Auto-focus OTP when opened
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      setStep(2);
    }, 1000);
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === currentEmail) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Email updated successfully!");
      onSuccess(newEmail);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-mine-950/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white dark:bg-mine-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-mine-800 animate-in zoom-in-95 duration-300">
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
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-2">Verify it's you</h2>
              <p className="text-sm text-neutral-500 dark:text-mine-400 mb-8">
                To protect your account, please enter the 6-digit OTP sent to your registered phone number.
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
                    <>Verify Code <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-2">Change Email</h2>
              <p className="text-sm text-neutral-500 dark:text-mine-400 mb-8">
                Enter your new email address below.
              </p>

              <form onSubmit={handleSaveEmail} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-mine-950 dark:text-white">New Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-neutral-400 dark:text-mine-500" />
                    </div>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-mine-800 bg-neutral-50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 transition-all"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading || !newEmail || newEmail === currentEmail}
                  className="w-full bg-mine-950 hover:bg-mine-900 dark:bg-mine-100 dark:hover:bg-white text-white dark:text-mine-950 font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 dark:border-mine-950/30 border-t-white dark:border-t-mine-950 rounded-full animate-spin"></div>
                  ) : (
                    <>Save Email</>
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
