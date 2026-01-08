"use client";

import { useState } from "react";

interface ContactInfoStepProps {
  onSubmit: (contact: { fullName: string; phone: string; email?: string }) => void;
  surveyType?: "dream-home" | "general-contact";
}

export function ContactInfoStep({ onSubmit, surveyType }: ContactInfoStepProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; email?: string }>({});

  const validateEmail = (email: string) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => phone.replace(/\D/g, '').length === 10 || phone.replace(/\D/g, '').length === 11;

  const handleSubmit = () => {
    const newErrors: { fullName?: string; phone?: string; email?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Please enter your full name";
    }
    if (!phone || !validatePhone(phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (email && !validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({ fullName, phone, email: email || undefined });
  };

  const headerText = surveyType === 'general-contact' ? 'Get in Touch' : 'Get in Touch';
  const subText = surveyType === 'general-contact'
    ? 'One of our expert agents will contact you ASAP to assist with your real estate needs.'
    : 'One of our expert agents will contact you ASAP to help you find the perfect property.';

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">{headerText}</p>
        <p className="text-xs text-stone-500">{subText}</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (errors.fullName) setErrors({ ...errors, fullName: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] bg-white ${
              errors.fullName ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="John Smith"
          />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Cell Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors({ ...errors, phone: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] bg-white ${
              errors.phone ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="(416) 555-0123"
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          <p className="text-xs text-stone-400 mt-1">
            Our agents respond fastest by phone
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Email Address <span className="text-stone-400">(recommended)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-[#c9a962] bg-white ${
              errors.email ? 'border-red-500' : 'border-stone-200'
            }`}
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!fullName || !phone}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
          fullName && phone
            ? "bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
            : "bg-stone-100 text-stone-400 cursor-not-allowed"
        }`}
      >
        Have an Agent Contact Me ASAP
      </button>

      <p className="text-xs text-stone-400 text-center">
        We respect your privacy. Your information will only be used by our agents to contact you.
      </p>
    </div>
  );
}
