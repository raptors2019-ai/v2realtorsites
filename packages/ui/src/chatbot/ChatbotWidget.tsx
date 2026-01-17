"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useChatbotStore, MortgageEstimate, PropertySearchResult, CallToAction, hasCookieConsent } from "./chatbot-store";
import { trackChatbotInteraction, trackLeadFormSubmit } from "@repo/analytics";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatQuickActions } from "./ChatQuickActions";
import { SurveyFlow, SurveyState } from "./survey";
import type { CityMatch } from "@repo/lib";

// Interface for stored context sent to API
interface StoredContext {
  contact?: {
    name?: string;
    phone?: string | null;
    email?: string | null;
  };
  preferences?: {
    budget?: { min?: number; max?: number };
    propertyType?: string;
    bedrooms?: number;
    locations?: string[];
    timeline?: string;
  };
  viewedProperties?: Array<{
    listingId: string;
    address: string;
    price: number;
  }>;
  lastVisit?: string;
}

// Floating button component
function FloatingButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  return (
    <button
      onClick={onClick}
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
        <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )}
    </button>
  );
}

// Prompt bubble component
function PromptBubble({ prompts, currentIndex, onDismiss }: { prompts: string[]; currentIndex: number; onDismiss: () => void }) {
  return (
    <div className="absolute bottom-16 right-0 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="relative bg-white dark:bg-[#0f1d32] rounded-2xl shadow-xl border border-stone-200 dark:border-[#c9a962]/30 px-5 py-3.5 w-[240px]">
        <button
          onClick={onDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-stone-100 dark:bg-[#1a2d4d] hover:bg-stone-200 dark:hover:bg-[#243a5e] rounded-full flex items-center justify-center text-stone-400 dark:text-gray-400 hover:text-stone-600 dark:hover:text-white transition-all duration-200 shadow-sm"
          aria-label="Dismiss"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <p key={currentIndex} className="text-sm text-stone-700 dark:text-white font-medium leading-relaxed animate-in fade-in duration-300">
          {prompts[currentIndex]}
        </p>
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-[#0f1d32] border-r border-b border-stone-200 dark:border-[#c9a962]/30 transform rotate-45 shadow-sm" />
      </div>
    </div>
  );
}

// Budget and timeline mappings
const BUDGET_LABELS: Record<string, string> = {
  "under-500k": "Under $500K", "500k-750k": "$500K – $750K", "750k-1m": "$750K – $1M",
  "1m-1.5m": "$1M – $1.5M", "1.5m-2m": "$1.5M – $2M", "over-2m": "$2M+"
};

const BUDGET_RANGES: Record<string, { min: number; max: number; avg: number }> = {
  "under-500k": { min: 0, max: 500000, avg: 400000 },
  "500k-750k": { min: 500000, max: 750000, avg: 625000 },
  "750k-1m": { min: 750000, max: 1000000, avg: 875000 },
  "1m-1.5m": { min: 1000000, max: 1500000, avg: 1250000 },
  "1.5m-2m": { min: 1500000, max: 2000000, avg: 1750000 },
  "over-2m": { min: 2000000, max: 5000000, avg: 2500000 },
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  "detached": "Detached House", "semi-detached": "Semi-Detached House",
  "townhouse": "Townhouse", "condo": "Condo"
};

const TIMELINE_LABELS: Record<string, string> = {
  "asap": "ASAP", "1-3-months": "1-3 months", "3-6-months": "3-6 months", "just-exploring": "Just exploring"
};

const PROMPTS = [
  "How can we help you?", "Tell us about your dream home", "Ready to start your home search?",
  "Need help with selling?", "First-time buyer? We can help!"
];

export function ChatbotWidget() {
  const router = useRouter();
  const { isOpen, isPromptVisible, hasInteracted, messages, isLoading, toggleOpen, minimize, dismissPrompt, addMessage, setLoading, preferences, viewedProperties, phone, email, setContactId, updatePreferences } = useChatbotStore();
  const [input, setInput] = useState("");
  const [survey, setSurvey] = useState<SurveyState>({ step: "idle" });
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMortgageCalculating, setIsMortgageCalculating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rehydrate from localStorage only if cookie consent is accepted
  useEffect(() => {
    if (hasCookieConsent()) {
      useChatbotStore.persist.rehydrate();
    }
    setIsHydrated(true);
  }, []);

  // Build stored context for returning visitors
  const storedContext = useMemo((): StoredContext | null => {
    if (!isHydrated) return null;

    // Only include if we have meaningful data
    const hasContactInfo = preferences.firstName && phone;
    const hasPreferences = preferences.propertyType || preferences.budget || preferences.locations?.length;

    if (!hasContactInfo && !hasPreferences && viewedProperties.length === 0) {
      return null;
    }

    return {
      contact: hasContactInfo ? {
        name: preferences.firstName,
        phone,
        email,
      } : undefined,
      preferences: hasPreferences ? {
        budget: preferences.budget,
        propertyType: preferences.propertyType,
        bedrooms: preferences.bedrooms,
        locations: preferences.locations,
        timeline: preferences.timeline,
      } : undefined,
      viewedProperties: viewedProperties.slice(-5).map(p => ({
        listingId: p.listingId,
        address: p.address,
        price: p.price,
      })),
      lastVisit: preferences.capturedAt,
    };
  }, [isHydrated, preferences, viewedProperties, phone, email]);

  // Check if this is a returning visitor with contact info
  const isReturningVisitor = Boolean(storedContext?.contact?.name && storedContext?.contact?.phone);

  // Generate personalized welcome message for returning visitors
  const welcomeMessage = useMemo(() => {
    if (!isHydrated || !isReturningVisitor || !storedContext?.contact?.name) {
      return null; // Use default welcome
    }

    const name = storedContext.contact.name;
    const propertyType = storedContext.preferences?.propertyType;
    const location = storedContext.preferences?.locations?.[0];

    if (propertyType && location) {
      return `Welcome back, ${name}! Last time you were looking at ${propertyType} homes in ${location}. Want to continue your search or explore something new?`;
    } else if (propertyType) {
      return `Welcome back, ${name}! Last time you were looking at ${propertyType} homes. Want to continue your search or look at something different?`;
    } else if (location) {
      return `Welcome back, ${name}! Last time you were interested in ${location}. Want to continue exploring or search somewhere new?`;
    }

    return `Welcome back, ${name}! Great to see you again. What can I help you find today?`;
  }, [isHydrated, isReturningVisitor, storedContext]);

  // Override the first message for returning visitors
  const displayMessages = useMemo(() => {
    if (!welcomeMessage || messages.length === 0) {
      return messages;
    }

    // Replace the welcome message with personalized one
    return messages.map((msg, index) => {
      if (index === 0 && msg.id === 'welcome' && msg.role === 'assistant') {
        return { ...msg, content: welcomeMessage };
      }
      return msg;
    });
  }, [messages, welcomeMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, isLoading, survey.step]);

  // Focus input when chat opens and track interaction
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      trackChatbotInteraction('start');
    }
  }, [isOpen]);

  // Cycle through prompts every 4 seconds when chat is closed (only if not interacted)
  useEffect(() => {
    if (!isOpen && isPromptVisible && !hasInteracted) {
      const interval = setInterval(() => setCurrentPromptIndex((prev) => (prev + 1) % PROMPTS.length), 4000);
      return () => clearInterval(interval);
    }
    return; // Explicit return for other branches (TypeScript consistency)
  }, [isOpen, isPromptVisible, hasInteracted]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    trackChatbotInteraction('message');
    addMessage({ role: "user", content: content.trim() });
    setInput("");
    setLoading(true);

    try {
      // Build request body - include storedContext for returning visitors
      const requestBody: {
        messages: Array<{ role: string; content: string }>;
        storedContext?: StoredContext;
      } = {
        messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: content.trim() }],
      };

      // Include stored context for personalization (only on first few messages)
      if (storedContext && messages.length <= 2) {
        requestBody.storedContext = storedContext;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let mortgageData: MortgageEstimate | null = null;
      let propertySearchData: PropertySearchResult | null = null;
      let ctaData: CallToAction | null = null;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          for (const line of chunk.split('\n')) {
            if (!line.trim()) continue;
            if (line.startsWith('0:')) {
              try { fullText += JSON.parse(line.slice(2)); } catch {}
            } else if (line.startsWith('2:')) {
              try {
                const parsed = JSON.parse(line.slice(2));
                if (parsed && Array.isArray(parsed)) {
                  for (const item of parsed) {
                    if (item.type === 'mortgageEstimate' && item.data) {
                      mortgageData = item.data;
                      ctaData = item.cta || null;
                    }
                    if (item.type === 'propertySearch' && item.listings) {
                      propertySearchData = {
                        listings: item.listings,
                        total: item.total,
                        viewAllUrl: item.viewAllUrl,
                      };
                    }
                  }
                }
              } catch {}
            }
          }
        }

        if (fullText) {
          // Determine which tool result to attach (property search takes priority for visual rendering)
          let toolResult: { type: 'mortgageEstimate' | 'propertySearch'; data: MortgageEstimate | PropertySearchResult } | undefined;
          if (propertySearchData) {
            toolResult = { type: 'propertySearch', data: propertySearchData };
          } else if (mortgageData) {
            toolResult = { type: 'mortgageEstimate', data: mortgageData };
          }

          addMessage({
            role: "assistant", content: fullText,
            toolResult,
            cta: ctaData || undefined
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({ role: "assistant", content: "I apologize, I'm having trouble connecting. Please try again or contact us directly at (416) 786-0431." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Survey handlers
  const handleSurveyPropertyType = (type: string) => {
    addMessage({ role: "user", content: PROPERTY_TYPE_LABELS[type] });
    setSurvey(prev => ({ ...prev, propertyType: type, step: "budget" }));
  };

  const handleSurveyBudget = (budget: string) => {
    addMessage({ role: "user", content: BUDGET_LABELS[budget] });
    setSurvey(prev => ({ ...prev, budget, step: "bedrooms" }));
  };

  const handleSurveyBedrooms = (bedrooms: string) => {
    addMessage({ role: "user", content: `${bedrooms} bedroom${bedrooms === "1" ? "" : "s"}` });
    setSurvey(prev => ({ ...prev, bedrooms, step: "timeline" }));
  };

  const handleSurveyTimeline = (timeline: string) => {
    addMessage({ role: "user", content: TIMELINE_LABELS[timeline] });
    setSurvey(prev => ({ ...prev, timeline, step: "location" }));
  };

  const handleSurveyLocation = async (locations: string[]) => {
    addMessage({ role: "user", content: locations.join(", ") });
    setLoading(true);

    try {
      const priceRange = BUDGET_RANGES[survey.budget || "750k-1m"];
      const bedsNum = parseInt(survey.bedrooms || "3");
      const searchPrompt = `Search for ${survey.propertyType || 'any'} properties in ${locations.join(" or ")} with ${bedsNum}+ bedrooms between $${priceRange.min.toLocaleString()} and $${priceRange.max.toLocaleString()}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: searchPrompt }] }),
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      addMessage({ role: "assistant", content: data.message || `Great choices! Let me find properties in ${locations.join(", ")} matching your criteria.` });
      setSurvey(prev => ({ ...prev, locations, step: "contact-info" }));
    } catch (error) {
      console.error("Search error:", error);
      addMessage({ role: "assistant", content: "I had trouble searching right now. Let me save your preferences and have an agent follow up with matching properties." });
      setSurvey(prev => ({ ...prev, locations, step: "contact-info" }));
    } finally {
      setLoading(false);
    }
  };

  const handleShowListingsContinue = () => {
    addMessage({ role: "assistant", content: "I can save these and send you similar listings as they come up. Just need a few details:" });
    setSurvey(prev => ({ ...prev, step: "contact-info" }));
  };

  const handleContactSubmit = async (contact: { fullName: string; phone: string; email?: string }) => {
    trackChatbotInteraction('lead');
    if (survey.type === 'dream-home') trackChatbotInteraction('survey_complete');
    trackLeadFormSubmit('chatbot');

    setSurvey(prev => ({ ...prev, firstName: contact.fullName, email: contact.email, phone: contact.phone, step: "complete" }));
    addMessage({ role: "user", content: contact.email ? `${contact.fullName}, ${contact.phone}, ${contact.email}` : `${contact.fullName}, ${contact.phone}` });
    setLoading(true);

    try {
      const nameParts = contact.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || contact.fullName;
      const lastName = nameParts.slice(1).join(' ') || '';

      let contactPrompt = '';
      if (survey.type === 'dream-home') {
        const priceRange = BUDGET_RANGES[survey.budget || "750k-1m"];
        const timelineMap: Record<string, string> = { "asap": "immediate", "1-3-months": "1-3-months", "3-6-months": "3-6-months", "just-exploring": "just-exploring" };
        contactPrompt = `Use the createContact tool to save this buyer lead with their dream home preferences:
- firstName: "${firstName}"
- lastName: "${lastName}"
- email: "${contact.email || ''}"
- cellPhone: "${contact.phone}"
- leadType: "buyer"
- source: "sri-collective"
- propertyTypes: ["${survey.propertyType || 'any'}"]
- averagePrice: ${priceRange.avg}
- averageBeds: ${parseInt(survey.bedrooms || '3')}
- preferredCity: "${survey.locations?.[0] || ''}"
- preferredNeighborhoods: ${JSON.stringify(survey.locations || [])}
- timeline: "${timelineMap[survey.timeline || 'just-exploring']}"`;
      } else {
        contactPrompt = `Use the createContact tool to save this general inquiry lead:
- firstName: "${firstName}"
- lastName: "${lastName}"
- email: "${contact.email || ''}"
- cellPhone: "${contact.phone}"
- leadType: "general"
- source: "sri-collective"`;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: contactPrompt }] }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value).split('\n')) {
            if (line.startsWith('0:')) try { fullText += JSON.parse(line.slice(2)); } catch {}
          }
        }
        if (fullText) addMessage({ role: "assistant", content: fullText });
      }
    } catch (error) {
      console.error("Chat error:", error);
      const thankYouMsg = survey.type === 'dream-home'
        ? `Thank you ${contact.fullName}! One of our agents will call you at ${contact.phone} ASAP to help you find the perfect property.`
        : `Thank you ${contact.fullName}! One of our agents will call you at ${contact.phone} shortly to assist you.`;
      addMessage({ role: "assistant", content: thankYouMsg });
    } finally {
      setLoading(false);
      setSurvey({ step: "idle" });
    }
  };

  // Quick action handlers
  const handleContactUs = () => {
    trackChatbotInteraction('contact_start');
    addMessage({ role: "user", content: "I'd like to get in touch with an agent." });
    addMessage({ role: "assistant", content: "Great! I'll connect you with one of our expert agents. Just need a few quick details:" });
    setSurvey({ step: "contact-info", type: "general-contact" });
  };

  const startDreamHomeSurvey = () => {
    trackChatbotInteraction('survey_start');
    addMessage({ role: "user", content: "I want to tell you about my dream home." });
    addMessage({ role: "assistant", content: "Wonderful! Let me help you find the perfect property. I'll guide you through a few quick questions." });
    setSurvey({ step: "property-type", type: "dream-home" });
  };

  // City search handlers for post-mortgage calculation flow
  const handleCitySelect = (city: CityMatch, maxPrice: number) => {
    trackChatbotInteraction('property_search');
    addMessage({ role: "user", content: city.name });
    // Navigate to properties page with city and exact budget
    router.push(`/properties/${city.slug}?budgetMax=${maxPrice}`);
  };

  const handleSearchAll = (maxPrice: number) => {
    trackChatbotInteraction('property_search');
    addMessage({ role: "user", content: "Search All GTA" });
    // Navigate to properties page with just the budget
    router.push(`/properties?budgetMax=${maxPrice}`);
  };

  // Mortgage unlock handler - save contact and show city search
  const handleMortgageUnlock = async (contact: { phone: string; email?: string }, maxPrice: number) => {
    trackChatbotInteraction('lead');
    trackLeadFormSubmit('chatbot');

    // Store contact info locally
    setContactId('pending', contact.phone, contact.email);
    updatePreferences({ budget: { max: maxPrice } });

    // Send to API to save contact in CRM
    try {
      const contactPrompt = `Use the createContact tool to save this lead who unlocked their mortgage estimate:
- cellPhone: "${contact.phone}"
- email: "${contact.email || ''}"
- leadType: "buyer"
- source: "sri-collective"
- averagePrice: ${maxPrice}
- conversationSummary: "Used mortgage calculator, budget up to ${new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(maxPrice)}"`;

      // Fire and forget - don't block the UI
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: contactPrompt }]
        }),
      }).catch(console.error);

      // Add assistant message asking about city
      addMessage({
        role: "assistant",
        content: "Thanks! Your full results are now unlocked. Which city would you like to search for properties in?",
        cta: {
          type: 'city-search-prompt' as const,
          text: `View Properties Under ${new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(maxPrice)}`,
          maxPrice,
        }
      });
    } catch (error) {
      console.error("Error saving contact:", error);
      // Still show city search even if CRM save fails
      addMessage({
        role: "assistant",
        content: "Thanks! Which city would you like to search for properties in?",
        cta: {
          type: 'city-search-prompt' as const,
          text: `View Properties Under ${new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(maxPrice)}`,
          maxPrice,
        }
      });
    }
  };

  // Mortgage input form handler - call API to calculate and show results
  const handleMortgageInput = async (data: { annualIncome: number; downPayment: number; monthlyDebts: number }) => {
    setIsMortgageCalculating(true);
    trackChatbotInteraction('message');

    // Create the message that triggers the mortgage estimator tool
    const userMessage = `Calculate my affordability with annual income of $${data.annualIncome.toLocaleString()}, down payment of $${data.downPayment.toLocaleString()}, and monthly debts of $${data.monthlyDebts.toLocaleString()}. Use the estimateMortgage tool.`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: userMessage }],
          storedContext: storedContext,
        }),
      });

      if (!response.ok) throw new Error("Failed to calculate");

      const result = await response.json();

      // Parse the result for mortgage estimate data
      if (result.toolResults?.mortgageEstimate) {
        addMessage({
          role: "assistant",
          content: result.content || "Here's your affordability estimate based on Canadian lending rules.",
          toolResult: {
            type: "mortgageEstimate",
            data: result.toolResults.mortgageEstimate,
          },
        });
      } else {
        // Fallback if tool result format is different
        addMessage({
          role: "assistant",
          content: result.content || "I calculated your affordability. Based on your inputs, here are the results.",
        });
      }
    } catch (error) {
      console.error("Error calculating mortgage:", error);
      addMessage({
        role: "assistant",
        content: "Sorry, I had trouble calculating your affordability. Please try again or contact us directly at 416-786-0431.",
      });
    } finally {
      setIsMortgageCalculating(false);
    }
  };

  // Show mortgage input form when user clicks mortgage calculator quick action
  const showMortgageInputForm = () => {
    trackChatbotInteraction('message');
    addMessage({
      role: "assistant",
      content: "Let me help you calculate what you can afford. Fill in the details below:",
      cta: { type: 'mortgage-input-form' as const },
    });
  };

  const showQuickActions = displayMessages.length === 1 && !isLoading && survey.step === "idle";

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen && (
        <div className="mb-4 w-[360px] md:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <ChatHeader onMinimize={minimize} onClose={toggleOpen} />

          <div className="flex-1 p-5 overflow-y-auto bg-[#f8f9fa] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-stone-100 [&::-webkit-scrollbar-thumb]:bg-[#0a1628] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#1a2d4d]">
            <ChatMessages
              messages={displayMessages}
              isLoading={isLoading}
              hasContactInfo={Boolean(phone)}
              isMortgageCalculating={isMortgageCalculating}
              onCitySelect={handleCitySelect}
              onSearchAll={handleSearchAll}
              onToolSelect={sendMessage}
              onMortgageUnlock={handleMortgageUnlock}
              onMortgageInput={handleMortgageInput}
            />

            <SurveyFlow
              step={survey.step}
              surveyType={survey.type}
              matchingListings={survey.matchingListings}
              onPropertyType={handleSurveyPropertyType}
              onBudget={handleSurveyBudget}
              onBedrooms={handleSurveyBedrooms}
              onTimeline={handleSurveyTimeline}
              onLocation={handleSurveyLocation}
              onShowListingsContinue={handleShowListingsContinue}
              onContactSubmit={handleContactSubmit}
            />

            <div ref={messagesEndRef} />
          </div>

          {showQuickActions && (
            <ChatQuickActions
              onDreamHome={startDreamHomeSurvey}
              onMortgageCalculator={showMortgageInputForm}
              onExploreNeighborhoods={() => sendMessage("Tell me about neighborhoods in the GTA.")}
              onContactUs={handleContactUs}
            />
          )}

          <ChatInput
            ref={inputRef}
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading || survey.step !== "idle"}
          />
        </div>
      )}

      {/* Only show rotating prompts if chat is closed, prompts not dismissed, AND user hasn't interacted yet */}
      {!isOpen && isPromptVisible && !hasInteracted && (
        <PromptBubble prompts={PROMPTS} currentIndex={currentPromptIndex} onDismiss={dismissPrompt} />
      )}

      <FloatingButton onClick={toggleOpen} isOpen={isOpen} />
    </div>
  );
}
