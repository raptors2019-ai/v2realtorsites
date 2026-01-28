"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatbotStore, MortgageEstimate, PropertySearchResult, NeighborhoodInfo, FirstTimeBuyerInfo, hasCookieConsent } from "./chatbot-store";
import { trackChatbotInteraction, trackLeadFormSubmit } from "@repo/analytics";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatQuickActions } from "./ChatQuickActions";
import { SurveyFlow, SurveyState } from "./survey";
import { BUDGET_LABELS, BUDGET_RANGES, PROPERTY_TYPE_LABELS, TIMELINE_LABELS, TIMELINE_API_MAP, PROMPTS } from "./constants";
import { useStoredContext, useWelcomeMessage, usePromptRotation, type StoredContext } from "./hooks";
import { parseStreamResponse, parseTextOnlyStream, buildContactPrompt, parseFullName, saveContactToCRM, formatCurrencyCAD } from "./utils";
import type { CityMatch } from "@repo/lib";

// Helper to parse first-time buyer info from AI response text
function parseFirstTimeBuyerFromText(text: string, topic: string, relatedTopics: string[]): FirstTimeBuyerInfo {
  // Extract question (first heading or first sentence)
  const questionMatch = text.match(/##\s*(.+?)[\n\r]/);
  const question = questionMatch ? questionMatch[1].trim() : text.split(/[.!?]/)[0] + '?';

  // Extract the answer (text after question heading, before any other heading)
  const answerMatch = text.match(/##[^\n]+\n\n([\s\S]+?)(?=\n\n\*\*|$)/);
  const answer = answerMatch ? answerMatch[1].trim() : text.split('\n\n')[1] || text;

  // Try to extract programs if they exist
  const programs: Array<{ name: string; benefit: string; eligibility: string }> = [];
  const programMatches = text.matchAll(/\*\*([^*]+)\*\*\n-\s*Benefit:\s*([^\n]+)\n-\s*Eligibility:\s*([^\n]+)/g);
  for (const match of programMatches) {
    programs.push({
      name: match[1].trim(),
      benefit: match[2].trim(),
      eligibility: match[3].trim(),
    });
  }

  // Try to extract total potential savings
  const savingsMatch = text.match(/Total Potential Savings[:\s]*([^\n]+)/i);
  const totalPotentialSavings = savingsMatch ? savingsMatch[1].trim() : undefined;

  // Try to extract steps
  const steps: string[] = [];
  const stepsMatch = text.match(/Steps[:\s]*\n([\s\S]+?)(?=\n\n\*\*|---|\n\*This|$)/i);
  if (stepsMatch) {
    const stepLines = stepsMatch[1].match(/\d+\.\s*([^\n]+)/g);
    if (stepLines) {
      stepLines.forEach(line => {
        const stepText = line.replace(/^\d+\.\s*/, '').trim();
        if (stepText) steps.push(stepText);
      });
    }
  }

  // Try to extract benefits
  const benefits: string[] = [];
  const benefitsMatch = text.match(/Benefits[:\s]*\n([\s\S]+?)(?=\n\n\*\*|---|\n\*This|$)/i);
  if (benefitsMatch) {
    const benefitLines = benefitsMatch[1].match(/-\s*([^\n]+)/g);
    if (benefitLines) {
      benefitLines.forEach(line => {
        const benefitText = line.replace(/^-\s*/, '').trim();
        if (benefitText) benefits.push(benefitText);
      });
    }
  }

  return {
    topic,
    question,
    answer,
    programs: programs.length > 0 ? programs : undefined,
    totalPotentialSavings,
    steps: steps.length > 0 ? steps : undefined,
    benefits: benefits.length > 0 ? benefits : undefined,
    relatedTopics,
  };
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


export function ChatbotWidget() {
  const router = useRouter();
  const {
    isOpen, isPromptVisible, hasInteracted, messages, isLoading,
    toggleOpen, minimize, dismissPrompt, addMessage, setLoading,
    preferences, viewedProperties, phone, email, setContactId, updatePreferences,
    // Lead gate state and actions
    toolUsageCount, hasSoftAsked: _hasSoftAsked, hasProvidedContact, skipCount,
    incrementToolUsage: _incrementToolUsage, markSoftAsked, skipSoftAsk, incrementSkipCount, completeContactCapture
  } = useChatbotStore();

  // Max skips allowed before user must provide contact info
  const MAX_SKIPS = 2;
  const remainingSkips = Math.max(0, MAX_SKIPS - skipCount);

  // Compute if hard gate is active
  const isHardGateActive = toolUsageCount >= 2 && !hasProvidedContact;
  const [input, setInput] = useState("");
  const [survey, setSurvey] = useState<SurveyState>({ step: "idle" });
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMortgageCalculating, setIsMortgageCalculating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestMessageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mortgageCardRef = useRef<HTMLDivElement>(null);
  const surveyStepRef = useRef(survey.step); // Track survey step for setTimeout callbacks

  // Keep surveyStepRef in sync with survey state
  useEffect(() => {
    surveyStepRef.current = survey.step;
  }, [survey.step]);

  // Rehydrate from localStorage only if cookie consent is accepted
  useEffect(() => {
    if (hasCookieConsent()) {
      useChatbotStore.persist.rehydrate();
    }
    setIsHydrated(true);
  }, []);

  // Build stored context for returning visitors
  const storedContext = useStoredContext({
    isHydrated,
    preferences,
    viewedProperties,
    phone,
    email,
  });

  // Generate personalized welcome message for returning visitors
  const { displayMessages } = useWelcomeMessage({
    isHydrated,
    storedContext,
    messages,
  });

  // Rotate prompts when chat is closed
  const { currentIndex: currentPromptIndex } = usePromptRotation({
    prompts: PROMPTS,
    enabled: !isOpen && isPromptVisible && !hasInteracted,
  });

  // Track previous message count to detect new messages with tool results
  const prevMessageCountRef = useRef(messages.length);

  // Detect when a new tool result is added and trigger gates
  // Note: We access store state directly to avoid infinite loops from dependency changes
  useEffect(() => {
    // Only run when a new message is added
    if (messages.length <= prevMessageCountRef.current) {
      return;
    }

    // Update ref immediately to prevent re-processing
    prevMessageCountRef.current = messages.length;

    // Check the last message for a tool result
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.toolResult) {
      return;
    }

    // Get current state from store to avoid stale closure values
    const state = useChatbotStore.getState();
    if (state.hasProvidedContact) {
      return;
    }

    // A tool was used - increment counter
    state.incrementToolUsage();

    // Skip showing soft-ask/hard-gate if the tool card has its own inline unlock form
    const toolsWithInlineForms = ['mortgageEstimate', 'neighborhoodInfo', 'firstTimeBuyer'];
    const hasInlineForm = toolsWithInlineForms.includes(lastMessage.toolResult.type);
    if (hasInlineForm) {
      // Card has its own unlock form, don't show additional gates
      console.log('[chatbot.gate.skip]', { reason: 'card has its own contact form', tool: lastMessage.toolResult.type });
      return;
    }

    // Determine which gate to show (after incrementing)
    const newToolCount = state.toolUsageCount + 1;

    if (newToolCount === 1 && !state.hasSoftAsked) {
      // First tool use - show soft ask after a short delay
      setTimeout(() => {
        // Re-check ALL state at execution time (user may have provided contact via card unlock)
        const currentState = useChatbotStore.getState();
        const currentSurveyStep = surveyStepRef.current;
        // Check if there's a card with inline form (these handle their own contact capture)
        const inlineFormTools = ['mortgageEstimate', 'neighborhoodInfo', 'firstTimeBuyer'];
        const hasCardWithInlineForm = messages.some(m => m.toolResult && inlineFormTools.includes(m.toolResult.type));
        console.log('[chatbot.softAsk.check]', {
          currentSurveyStep,
          hasProvidedContact: currentState.hasProvidedContact,
          hasSoftAsked: currentState.hasSoftAsked,
          hasCardWithInlineForm,
          willShow: currentSurveyStep === "idle" && !currentState.hasProvidedContact && !currentState.hasSoftAsked && !hasCardWithInlineForm,
        });
        if (currentSurveyStep === "idle" && !currentState.hasProvidedContact && !currentState.hasSoftAsked && !hasCardWithInlineForm) {
          setSurvey({ step: "soft-ask", type: "general-contact" });
        }
      }, 1500);
    } else if (newToolCount >= 2) {
      // Second+ tool use - show hard gate after a short delay
      setTimeout(() => {
        // Re-check ALL state at execution time
        const currentState = useChatbotStore.getState();
        const currentSurveyStep = surveyStepRef.current;
        // Check if there's a card with inline form (these handle their own contact capture)
        const inlineFormTools = ['mortgageEstimate', 'neighborhoodInfo', 'firstTimeBuyer'];
        const hasCardWithInlineForm = messages.some(m => m.toolResult && inlineFormTools.includes(m.toolResult.type));
        if ((currentSurveyStep === "idle" || currentSurveyStep === "soft-ask") && !currentState.hasProvidedContact && !hasCardWithInlineForm) {
          setSurvey({ step: "hard-gate", type: "general-contact" });
        }
      }, 1500);
    }
  }, [messages]); // Only depend on messages - access other state directly from store

  // Scroll to top of latest message when messages change (so cards are fully visible)
  useEffect(() => {
    // Small delay to let card render fully before scrolling
    const timer = setTimeout(() => {
      latestMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => clearTimeout(timer);
  }, [displayMessages, isLoading, survey.step]);

  // Focus input when chat opens and track interaction
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      trackChatbotInteraction('start');
    }
  }, [isOpen]);

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

      // Include stored context for personalization - always send if we have contact info
      // so the AI knows not to ask for it again
      if (storedContext) {
        requestBody.storedContext = storedContext;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const { text: fullText, mortgageData, propertySearchData, neighborhoodData, firstTimeBuyerData, ctaData } = await parseStreamResponse(response);

      if (fullText) {
        // Determine which tool result to attach (priority order for visual rendering)
        let toolResult: { type: 'mortgageEstimate' | 'propertySearch' | 'neighborhoodInfo' | 'firstTimeBuyer'; data: MortgageEstimate | PropertySearchResult | NeighborhoodInfo | FirstTimeBuyerInfo } | undefined;
        if (propertySearchData) {
          toolResult = { type: 'propertySearch', data: propertySearchData };
        } else if (mortgageData) {
          toolResult = { type: 'mortgageEstimate', data: mortgageData };
        } else if (neighborhoodData) {
          toolResult = { type: 'neighborhoodInfo', data: neighborhoodData };
        } else if (firstTimeBuyerData) {
          const ftbData = parseFirstTimeBuyerFromText(fullText, firstTimeBuyerData.topic, firstTimeBuyerData.relatedTopics);
          toolResult = { type: 'firstTimeBuyer', data: ftbData };
        }

        addMessage({
          role: "assistant",
          content: fullText,
          toolResult,
          cta: ctaData || undefined
        });
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
      const { firstName, lastName } = parseFullName(contact.fullName);
      const priceRange = BUDGET_RANGES[survey.budget || "750k-1m"];

      const contactPrompt = survey.type === 'dream-home'
        ? buildContactPrompt(
            { firstName, lastName, phone: contact.phone, email: contact.email },
            {
              leadType: 'buyer',
              propertyTypes: [survey.propertyType || 'any'],
              averagePrice: priceRange.avg,
              averageBeds: parseInt(survey.bedrooms || '3'),
              preferredCity: survey.locations?.[0] || '',
              preferredNeighborhoods: survey.locations || [],
              timeline: TIMELINE_API_MAP[survey.timeline || 'just-exploring'],
            }
          )
        : buildContactPrompt(
            { firstName, lastName, phone: contact.phone, email: contact.email },
            { leadType: 'general' }
          );

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages.map((m) => ({ role: m.role, content: m.content })), { role: "user", content: contactPrompt }] }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const fullText = await parseTextOnlyStream(response);
      if (fullText) addMessage({ role: "assistant", content: fullText });
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

  // Mortgage unlock handler - save contact and scroll to card (city picker replaces follow-up message)
  const handleMortgageUnlock = (contact: { name: string; phone: string; email?: string }, maxPrice: number) => {
    trackChatbotInteraction('lead');
    trackLeadFormSubmit('chatbot');

    const { firstName, lastName } = parseFullName(contact.name);

    // Store contact info locally and mark as provided
    setContactId('pending', contact.phone, contact.email);
    completeContactCapture(contact.name, contact.phone, contact.email);
    markSoftAsked();
    setSurvey({ step: "idle" });
    updatePreferences({ budget: { max: maxPrice } });

    // Scroll to mortgage card after a brief delay to let it re-render unlocked
    setTimeout(() => {
      mortgageCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    // Save to CRM (fire and forget)
    const contactPrompt = buildContactPrompt(
      { firstName, lastName, phone: contact.phone, email: contact.email },
      {
        leadType: 'buyer',
        averagePrice: maxPrice,
        conversationSummary: `Used mortgage calculator, budget up to ${formatCurrencyCAD(maxPrice)}`,
      }
    );
    saveContactToCRM(messages, contactPrompt);
  };

  // Handler for city select from mortgage card picker
  const handleMortgageCitySelect = (citySlug: string, _cityName: string, maxPrice: number) => {
    trackChatbotInteraction('property_search');
    router.push(`/properties/${citySlug}?budgetMax=${maxPrice}`);
  };

  // Handler for "Search All GTA" from mortgage card picker
  const handleMortgageSearchAll = (maxPrice: number) => {
    trackChatbotInteraction('property_search');
    router.push(`/properties?budgetMax=${maxPrice}`);
  };

  // Handler for skipping the mortgage card unlock (city picker shows in card instead of follow-up message)
  const handleMortgageSkip = () => {
    skipSoftAsk(); // Mark soft ask as skipped so it doesn't appear later
    incrementSkipCount(); // Track skip for limiting future skips
    // Note: No follow-up message needed - the city picker in the card replaces it
  };

  // Neighborhood card unlock handler - save contact, show full guide, suggest property search
  const handleNeighborhoodUnlock = (contact: { name: string; phone: string; email?: string }, city: string) => {
    trackChatbotInteraction('lead');
    trackLeadFormSubmit('chatbot');

    const { firstName, lastName } = parseFullName(contact.name);

    // Store contact info locally and mark as provided
    setContactId('pending', contact.phone, contact.email);
    completeContactCapture(contact.name, contact.phone, contact.email);
    markSoftAsked();
    setSurvey({ step: "idle" });
    updatePreferences({ locations: [city] });

    // Add follow-up message after a delay
    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: `Thanks ${firstName}! Your full ${city} guide is now unlocked. Would you like me to search for properties in ${city}?`,
      });
    }, 1000);

    // Save to CRM (fire and forget)
    const contactPrompt = buildContactPrompt(
      { firstName, lastName, phone: contact.phone, email: contact.email },
      {
        leadType: 'buyer',
        preferredCity: city,
        conversationSummary: `Explored ${city} neighborhood info`,
      }
    );
    saveContactToCRM(messages, contactPrompt);
  };

  // Handler for skipping neighborhood unlock
  const handleNeighborhoodSkip = () => {
    skipSoftAsk();
    incrementSkipCount(); // Track skip for limiting future skips
    addMessage({
      role: "assistant",
      content: "No problem! Would you like to explore a different city, or try our mortgage calculator to see what you can afford?",
    });
  };

  // Handler for "Search Properties in {City}" on neighborhood card
  const handleSearchPropertiesFromNeighborhood = (city: string, maxPrice?: number) => {
    trackChatbotInteraction('property_search');
    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
    const url = maxPrice
      ? `/properties/${citySlug}?budgetMax=${maxPrice}`
      : `/properties/${citySlug}`;
    router.push(url);
  };

  // Handler for clicking a neighborhood chip
  const handleNeighborhoodClick = (neighborhood: string, city: string) => {
    sendMessage(`Tell me more about ${neighborhood} in ${city}`);
  };

  // First-time buyer card unlock handler
  const handleFirstTimeBuyerUnlock = (contact: { name: string; phone: string; email?: string }) => {
    trackChatbotInteraction('lead');
    trackLeadFormSubmit('chatbot');

    const { firstName, lastName } = parseFullName(contact.name);

    // Store contact info locally and mark as provided
    setContactId('pending', contact.phone, contact.email);
    completeContactCapture(contact.name, contact.phone, contact.email);
    markSoftAsked();
    setSurvey({ step: "idle" });

    // Add follow-up message after a delay
    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: `Thanks ${firstName}! Your full details are now unlocked. Would you like to calculate your affordability next?`,
      });
    }, 1000);

    // Save to CRM (fire and forget)
    const contactPrompt = buildContactPrompt(
      { firstName, lastName, phone: contact.phone, email: contact.email },
      {
        leadType: 'buyer',
        firstTimeBuyer: true,
        conversationSummary: "First-time buyer researching programs and incentives",
      }
    );
    saveContactToCRM(messages, contactPrompt);
  };

  // Handler for skipping first-time buyer unlock
  const handleFirstTimeBuyerSkip = () => {
    skipSoftAsk();
    incrementSkipCount(); // Track skip for limiting future skips
    addMessage({
      role: "assistant",
      content: "No problem! What else can I help you with? I can search properties, tell you about neighborhoods, or calculate your affordability.",
    });
  };

  // Handler for mortgage calculator CTA from first-time buyer card
  const handleMortgageCalculatorFromFTB = () => {
    trackChatbotInteraction('message');
    addMessage({
      role: "assistant",
      content: "Let me help you calculate what you can afford. Fill in the details below:",
      cta: { type: 'mortgage-input-form' as const },
    });
  };

  // Handler for clicking a related topic on first-time buyer card
  const handleRelatedTopicClick = (topic: string) => {
    const topicPrompts: Record<string, string> = {
      'home-buying-process': 'What are the steps to buying a home in Ontario?',
      'closing-costs': 'What closing costs should I budget for?',
      'first-time-buyer-incentives': 'What incentives are available for first-time buyers?',
      'pre-approval': 'Do I need mortgage pre-approval?',
      'down-payment': 'How much down payment do I need?',
    };
    const prompt = topicPrompts[topic] || `Tell me about ${topic.replace(/-/g, ' ')}`;
    sendMessage(prompt);
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

      const { text: fullText, mortgageData, ctaData } = await parseStreamResponse(response);

      if (fullText) {
        addMessage({
          role: "assistant",
          content: fullText,
          toolResult: mortgageData ? { type: "mortgageEstimate", data: mortgageData } : undefined,
          cta: ctaData || undefined,
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

  // Show neighborhood city picker when user clicks explore neighborhoods quick action
  const showNeighborhoodCityPicker = () => {
    trackChatbotInteraction('message');
    addMessage({
      role: "assistant",
      content: "I can provide information about various neighborhoods in the Greater Toronto Area. Which city are you interested in?",
      cta: { type: 'neighborhood-city-picker' as const },
    });
  };

  // Handler when user selects a city from the neighborhood city picker
  const handleNeighborhoodCitySelect = (cityName: string) => {
    sendMessage(`Tell me about ${cityName}`);
  };

  // Lead gate handlers
  const handleSoftAskSubmit = (contact: { fullName: string; phone: string; email?: string }) => {
    trackChatbotInteraction('lead');
    trackLeadFormSubmit('chatbot');

    completeContactCapture(contact.fullName, contact.phone, contact.email);
    markSoftAsked();
    setSurvey({ step: "idle" });

    const { firstName, lastName } = parseFullName(contact.fullName);
    const contactPrompt = buildContactPrompt(
      { firstName, lastName, phone: contact.phone, email: contact.email },
      {
        leadType: 'buyer',
        conversationSummary: `Saved chatbot results after using ${toolUsageCount} tool(s)`,
      }
    );
    saveContactToCRM(messages, contactPrompt);

    addMessage({
      role: "assistant",
      content: `Thanks ${firstName}! Your results are saved. Feel free to explore more tools and we'll be in touch soon.`,
    });
  };

  const handleSoftAskSkip = () => {
    skipSoftAsk();
    setSurvey({ step: "idle" });
    addMessage({
      role: "assistant",
      content: "No problem! Feel free to continue exploring. Let me know if you have any questions.",
    });
  };

  const handleHardGateSubmit = (contact: { fullName: string; phone: string; email?: string }) => {
    trackChatbotInteraction('lead');
    trackLeadFormSubmit('chatbot');

    completeContactCapture(contact.fullName, contact.phone, contact.email);
    setSurvey({ step: "idle" });

    const { firstName, lastName } = parseFullName(contact.fullName);
    const contactPrompt = buildContactPrompt(
      { firstName, lastName, phone: contact.phone, email: contact.email },
      {
        leadType: 'buyer',
        conversationSummary: `Unlocked all chatbot tools after using ${toolUsageCount} tool(s)`,
      }
    );
    saveContactToCRM(messages, contactPrompt);

    addMessage({
      role: "assistant",
      content: `Welcome ${firstName}! All tools are now unlocked. What would you like to explore next? I can help with property searches, neighborhood info, mortgage calculations, and more.`,
    });
  };

  const showQuickActions = displayMessages.length === 1 && !isLoading && survey.step === "idle" && !isHardGateActive;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isOpen && (
        <div className="mb-4 w-[360px] md:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <ChatHeader onMinimize={minimize} onClose={toggleOpen} />

          <div className="flex-1 p-5 overflow-y-auto bg-[#f8f9fa] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-stone-100 [&::-webkit-scrollbar-thumb]:bg-[#0a1628] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-[#1a2d4d]">
            <ChatMessages
              messages={displayMessages}
              isLoading={isLoading}
              hasContactInfo={Boolean(phone) || hasProvidedContact}
              isMortgageCalculating={isMortgageCalculating}
              isGated={isHardGateActive}
              latestMessageRef={latestMessageRef}
              onCitySelect={handleCitySelect}
              onSearchAll={handleSearchAll}
              onToolSelect={sendMessage}
              onMortgageUnlock={handleMortgageUnlock}
              onMortgageInput={handleMortgageInput}
              onMortgageCitySelect={handleMortgageCitySelect}
              onMortgageSearchAll={handleMortgageSearchAll}
              onMortgageSkip={handleMortgageSkip}
              mortgageRemainingSkips={remainingSkips}
              mortgageCardRef={mortgageCardRef}
              onNeighborhoodUnlock={handleNeighborhoodUnlock}
              onNeighborhoodSkip={handleNeighborhoodSkip}
              neighborhoodRemainingSkips={remainingSkips}
              onSearchPropertiesFromNeighborhood={handleSearchPropertiesFromNeighborhood}
              onNeighborhoodClick={handleNeighborhoodClick}
              onFirstTimeBuyerUnlock={handleFirstTimeBuyerUnlock}
              onFirstTimeBuyerSkip={handleFirstTimeBuyerSkip}
              firstTimeBuyerRemainingSkips={remainingSkips}
              onMortgageCalculatorFromFTB={handleMortgageCalculatorFromFTB}
              onRelatedTopicClick={handleRelatedTopicClick}
              onNeighborhoodCitySelect={handleNeighborhoodCitySelect}
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
              onSoftAskSubmit={handleSoftAskSubmit}
              onSoftAskSkip={handleSoftAskSkip}
              onHardGateSubmit={handleHardGateSubmit}
            />

            <div ref={messagesEndRef} />
          </div>

          {showQuickActions && (
            <ChatQuickActions
              onDreamHome={startDreamHomeSurvey}
              onMortgageCalculator={showMortgageInputForm}
              onExploreNeighborhoods={showNeighborhoodCityPicker}
              onContactUs={handleContactUs}
            />
          )}

          <ChatInput
            ref={inputRef}
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={isLoading || survey.step !== "idle" || isHardGateActive}
            placeholder={isHardGateActive ? "Complete form above to continue..." : "Type your message..."}
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
