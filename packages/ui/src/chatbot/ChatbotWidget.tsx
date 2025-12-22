"use client";

import { useState, useRef, useEffect } from "react";
import { useChatbotStore, Message } from "./chatbot-store";

// Survey state type
interface SurveyState {
  step: "idle" | "property-type" | "budget" | "bedrooms" | "location" | "complete";
  propertyType?: string;
  budget?: string;
  bedrooms?: string;
  locations?: string[];
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

  // Rotating prompts
  const prompts = [
    "How can we help you? 💬",
    "Tell us about your dream home! 🏡",
    "Looking for investment opportunities? 💼",
    "Need help with selling? 🏠",
    "Questions about the market? 📊"
  ];

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, survey.step]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
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
  }, [isOpen, isPromptVisible, prompts.length]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

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
    setSurvey(prev => ({ ...prev, bedrooms, step: "location" }));
  };

  const handleSurveyLocation = async (locations: string[]) => {
    addMessage({ role: "user", content: locations.join(", ") });
    setSurvey(prev => ({ ...prev, locations, step: "complete" }));

    // Send summary to AI
    setLoading(true);
    const summary = `I'm looking for a ${survey.propertyType?.replace("-", " ")} with ${survey.bedrooms} bedroom(s), budget ${survey.budget?.replace("-", " to ").replace("k", "K")}, in ${locations.join(" or ")}.`;

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
      addMessage({
        role: "assistant",
        content: "Thank you for sharing your preferences! Our team will curate a selection of properties matching your criteria. Feel free to browse our listings or reach out at (416) 786-0431.",
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
    <div className="fixed bottom-6 right-6 z-50">
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
            {survey.step === "location" && (
              <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
                <SurveyLocation onSelect={handleSurveyLocation} />
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
          <div className="relative bg-white dark:bg-[#0f1d32] rounded-2xl shadow-xl border border-stone-200 dark:border-[#c9a962]/30 px-5 py-3.5 w-[260px]">
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

      {/* Floating Button - Clean simple design */}
      <button
        onClick={toggleOpen}
        className="bg-[#1a2332] hover:bg-[#242d3f] text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
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
          <svg
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
