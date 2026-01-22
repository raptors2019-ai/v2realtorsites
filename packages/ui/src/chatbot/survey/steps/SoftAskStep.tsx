"use client";

import { useState } from "react";

interface SoftAskStepProps {
  onSubmit: (contact: { fullName: string; phone: string; email?: string }) => void;
  onSkip: () => void;
}

export function SoftAskStep({ onSubmit, onSkip }: SoftAskStepProps) {
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
      {/* Header with save icon */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a962]/20 to-[#c9a962]/10 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#c9a962]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-stone-800">Save Your Results?</p>
          <p className="text-xs text-stone-500 mt-0.5">Get these results sent to you and unlock personalized recommendations.</p>
        </div>
      </div>

      {/* Compact form fields */}
      <div className="space-y-2.5">
        <div>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors({ ...errors, fullName: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] bg-white placeholder:text-stone-400 ${
              errors.fullName ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="Your name"
          />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] bg-white placeholder:text-stone-400 ${
              errors.phone ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="Phone number"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] bg-white placeholder:text-stone-400 ${
              errors.email ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="Email (optional)"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            canSubmit
              ? "bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-white shadow-md hover:shadow-lg hover:scale-[1.01]"
              : "bg-stone-100 text-stone-400 cursor-not-allowed"
          }`}
        >
          Save & Continue
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2.5 text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-all duration-200"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
