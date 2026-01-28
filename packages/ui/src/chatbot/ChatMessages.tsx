"use client";

import ReactMarkdown from "react-markdown";
import { Message, MortgageEstimate, PropertySearchResult, NavigationCTA, NeighborhoodInfo, FirstTimeBuyerInfo } from "./chatbot-store";
import { ChatMortgageCard } from "./ChatMortgageCard";
import { ChatMortgageInputForm } from "./ChatMortgageInputForm";
import { ChatPropertyList } from "./ChatPropertyCard";
import { ChatNavigationCTA } from "./ChatNavigationCTA";
import { ChatNeighborhoodCard } from "./ChatNeighborhoodCard";
import { ChatNeighborhoodCityPicker } from "./ChatNeighborhoodCityPicker";
import { ChatFirstTimeBuyerCard } from "./ChatFirstTimeBuyerCard";
import { ToolDiscoveryWidgets } from "./ToolDiscoveryWidgets";
import type { CityMatch } from "@repo/lib";

// Markdown components for styling
const markdownComponents = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base font-semibold text-stone-800 mb-2 mt-1">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-sm font-semibold text-stone-700 mb-1.5 mt-3">{children}</h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="text-sm font-medium text-stone-700 mb-1 mt-2">{children}</h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="text-sm space-y-1 mb-2 ml-1">{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed flex items-start gap-1.5">
      <span className="text-[#c9a962] mt-1.5 text-xs">•</span>
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-stone-800">{children}</strong>
  ),
};

// Typing indicator component
export function TypingIndicator() {
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

// Individual message bubble component
interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
  showCitySearch?: boolean;
  showMortgageInput?: boolean;
  showNeighborhoodCityPicker?: boolean;
  hasContactInfo?: boolean;
  isMortgageCalculating?: boolean;
  isGated?: boolean; // Hide tool discovery widgets when gated
  onCitySelect?: (city: CityMatch, maxPrice: number) => void;
  onSearchAll?: (maxPrice: number) => void;
  onToolSelect?: (prompt: string) => void;
  onMortgageUnlock?: (contact: { name: string; phone: string; email?: string }, maxPrice: number) => void;
  onMortgageInput?: (data: { annualIncome: number; downPayment: number; monthlyDebts: number }) => void;
  /** Callback when user selects a city from mortgage card picker */
  onMortgageCitySelect?: (citySlug: string, cityName: string, maxPrice: number) => void;
  /** Callback when user clicks "Search All GTA" from mortgage card picker */
  onMortgageSearchAll?: (maxPrice: number) => void;
  /** Callback when user skips the mortgage card unlock */
  onMortgageSkip?: () => void;
  /** Number of skips remaining for mortgage card (if 0, skip button is hidden) */
  mortgageRemainingSkips?: number;
  /** Ref to attach to the mortgage card for scrolling */
  mortgageCardRef?: React.RefObject<HTMLDivElement | null>;
  /** Callback when user unlocks neighborhood card */
  onNeighborhoodUnlock?: (contact: { name: string; phone: string; email?: string }, city: string) => void;
  /** Callback when user skips neighborhood unlock */
  onNeighborhoodSkip?: () => void;
  /** Number of skips remaining for neighborhood card (if 0, skip button is hidden) */
  neighborhoodRemainingSkips?: number;
  /** Callback when user clicks "Search Properties in {City}" on neighborhood card */
  onSearchPropertiesFromNeighborhood?: (city: string, maxPrice?: number) => void;
  /** Callback when user clicks a neighborhood chip */
  onNeighborhoodClick?: (neighborhood: string, city: string) => void;
  /** Callback when user unlocks first-time buyer card */
  onFirstTimeBuyerUnlock?: (contact: { name: string; phone: string; email?: string }) => void;
  /** Callback when user skips first-time buyer unlock */
  onFirstTimeBuyerSkip?: () => void;
  /** Number of skips remaining for first-time buyer card (if 0, skip button is hidden) */
  firstTimeBuyerRemainingSkips?: number;
  /** Callback when user clicks mortgage calculator from first-time buyer card */
  onMortgageCalculatorFromFTB?: () => void;
  /** Callback when user clicks a related topic on first-time buyer card */
  onRelatedTopicClick?: (topic: string) => void;
  /** Ref to attach to the latest message for scrolling */
  latestMessageRef?: React.RefObject<HTMLDivElement | null>;
  /** Callback when user selects a city from the neighborhood city picker */
  onNeighborhoodCitySelect?: (cityName: string) => void;
}

export function MessageBubble({ message, isLatest, showCitySearch: _showCitySearch, showMortgageInput, showNeighborhoodCityPicker, hasContactInfo, isMortgageCalculating, isGated, onCitySelect: _onCitySelect, onSearchAll: _onSearchAll, onToolSelect, onMortgageUnlock, onMortgageInput, onMortgageCitySelect, onMortgageSearchAll, onMortgageSkip, mortgageRemainingSkips, mortgageCardRef, onNeighborhoodUnlock, onNeighborhoodSkip, neighborhoodRemainingSkips, onSearchPropertiesFromNeighborhood, onNeighborhoodClick, onFirstTimeBuyerUnlock, onFirstTimeBuyerSkip, firstTimeBuyerRemainingSkips, onMortgageCalculatorFromFTB, onRelatedTopicClick, latestMessageRef, onNeighborhoodCitySelect }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const hasMortgageData = message.toolResult?.type === "mortgageEstimate";
  const hasPropertyData = message.toolResult?.type === "propertySearch";
  const hasNavigationData = message.toolResult?.type === "navigation";
  const hasNeighborhoodData = message.toolResult?.type === "neighborhoodInfo";
  const hasFirstTimeBuyerData = message.toolResult?.type === "firstTimeBuyer";
  const hasToolData = hasMortgageData || hasPropertyData || hasNavigationData || hasNeighborhoodData || hasFirstTimeBuyerData;

  // Check CTA types
  const hasMortgageInputCta = message.cta?.type === 'mortgage-input-form';
  const hasNeighborhoodCityPickerCta = message.cta?.type === 'neighborhood-city-picker';

  return (
    <div
      ref={isLatest ? latestMessageRef : undefined}
      className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : ""} ${isLatest ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""}`}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] flex items-center justify-center shrink-0 shadow-md">
          <span className="text-white text-xs font-semibold tracking-wide">SC</span>
        </div>
      )}
      <div className={`${isUser ? "max-w-[80%]" : "max-w-[90%]"} ${isUser ? "px-4 py-3" : ""} ${
          isUser
            ? "bg-gradient-to-br from-[#0a1628] to-[#0f1d32] text-white rounded-2xl rounded-tr-none shadow-md"
            : ""
        }`}
      >
        {/* Render mortgage card if available */}
        {hasMortgageData && !isUser && (
          <div className="space-y-3" ref={mortgageCardRef}>
            <ChatMortgageCard
              {...(message.toolResult!.data as MortgageEstimate)}
              isLocked={!hasContactInfo}
              onUnlock={onMortgageUnlock ? (contact) => onMortgageUnlock(contact, (message.toolResult!.data as MortgageEstimate).maxHomePrice) : undefined}
              onSkip={onMortgageSkip}
              remainingSkips={mortgageRemainingSkips}
              onCitySelect={onMortgageCitySelect}
              onSearchAll={onMortgageSearchAll}
            />
            {/* Only show text content when card is UNLOCKED - otherwise it reveals the locked data */}
            {hasContactInfo && message.content && (
              <div className="bg-white border border-stone-100 text-stone-700 rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
                <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
              </div>
            )}
            {/* Tool Discovery Widgets - only show when unlocked and not gated */}
            {hasContactInfo && isLatest && onToolSelect && !isGated && (
              <ToolDiscoveryWidgets
                currentTool="mortgage"
                onToolSelect={onToolSelect}
              />
            )}
          </div>
        )}

        {/* Render property search results if available */}
        {hasPropertyData && !isUser && (
          <div className="space-y-3">
            {/* Brief intro message */}
            <div className="bg-white border border-stone-100 text-stone-700 rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
              <p className="text-sm leading-relaxed">
                I found several properties matching your criteria. Here are a few results:
              </p>
            </div>
            {/* Property cards */}
            <ChatPropertyList
              listings={(message.toolResult!.data as PropertySearchResult).listings}
              viewAllUrl={(message.toolResult!.data as PropertySearchResult).viewAllUrl}
            />
            {/* Tool Discovery Widgets - hidden when gated */}
            {isLatest && onToolSelect && !isGated && (
              <ToolDiscoveryWidgets
                currentTool="property-search"
                onToolSelect={onToolSelect}
              />
            )}
          </div>
        )}

        {/* Render navigation CTA if available */}
        {hasNavigationData && !isUser && (
          <div className="space-y-3">
            {/* Optional intro message */}
            {message.content && (
              <div className="bg-white border border-stone-100 text-stone-700 rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
                <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
              </div>
            )}
            {/* Navigation CTA card */}
            <ChatNavigationCTA {...(message.toolResult!.data as NavigationCTA)} />
          </div>
        )}

        {/* Render neighborhood info card if available */}
        {hasNeighborhoodData && !isUser && (
          <div className="space-y-3">
            <ChatNeighborhoodCard
              {...(message.toolResult!.data as NeighborhoodInfo)}
              isLocked={!hasContactInfo}
              onUnlock={onNeighborhoodUnlock ? (contact) => onNeighborhoodUnlock(contact, (message.toolResult!.data as NeighborhoodInfo).city) : undefined}
              onSkip={onNeighborhoodSkip}
              remainingSkips={neighborhoodRemainingSkips}
              onSearchProperties={hasContactInfo && onSearchPropertiesFromNeighborhood ? (city, maxPrice) => onSearchPropertiesFromNeighborhood(city, maxPrice) : undefined}
              onNeighborhoodClick={onNeighborhoodClick}
            />
            {/* Tool Discovery Widgets - only show when unlocked and not gated */}
            {hasContactInfo && isLatest && onToolSelect && !isGated && (
              <ToolDiscoveryWidgets
                currentTool="neighborhood"
                onToolSelect={onToolSelect}
              />
            )}
          </div>
        )}

        {/* Render first-time buyer card if available */}
        {hasFirstTimeBuyerData && !isUser && (
          <div className="space-y-3">
            <ChatFirstTimeBuyerCard
              {...(message.toolResult!.data as FirstTimeBuyerInfo)}
              isLocked={!hasContactInfo}
              onUnlock={onFirstTimeBuyerUnlock}
              onSkip={onFirstTimeBuyerSkip}
              remainingSkips={firstTimeBuyerRemainingSkips}
              onMortgageCalculator={hasContactInfo ? onMortgageCalculatorFromFTB : undefined}
              onRelatedTopicClick={onRelatedTopicClick}
            />
            {/* Tool Discovery Widgets - only show when unlocked and not gated */}
            {hasContactInfo && isLatest && onToolSelect && !isGated && (
              <ToolDiscoveryWidgets
                currentTool="first-time-buyer"
                onToolSelect={onToolSelect}
              />
            )}
          </div>
        )}

        {/* Regular message bubble */}
        {!hasToolData && !hasMortgageInputCta && !hasNeighborhoodCityPickerCta && (
          <div className={isUser ? "" : "bg-white border border-stone-100 text-stone-700 rounded-2xl rounded-tl-none shadow-sm px-4 py-3"}>
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
            ) : (
              <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
            )}
          </div>
        )}

        {/* Mortgage Input Form - shown when message has mortgage-input-form CTA */}
        {hasMortgageInputCta && showMortgageInput && !isUser && (
          <div className="space-y-3">
            {message.content && (
              <div className="bg-white border border-stone-100 text-stone-700 rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
                <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
              </div>
            )}
            <ChatMortgageInputForm
              onSubmit={onMortgageInput || (() => {})}
              isLoading={isMortgageCalculating}
            />
          </div>
        )}

        {/* Neighborhood City Picker - shown when message has neighborhood-city-picker CTA */}
        {hasNeighborhoodCityPickerCta && showNeighborhoodCityPicker && !isUser && (
          <div className="space-y-3">
            {message.content && (
              <div className="bg-white border border-stone-100 text-stone-700 rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
                <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
              </div>
            )}
            <div className="bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] rounded-2xl p-4">
              <ChatNeighborhoodCityPicker
                onCitySelect={onNeighborhoodCitySelect || (() => {})}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main chat messages container
interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
  hasContactInfo?: boolean;
  isMortgageCalculating?: boolean;
  isGated?: boolean; // Hide tool discovery widgets when gated
  onCitySelect?: (city: CityMatch, maxPrice: number) => void;
  onSearchAll?: (maxPrice: number) => void;
  onToolSelect?: (prompt: string) => void;
  onMortgageUnlock?: (contact: { name: string; phone: string; email?: string }, maxPrice: number) => void;
  onMortgageInput?: (data: { annualIncome: number; downPayment: number; monthlyDebts: number }) => void;
  /** Callback when user selects a city from mortgage card picker */
  onMortgageCitySelect?: (citySlug: string, cityName: string, maxPrice: number) => void;
  /** Callback when user clicks "Search All GTA" from mortgage card picker */
  onMortgageSearchAll?: (maxPrice: number) => void;
  /** Callback when user skips the mortgage card unlock */
  onMortgageSkip?: () => void;
  /** Number of skips remaining for mortgage card (if 0, skip button is hidden) */
  mortgageRemainingSkips?: number;
  /** Ref to attach to the mortgage card for scrolling */
  mortgageCardRef?: React.RefObject<HTMLDivElement | null>;
  /** Callback when user unlocks neighborhood card */
  onNeighborhoodUnlock?: (contact: { name: string; phone: string; email?: string }, city: string) => void;
  /** Callback when user skips neighborhood unlock */
  onNeighborhoodSkip?: () => void;
  /** Number of skips remaining for neighborhood card (if 0, skip button is hidden) */
  neighborhoodRemainingSkips?: number;
  /** Callback when user clicks "Search Properties in {City}" on neighborhood card */
  onSearchPropertiesFromNeighborhood?: (city: string, maxPrice?: number) => void;
  /** Callback when user clicks a neighborhood chip */
  onNeighborhoodClick?: (neighborhood: string, city: string) => void;
  /** Callback when user unlocks first-time buyer card */
  onFirstTimeBuyerUnlock?: (contact: { name: string; phone: string; email?: string }) => void;
  /** Callback when user skips first-time buyer unlock */
  onFirstTimeBuyerSkip?: () => void;
  /** Number of skips remaining for first-time buyer card (if 0, skip button is hidden) */
  firstTimeBuyerRemainingSkips?: number;
  /** Callback when user clicks mortgage calculator from first-time buyer card */
  onMortgageCalculatorFromFTB?: () => void;
  /** Callback when user clicks a related topic on first-time buyer card */
  onRelatedTopicClick?: (topic: string) => void;
  /** Ref to attach to the latest message for scrolling */
  latestMessageRef?: React.RefObject<HTMLDivElement | null>;
  /** Callback when user selects a city from the neighborhood city picker */
  onNeighborhoodCitySelect?: (cityName: string) => void;
}

export function ChatMessages({ messages, isLoading, hasContactInfo, isMortgageCalculating, isGated, latestMessageRef, onCitySelect, onSearchAll, onToolSelect, onMortgageUnlock, onMortgageInput, onMortgageCitySelect, onMortgageSearchAll, onMortgageSkip, mortgageRemainingSkips, mortgageCardRef, onNeighborhoodUnlock, onNeighborhoodSkip, neighborhoodRemainingSkips, onSearchPropertiesFromNeighborhood, onNeighborhoodClick, onFirstTimeBuyerUnlock, onFirstTimeBuyerSkip, firstTimeBuyerRemainingSkips, onMortgageCalculatorFromFTB, onRelatedTopicClick, onNeighborhoodCitySelect }: ChatMessagesProps) {
  // Helper to find last index matching a predicate
  function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (predicate(arr[i])) return i;
    }
    return -1;
  }

  const latestCitySearchIndex = findLastIndex(messages, m => m.cta?.type === 'city-search-prompt');
  const latestMortgageInputIndex = findLastIndex(messages, m => m.cta?.type === 'mortgage-input-form');
  const latestMortgageDataIndex = findLastIndex(messages, m => m.toolResult?.type === 'mortgageEstimate');
  const latestNeighborhoodCityPickerIndex = findLastIndex(messages, m => m.cta?.type === 'neighborhood-city-picker');

  return (
    <>
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLatest={index === messages.length - 1}
          showCitySearch={index === latestCitySearchIndex}
          showMortgageInput={index === latestMortgageInputIndex}
          showNeighborhoodCityPicker={index === latestNeighborhoodCityPickerIndex}
          hasContactInfo={hasContactInfo}
          isMortgageCalculating={isMortgageCalculating}
          isGated={isGated}
          onCitySelect={onCitySelect}
          onSearchAll={onSearchAll}
          onToolSelect={onToolSelect}
          onMortgageUnlock={onMortgageUnlock}
          onMortgageInput={onMortgageInput}
          onMortgageCitySelect={onMortgageCitySelect}
          onMortgageSearchAll={onMortgageSearchAll}
          onMortgageSkip={onMortgageSkip}
          mortgageRemainingSkips={mortgageRemainingSkips}
          mortgageCardRef={index === latestMortgageDataIndex ? mortgageCardRef : undefined}
          onNeighborhoodUnlock={onNeighborhoodUnlock}
          onNeighborhoodSkip={onNeighborhoodSkip}
          neighborhoodRemainingSkips={neighborhoodRemainingSkips}
          onSearchPropertiesFromNeighborhood={onSearchPropertiesFromNeighborhood}
          onNeighborhoodClick={onNeighborhoodClick}
          onFirstTimeBuyerUnlock={onFirstTimeBuyerUnlock}
          onFirstTimeBuyerSkip={onFirstTimeBuyerSkip}
          firstTimeBuyerRemainingSkips={firstTimeBuyerRemainingSkips}
          onMortgageCalculatorFromFTB={onMortgageCalculatorFromFTB}
          onRelatedTopicClick={onRelatedTopicClick}
          latestMessageRef={index === messages.length - 1 ? latestMessageRef : undefined}
          onNeighborhoodCitySelect={onNeighborhoodCitySelect}
        />
      ))}
      {isLoading && <TypingIndicator />}
    </>
  );
}
