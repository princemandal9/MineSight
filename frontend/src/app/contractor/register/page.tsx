"use client";

import React, { useState, useRef } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Building, Mail, Phone, Lock, CheckCircle2, Bomb, Truck, Pickaxe, Camera, Upload } from "lucide-react";
import { VerifyPhoneModal } from "@/components/VerifyPhoneModal";

export default function ContractorRegistrationPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    taskProfile: "blasting",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setProfilePhoto(url);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!isPhoneVerified) {
      alert("Please verify your phone number before registering.");
      return;
    }

    setIsSubmitting(true);

    // Save task profile for login
    if (typeof window !== 'undefined') {
      localStorage.setItem('contractorTask', formData.taskProfile);
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-mine-950 p-4 transition-colors duration-300">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>
        <div className="bg-white dark:bg-mine-900 p-10 rounded-3xl shadow-xl border border-neutral-200 dark:border-mine-800 flex flex-col items-center justify-center max-w-md w-full animate-in fade-in zoom-in duration-500">
          <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
          <h2 className="text-3xl font-bold text-mine-950 dark:text-white mb-2">Success!</h2>
          <p className="text-neutral-500 dark:text-mine-300 text-center mb-6">
            Your contractor account has been registered successfully. Redirecting to login...
          </p>
          <div className="w-full bg-neutral-200 dark:bg-mine-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-mine-700 dark:bg-mine-300 h-full rounded-full animate-[progress_2s_ease-in-out]" style={{ width: '100%' }}></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-mine-950 p-4 sm:p-8 transition-colors duration-300 relative overflow-hidden">

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-mine-300/20 dark:bg-mine-700/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-amber-300/10 dark:bg-amber-700/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Theme Toggle */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-sm font-medium text-neutral-500 dark:text-mine-300 hover:text-mine-950 dark:hover:text-white mb-6 transition-colors">
          &larr; Back to Login
        </Link>

        {/* Main Card */}
        <div className="bg-white/80 dark:bg-mine-900/80 backdrop-blur-xl border border-white/20 dark:border-mine-700/30 p-8 sm:p-12 rounded-[2rem] shadow-2xl">

          <div className="flex flex-col items-center mb-8">
            <div className="bg-white p-3 rounded-full shadow-sm border border-mine-100 dark:border-mine-800 mb-6">
              <Image
                src="/logo.jpg"
                alt="MineSight Logo"
                width={56}
                height={56}
                className="rounded-full object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-mine-950 dark:text-white tracking-tight text-center mb-3">
              Contractor Registration
            </h1>
            <p className="text-neutral-500 dark:text-mine-300 text-center max-w-md">
              Join the MineSight platform to manage your tasks, machinery, and team efficiently.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center justify-center space-y-4 mb-2">
              <div className="relative w-24 h-24 rounded-full bg-neutral-100 dark:bg-mine-800 border-2 border-dashed border-neutral-300 dark:border-mine-700 flex items-center justify-center overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-neutral-400 dark:text-mine-500" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold px-3 py-2 bg-white dark:bg-mine-900 border border-neutral-200 dark:border-mine-800 rounded-lg shadow-sm hover:bg-neutral-50 dark:hover:bg-mine-800 transition-colors flex items-center gap-1 text-mine-950 dark:text-white"
                >
                  <Upload className="w-3 h-3" /> Upload File
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="text-xs font-semibold px-3 py-2 bg-white dark:bg-mine-900 border border-neutral-200 dark:border-mine-800 rounded-lg shadow-sm hover:bg-neutral-50 dark:hover:bg-mine-800 transition-colors flex items-center gap-1 text-mine-950 dark:text-white"
                >
                  <Camera className="w-3 h-3" /> Camera
                </button>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" />
              <input type="file" accept="image/*" capture="user" ref={cameraInputRef} onChange={handlePhotoChange} className="hidden" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-mine-950 dark:text-white">Company Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-neutral-400 dark:text-mine-400" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Mining Corp Inc."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-mine-800 bg-white/50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 focus:border-transparent transition-all placeholder:text-neutral-400 dark:placeholder:text-mine-500"
                    required
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-mine-950 dark:text-white">Contact Person</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-neutral-400 dark:text-mine-400" />
                  </div>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-mine-800 bg-white/50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 focus:border-transparent transition-all placeholder:text-neutral-400 dark:placeholder:text-mine-500"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-mine-950 dark:text-white">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-neutral-400 dark:text-mine-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-mine-800 bg-white/50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 focus:border-transparent transition-all placeholder:text-neutral-400 dark:placeholder:text-mine-500"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-mine-950 dark:text-white">Phone Number</label>
                  {isPhoneVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-neutral-400 dark:text-mine-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      handleChange(e);
                      setIsPhoneVerified(false);
                    }}
                    placeholder="+91 1234567890"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-mine-800 bg-white/50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 focus:border-transparent transition-all placeholder:text-neutral-400 dark:placeholder:text-mine-500"
                    required
                  />
                </div>
                {!isPhoneVerified && formData.phone.replace(/\D/g, "").length >= 10 && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.phone) {
                          alert("Please enter a phone number first.");
                          return;
                        }
                        setIsVerifyModalOpen(true);
                      }}
                      className="px-4 py-1.5 bg-mine-950 dark:bg-white text-white dark:text-mine-950 text-xs font-bold rounded-lg hover:bg-mine-800 dark:hover:bg-mine-100 transition-colors shadow-sm"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>

              {/* Task Profile Selection */}
              <div className="md:col-span-2 space-y-3 pt-2 pb-4">
                <label className="text-sm font-semibold text-mine-950 dark:text-white">Task Profile</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "blasting", label: "Blasting", icon: Bomb },
                    { id: "transport", label: "Transportation", icon: Truck },
                    { id: "excavation", label: "Excavation / OB", icon: Pickaxe }
                  ].map((task) => (
                    <label
                      key={task.id}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.taskProfile === task.id
                          ? "border-mine-600 bg-mine-50 dark:bg-mine-900/50 dark:border-mine-400"
                          : "border-neutral-200 dark:border-mine-800 bg-white/50 dark:bg-mine-950/50 hover:border-mine-300 dark:hover:border-mine-700"
                        }`}
                    >
                      <input
                        type="radio"
                        name="taskProfile"
                        value={task.id}
                        checked={formData.taskProfile === task.id}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <task.icon className={`w-8 h-8 mb-2 ${formData.taskProfile === task.id ? "text-mine-600 dark:text-mine-400" : "text-neutral-400 dark:text-mine-500"}`} />
                      <span className={`text-sm font-semibold text-center ${formData.taskProfile === task.id ? "text-mine-950 dark:text-white" : "text-neutral-500 dark:text-mine-400"}`}>
                        {task.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-mine-950 dark:text-white">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400 dark:text-mine-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-neutral-200 dark:border-mine-800 bg-white/50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 focus:border-transparent transition-all placeholder:text-neutral-400 dark:placeholder:text-mine-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-mine-400 hover:text-mine-700 dark:hover:text-mine-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-mine-950 dark:text-white">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-neutral-400 dark:text-mine-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-neutral-200 dark:border-mine-800 bg-white/50 dark:bg-mine-950/50 text-mine-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-mine-400 focus:border-transparent transition-all placeholder:text-neutral-400 dark:placeholder:text-mine-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-mine-400 hover:text-mine-700 dark:hover:text-mine-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start mt-6">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 rounded border-neutral-300 text-mine-600 focus:ring-mine-500 dark:border-mine-700 dark:bg-mine-900 dark:ring-offset-mine-950 cursor-pointer"
                  required
                />
              </div>
              <label htmlFor="terms" className="ml-2 text-sm text-neutral-500 dark:text-mine-300 cursor-pointer">
                I agree to the <Link href="#" className="font-semibold text-mine-700 dark:text-mine-100 hover:underline">Terms of Service</Link> and <Link href="#" className="font-semibold text-mine-700 dark:text-mine-100 hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-8 bg-mine-950 hover:bg-mine-900 dark:bg-mine-100 dark:hover:bg-white text-white dark:text-mine-950 font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white/30 dark:border-mine-950/30 border-t-white dark:border-t-mine-950 rounded-full animate-spin"></div>
              ) : (
                <>
                  Register Account
                  <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-neutral-500 dark:text-mine-400">
              Already have an account?{" "}
              <Link href="/" className="font-bold text-mine-700 dark:text-mine-100 hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <VerifyPhoneModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        phoneNumber={formData.phone}
        onSuccess={() => setIsPhoneVerified(true)}
      />
    </main>
  );
}
