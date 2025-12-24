"use client";

import { useState, useRef, useEffect } from "react";
import { useChatbotStore, Message } from "./chatbot-store";
import { trackChatbotInteraction, trackLeadFormSubmit } from "@repo/analytics";

// Property type for listings display
interface PropertyListing {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  address: string;
  image?: string;
}

// Survey state type
interface SurveyState {
  step: "idle" | "property-type" | "budget" | "bedrooms" | "timeline" | "location" | "show-listings" | "contact-info" | "complete";
  propertyType?: string;
  budget?: string;
  bedrooms?: string;
  timeline?: string;
  locations?: string[];
  matchingListings?: PropertyListing[];
  firstName?: string;
  email?: string;
  phone?: string;
}

// Format price with currency
function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4 animate-in fade-in duration-300">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] flex items-center justify-center shrink-0 shadow-md">
        <span className="text-sm">SC</span>
      </div>
      <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-[#c9a962] rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "0.8s" }} />
          <span className="w-2 h-2 bg-[#c9a962] rounded-full animate-bounce" style={{ animationDelay: "150ms", animationDuration: "0.8s" }} />
          <span className="w-2 h-2 bg-[#c9a962] rounded-full animate-bounce" style={{ animationDelay: "300ms", animationDuration: "0.8s" }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isLatest }: { message: Message; isLatest?: boolean }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""} ${isLatest ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""}`}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] flex items-center justify-center shrink-0 shadow-md">
          <span className="text-white text-xs font-semibold tracking-wide">SC</span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 ${
          isUser
            ? "bg-gradient-to-br from-[#0a1628] to-[#0f1d32] text-white rounded-2xl rounded-tr-none shadow-md"
            : "bg-white border border-stone-100 text-stone-700 rounded-2xl rounded-tl-none shadow-sm"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}

// Survey step components with luxury styling
function SurveyPropertyType({ onSelect }: { onSelect: (type: string) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const types = [
    { id: "detached", label: "Detached", icon: "🏠" },
    { id: "semi-detached", label: "Semi-Detached", icon: "🏘️" },
    { id: "townhouse", label: "Townhouse", icon: "🏡" },
    { id: "condo", label: "Condo", icon: "🏢" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Property Type</p>
        <p className="text-xs text-stone-500">What style of home are you envisioning?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {types.map((type, index) => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            onMouseEnter={() => setHoveredId(type.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group relative flex flex-col items-center gap-2 p-4 bg-white border border-stone-200 rounded-xl transition-all duration-300 hover:border-[#c9a962] hover:shadow-md animate-in fade-in duration-300"
            style={{ animationDelay: `${index * 75}ms` }}
          >
            <span className={`text-2xl transition-transform duration-300 ${hoveredId === type.id ? 'scale-110' : ''}`}>
              {type.icon}
            </span>
            <span className="text-xs font-medium text-stone-700 group-hover:text-stone-900">{type.label}</span>
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-[#c9a962]/5 to-transparent opacity-0 transition-opacity duration-300 ${hoveredId === type.id ? 'opacity-100' : ''}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function SurveyBudget({ onSelect }: { onSelect: (budget: string) => void }) {
  const budgets = [
    { id: "under-500k", label: "Under $500K" },
    { id: "500k-750k", label: "$500K – $750K" },
    { id: "750k-1m", label: "$750K – $1M" },
    { id: "1m-1.5m", label: "$1M – $1.5M" },
    { id: "1.5m-2m", label: "$1.5M – $2M" },
    { id: "over-2m", label: "$2M+" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Investment Range</p>
        <p className="text-xs text-stone-500">Select your comfortable budget</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {budgets.map((budget, index) => (
          <button
            key={budget.id}
            onClick={() => onSelect(budget.id)}
            className="group p-3 bg-white border border-stone-200 rounded-xl transition-all duration-300 hover:border-[#c9a962] hover:shadow-md text-sm font-medium text-stone-700 hover:text-stone-900 animate-in fade-in duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="group-hover:text-[#0a1628]">{budget.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SurveyBedrooms({ onSelect }: { onSelect: (bedrooms: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { id: "1", label: "1" },
    { id: "2", label: "2" },
    { id: "3", label: "3" },
    { id: "4", label: "4" },
    { id: "5+", label: "5+" },
  ];

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => onSelect(id), 150);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Bedrooms</p>
        <p className="text-xs text-stone-500">How many bedrooms do you need?</p>
      </div>
      <div className="flex gap-2 justify-center">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`w-12 h-12 rounded-full border-2 transition-all duration-300 text-sm font-semibold animate-in fade-in duration-300 ${
              selected === option.id
                ? 'bg-[#0a1628] border-[#0a1628] text-white scale-105'
                : 'bg-white border-stone-200 text-stone-700 hover:border-[#c9a962] hover:shadow-md'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SurveyTimeline({ onSelect }: { onSelect: (timeline: string) => void }) {
  const options = [
    { value: "asap", label: "ASAP / As soon as possible", icon: "🔥" },
    { value: "1-3-months", label: "1-3 months", icon: "📅" },
    { value: "3-6-months", label: "3-6 months", icon: "🗓️" },
    { value: "just-exploring", label: "Just exploring", icon: "🔍" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Timeline</p>
        <p className="text-xs text-stone-500">How soon are you looking to purchase?</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option, index) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="group p-3 bg-white border border-stone-200 rounded-xl transition-all duration-300 hover:border-[#c9a962] hover:shadow-md text-left animate-in fade-in duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-lg mr-2">{option.icon}</span>
            <span className="text-xs font-medium text-stone-700 group-hover:text-stone-900">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SurveyLocation({ onSelect }: { onSelect: (locations: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const locations = [
    "Toronto", "Mississauga", "Brampton", "Vaughan",
    "Markham", "Richmond Hill", "Milton", "Oakville",
    "Burlington", "Hamilton", "Caledon"
  ];

  const toggleLocation = (loc: string) => {
    setSelected(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Preferred Locations</p>
        <p className="text-xs text-stone-500">Select all areas you&apos;re interested in</p>
      </div>
      <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
        {locations.map((loc, index) => (
          <button
            key={loc}
            onClick={() => toggleLocation(loc)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 animate-in fade-in duration-300 ${
              selected.includes(loc)
                ? "bg-[#0a1628] text-white shadow-md"
                : "bg-white border border-stone-200 text-stone-600 hover:border-[#c9a962] hover:text-stone-800"
            }`}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {loc}
          </button>
        ))}
      </div>
      <button
        onClick={() => selected.length > 0 && onSelect(selected)}
        disabled={selected.length === 0}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
          selected.length > 0
            ? "bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
            : "bg-stone-100 text-stone-400 cursor-not-allowed"
        }`}
      >
        {selected.length > 0 ? `Continue with ${selected.length} location${selected.length > 1 ? 's' : ''}` : 'Select at least one location'}
      </button>
    </div>
  );
}

// Show 3 matching listings - VALUE BEFORE ASK
function SurveyListingsDisplay({
  listings,
  onContinue
}: {
  listings: PropertyListing[];
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">
          Here are 3 properties matching your criteria:
        </p>
      </div>

      {/* Display 3 compact property cards */}
      <div className="space-y-3">
        {listings.slice(0, 3).map((property) => (
          <div key={property.id} className="flex gap-3 p-2 bg-stone-50 rounded-lg">
            <div className="w-20 h-16 bg-gradient-to-br from-stone-200 to-stone-300 rounded flex items-center justify-center shrink-0">
              {property.image ? (
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-20 h-16 object-cover rounded"
                />
              ) : (
                <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">
                {formatPrice(property.price)}
              </p>
              <p className="text-xs text-stone-600 truncate">
                {property.bedrooms} bed | {property.bathrooms} bath | {property.city}
              </p>
              <p className="text-xs text-stone-500 truncate">{property.address}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onContinue}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-white shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
      >
        Save These & Get Similar Listings
      </button>
    </div>
  );
}

// Contact info capture - AFTER showing value
function SurveyContactInfo({
  onSubmit
}: {
  onSubmit: (contact: { firstName: string; email: string; phone?: string }) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => !phone || phone.replace(/\D/g, '').length === 10 || phone.replace(/\D/g, '').length === 11;

  const handleSubmit = () => {
    const newErrors: { email?: string; phone?: string } = {};
    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (phone && !validatePhone(phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({ firstName, email, phone: phone || undefined });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <p className="text-sm font-medium text-stone-800 mb-1">Save these listings</p>
        <p className="text-xs text-stone-500">
          We&apos;ll send you similar properties as they become available.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-[#c9a962] bg-white"
            placeholder="Your first name"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Email Address <span className="text-red-500">*</span>
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

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">
            Cell Phone <span className="text-stone-400">(recommended)</span>
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
      </div>

      <button
        onClick={handleSubmit}
        disabled={!firstName || !email}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
          firstName && email
            ? "bg-gradient-to-r from-[#c9a962] to-[#b8944d] text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
            : "bg-stone-100 text-stone-400 cursor-not-allowed"
        }`}
      >
        Save & Send Me Listings
      </button>

      <p className="text-xs text-stone-400 text-center">
        We respect your privacy. Your information is only used to send relevant listings.
      </p>
    </div>
  );
}

export function ChatbotWidget() {
  const {
    isOpen,
    isPromptVisible,
    messages,
    isLoading,
    toggleOpen,
    dismissPrompt,
    addMessage,
    setLoading,
  } = useChatbotStore();

  const [input, setInput] = useState("");
  const [survey, setSurvey] = useState<SurveyState>({ step: "idle" });
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotating prompts - no investment advice
  const prompts = [
    "How can we help you?",
    "Tell us about your dream home",
    "Ready to start your home search?",
    "Need help with selling?",
    "First-time buyer? We can help!"
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, survey.step]);

  // Focus input when chat opens and track interaction
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      trackChatbotInteraction('start');
    }
  }, [isOpen]);

  // Cycle through prompts every 4 seconds when chat is closed
  useEffect(() => {
    if (!isOpen && isPromptVisible) {
      const interval = setInterval(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % prompts.length);
      }, 4000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [isOpen, isPromptVisible, prompts.length]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    trackChatbotInteraction('message');
    addMessage({ role: "user", content: content.trim() });
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: content.trim() },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      addMessage({ role: "assistant", content: data.message });
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        role: "assistant",
        content: "I apologize, I'm having trouble connecting. Please try again or contact us directly at (416) 786-0431.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const startDreamHomeSurvey = () => {
    trackChatbotInteraction('survey_start');
    addMessage({ role: "user", content: "I want to tell you about my dream home." });
    addMessage({ role: "assistant", content: "Wonderful! Let me help you find the perfect property. I'll guide you through a few quick questions." });
    setSurvey({ step: "property-type" });
  };

  const handleSurveyPropertyType = (type: string) => {
    const labels: Record<string, string> = {
      "detached": "Detached House",
      "semi-detached": "Semi-Detached House",
      "townhouse": "Townhouse",
      "condo": "Condo"
    };
    addMessage({ role: "user", content: labels[type] });
    setSurvey(prev => ({ ...prev, propertyType: type, step: "budget" }));
  };

  const handleSurveyBudget = (budget: string) => {
    const labels: Record<string, string> = {
      "under-500k": "Under $500K",
      "500k-750k": "$500K – $750K",
      "750k-1m": "$750K – $1M",
      "1m-1.5m": "$1M – $1.5M",
      "1.5m-2m": "$1.5M – $2M",
      "over-2m": "$2M+"
    };
    addMessage({ role: "user", content: labels[budget] });
    setSurvey(prev => ({ ...prev, budget, step: "bedrooms" }));
  };

  const handleSurveyBedrooms = (bedrooms: string) => {
    addMessage({ role: "user", content: `${bedrooms} bedroom${bedrooms === "1" ? "" : "s"}` });
    setSurvey(prev => ({ ...prev, bedrooms, step: "timeline" }));
  };

  const handleSurveyTimeline = (timeline: string) => {
    const labels: Record<string, string> = {
      "asap": "ASAP",
      "1-3-months": "1-3 months",
      "3-6-months": "3-6 months",
      "just-exploring": "Just exploring"
    };
    addMessage({ role: "user", content: labels[timeline] });
    setSurvey(prev => ({ ...prev, timeline, step: "location" }));
  };

  const handleSurveyLocation = async (locations: string[]) => {
    addMessage({ role: "user", content: locations.join(", ") });
    setLoading(true);

    try {
      // Convert budget string to price range
      const budgetRanges: Record<string, { min: number; max: number }> = {
        "under-500k": { min: 0, max: 500000 },
        "500k-750k": { min: 500000, max: 750000 },
        "750k-1m": { min: 750000, max: 1000000 },
        "1m-1.5m": { min: 1000000, max: 1500000 },
        "1.5m-2m": { min: 1500000, max: 2000000 },
        "over-2m": { min: 2000000, max: 5000000 },
      };
      const priceRange = budgetRanges[survey.budget || "750k-1m"];
      const bedsNum = parseInt(survey.bedrooms || "3");

      // Build search prompt for the AI to use the propertySearch tool
      const searchPrompt = `Search for ${survey.propertyType || 'any'} properties in ${locations.join(" or ")} with ${bedsNum}+ bedrooms between $${priceRange.min.toLocaleString()} and $${priceRange.max.toLocaleString()}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: searchPrompt }
          ],
        }),
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();

      // Add the AI response which should include property results
      addMessage({ role: "assistant", content: data.message || `Great choices! Let me find properties in ${locations.join(", ")} matching your criteria.` });

      // Move to contact info step - the AI response will have shown listings
      setSurvey(prev => ({
        ...prev,
        locations,
        step: "contact-info"
      }));

    } catch (error) {
      console.error("Search error:", error);
      addMessage({
        role: "assistant",
        content: "I had trouble searching right now. Let me save your preferences and have an agent follow up with matching properties."
      });
      setSurvey(prev => ({ ...prev, locations, step: "contact-info" }));
    } finally {
      setLoading(false);
    }
  };

  // Handle transition from listings to contact capture
  const handleShowListingsContinue = () => {
    addMessage({
      role: "assistant",
      content: "I can save these and send you similar listings as they come up. Just need a few details:"
    });
    setSurvey(prev => ({ ...prev, step: "contact-info" }));
  };

  // Handle contact form submission
  const handleContactSubmit = async (contact: { firstName: string; email: string; phone?: string }) => {
    // Track lead capture and survey completion
    trackChatbotInteraction('lead');
    trackChatbotInteraction('survey_complete');
    trackLeadFormSubmit('chatbot');

    setSurvey(prev => ({
      ...prev,
      firstName: contact.firstName,
      email: contact.email,
      phone: contact.phone,
      step: "complete"
    }));

    const contactMsg = contact.phone
      ? `${contact.firstName}, ${contact.email}, ${contact.phone}`
      : `${contact.firstName}, ${contact.email}`;
    addMessage({ role: "user", content: contactMsg });

    // Send to API to create contact
    setLoading(true);
    const summary = `Create a contact for lead capture:
- Name: ${contact.firstName}
- Email: ${contact.email}
- Phone: ${contact.phone || 'Not provided'}
- Lead Type: buyer
- Property Type: ${survey.propertyType}
- Budget: ${survey.budget}
- Bedrooms: ${survey.bedrooms}
- Timeline: ${survey.timeline}
- Locations: ${survey.locations?.join(", ")}`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: summary },
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      addMessage({ role: "assistant", content: data.message });
    } catch (error) {
      console.error("Chat error:", error);
      const thankYouMsg = contact.phone
        ? `Thank you ${contact.firstName}! I've saved your preferences and one of our agents will call you at ${contact.phone} soon.`
        : `Thank you ${contact.firstName}! I'll send personalized recommendations to ${contact.email}.`;
      addMessage({
        role: "assistant",
        content: thankYouMsg,
      });
    } finally {
      setLoading(false);
      setSurvey({ step: "idle" });
    }
  };

  const handleContactUs = () => {
    sendMessage("I'd like to get in touch with the team.");
  };

  // Check if we should show quick actions (only at start, no survey active)
  const showQuickActions = messages.length === 1 && !isLoading && survey.step === "idle";

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Chatbot Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] md:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header - Clean dark navy */}
          <div className="relative bg-[#1a2332] text-white px-5 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c9a962] flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">SC</span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Sri Collective Group</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <p className="text-xs text-white/70">Online now</p>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleOpen}
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Body - Clean white */}
          <div className="flex-1 p-5 overflow-y-auto bg-[#f8f9fa]">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}

            {/* Survey Steps */}
            {survey.step === "property-type" && (
              <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <SurveyPropertyType onSelect={handleSurveyPropertyType} />
              </div>
            )}
            {survey.step === "budget" && (
              <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <SurveyBudget onSelect={handleSurveyBudget} />
              </div>
            )}
            {survey.step === "bedrooms" && (
              <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <SurveyBedrooms onSelect={handleSurveyBedrooms} />
              </div>
            )}
            {survey.step === "timeline" && (
              <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <SurveyTimeline onSelect={handleSurveyTimeline} />
              </div>
            )}
            {survey.step === "location" && (
              <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <SurveyLocation onSelect={handleSurveyLocation} />
              </div>
            )}
            {survey.step === "show-listings" && survey.matchingListings && (
              <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <SurveyListingsDisplay
                  listings={survey.matchingListings}
                  onContinue={handleShowListingsContinue}
                />
              </div>
            )}
            {survey.step === "contact-info" && (
              <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <SurveyContactInfo onSubmit={handleContactSubmit} />
              </div>
            )}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions - Clean modern buttons */}
          {showQuickActions && (
            <div className="px-5 pb-4 bg-[#f8f9fa] flex gap-2">
              <button
                onClick={handleContactUs}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Us
              </button>
              <button
                onClick={startDreamHomeSurvey}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#1a2332] text-white rounded-lg hover:bg-[#242d3f] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Find Your Dream Home
              </button>
            </div>
          )}

          {/* Input Area - Clean modern styling */}
          <form onSubmit={handleSubmit} className="p-5 border-t border-gray-200 bg-white shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading || survey.step !== "idle"}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-gray-300 focus:bg-white disabled:opacity-50 placeholder-gray-400 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || survey.step !== "idle"}
                className="bg-[#1a2332] hover:bg-[#242d3f] disabled:bg-gray-300 text-white p-2.5 rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center w-10 h-10"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prompt Bubble - Premium styling with rotating messages */}
      {!isOpen && isPromptVisible && (
        <div className="absolute bottom-16 right-0 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="relative bg-white dark:bg-[#0f1d32] rounded-2xl shadow-xl border border-stone-200 dark:border-[#c9a962]/30 px-5 py-3.5 w-[240px]">
            <button
              onClick={dismissPrompt}
              className="absolute -top-2 -right-2 w-6 h-6 bg-stone-100 dark:bg-[#1a2d4d] hover:bg-stone-200 dark:hover:bg-[#243a5e] rounded-full flex items-center justify-center text-stone-400 dark:text-gray-400 hover:text-stone-600 dark:hover:text-white transition-all duration-200 shadow-sm"
              aria-label="Dismiss"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <p
              key={currentPromptIndex}
              className="text-sm text-stone-700 dark:text-white font-medium leading-relaxed animate-in fade-in duration-300"
            >
              {prompts[currentPromptIndex]}
            </p>
            {/* Elegant pointer triangle */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-[#0f1d32] border-r border-b border-stone-200 dark:border-[#c9a962]/30 transform rotate-45 shadow-sm" />
          </div>
        </div>
      )}

      {/* Floating Button - Premium with subtle animation */}
      <button
        onClick={toggleOpen}
        className="group bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] hover:from-[#0f1d32] hover:to-[#243a5e] text-white rounded-full w-14 h-14 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center relative overflow-hidden"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Subtle gold ring on hover */}
        <div className="absolute inset-0 rounded-full border-2 border-[#c9a962]/0 group-hover:border-[#c9a962]/30 transition-all duration-300" />

        {/* Pulse animation when closed */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-[#c9a962]/20 animate-ping" style={{ animationDuration: '2s' }} />
        )}

        {isOpen ? (
          <svg
            className="w-6 h-6 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          /* Outline speech bubble icon when closed */
          <svg
            className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
