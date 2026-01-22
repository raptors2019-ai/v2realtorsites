"use client";

import { useState } from "react";

interface HardGateStepProps {
  onSubmit: (contact: { fullName: string; phone: string; email?: string }) => void;
}

export function HardGateStep({ onSubmit }: HardGateStepProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({});

  const validateEmail = (email: string) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => phone.replace(/\D/g, '').length === 10 || phone.replace(/\D/g, '').length === 11;

  const handleSubmit = () => {
    const newErrors: { fullName?: string; phone?: string; email?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your name";
    }
    if (!phone || !validatePhone(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (email && !validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({ fullName, phone, email: email || undefined });
  };

  const canSubmit = fullName.trim() && phone && validatePhone(phone);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header with lock icon */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] flex items-center justify-center shrink-0 shadow-md">
          <svg className="w-5 h-5 text-[#c9a962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800">Unlock All Tools</p>
          <p className="text-xs text-stone-500 mt-0.5">Enter your details to continue exploring property searches, calculators, and expert guidance.</p>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors({ ...errors, fullName: undefined });
            }}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962]/20 bg-white ${
              errors.fullName ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="John Smith"
          />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962]/20 bg-white ${
              errors.phone ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="(416) 555-0123"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Email <span className="text-stone-400">(optional)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] focus:ring-1 focus:ring-[#c9a962]/20 bg-white ${
              errors.email ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Submit button - full width, prominent */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          canSubmit
            ? "bg-gradient-to-r from-[#0a1628] to-[#1a2d4d] text-white shadow-lg hover:shadow-xl hover:scale-[1.01]"
            : "bg-stone-100 text-stone-400 cursor-not-allowed"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
        Unlock & Continue
      </button>

      <p className="text-xs text-stone-400 text-center">
        Your information is private and secure. We'll only use it to help you find your dream home.
      </p>
    </div>
  );
}
