"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, CheckCircle2, ArrowRight } from "lucide-react";

interface VerifyPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onSuccess: () => void;
}

export function VerifyPhoneModal({ isOpen, onClose, phoneNumber, onSuccess }: VerifyPhoneModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setOtp(["", "", "", "", "", ""]);
        setIsLoading(false);
      }, 300);
    } else {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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
      onSuccess();
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
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="w-12 h-12 bg-mine-100 dark:bg-mine-800 rounded-full flex items-center justify-center text-mine-700 dark:text-mine-300 mb-6">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-mine-950 dark:text-white mb-2">Verify Phone</h2>
            <p className="text-sm text-neutral-500 dark:text-mine-400 mb-8">
              Enter the 6-digit code sent to <span className="font-semibold text-mine-700 dark:text-mine-200">{phoneNumber || "your number"}</span>
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
        </div>
      </div>
    </div>
  );
}
