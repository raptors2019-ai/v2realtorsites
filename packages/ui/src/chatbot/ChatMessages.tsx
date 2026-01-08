"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Message, MortgageEstimate, PropertySearchResult, CitySearchCallToAction } from "./chatbot-store";
import { ChatMortgageCard } from "./ChatMortgageCard";
import { ChatPropertyList } from "./ChatPropertyCard";
import { ChatCitySearch } from "./ChatCitySearch";
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
  onCitySelect?: (city: CityMatch, maxPrice: number) => void;
  onSearchAll?: (maxPrice: number) => void;
}

export function MessageBubble({ message, isLatest, showCitySearch, onCitySelect, onSearchAll }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const hasMortgageData = message.toolResult?.type === "mortgageEstimate";
  const hasPropertyData = message.toolResult?.type === "propertySearch";
  const hasToolData = hasMortgageData || hasPropertyData;

  // Check if this message has a city-search-prompt CTA
  const hasCitySearchCta = message.cta?.type === 'city-search-prompt';
  const hasUrlCta = message.cta && message.cta.type !== 'city-search-prompt';

  return (
    <div
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
          <div className="space-y-3">
            <ChatMortgageCard {...(message.toolResult!.data as MortgageEstimate)} />
            {message.content && (
              <div className="bg-white border border-stone-100 text-stone-700 rounded-2xl rounded-tl-none shadow-sm px-4 py-3">
                <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
              </div>
            )}
            {/* City Search CTA - show input UI if this is the latest message with city search prompt */}
            {hasCitySearchCta && showCitySearch && onCitySelect && onSearchAll && (
              <ChatCitySearch
                maxPrice={(message.cta as CitySearchCallToAction).maxPrice}
                onCitySelect={onCitySelect}
                onSearchAll={onSearchAll}
              />
            )}
            {/* URL CTA Button - fallback for standard CTAs */}
            {hasUrlCta && (
              <Link
                href={(message.cta as { url: string }).url}
                className="block w-full py-3 px-4 bg-gradient-to-r from-[#0a1628] to-[#1a2d4d] text-white text-center rounded-xl font-semibold text-sm hover:from-[#1a2d4d] hover:to-[#0a1628] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                {message.cta!.text}
              </Link>
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
          </div>
        )}

        {/* Regular message bubble */}
        {!hasToolData && (
          <div className={isUser ? "" : "bg-white border border-stone-100 text-stone-700 rounded-2xl rounded-tl-none shadow-sm px-4 py-3"}>
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
            ) : (
              <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
            )}
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
  onCitySelect?: (city: CityMatch, maxPrice: number) => void;
  onSearchAll?: (maxPrice: number) => void;
}

export function ChatMessages({ messages, isLoading, onCitySelect, onSearchAll }: ChatMessagesProps) {
  // Find the latest message with a city-search-prompt CTA (manual approach for ES5 compatibility)
  let latestCitySearchIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].cta?.type === 'city-search-prompt') {
      latestCitySearchIndex = i;
      break;
    }
  }

  return (
    <>
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLatest={index === messages.length - 1}
          showCitySearch={index === latestCitySearchIndex}
          onCitySelect={onCitySelect}
          onSearchAll={onSearchAll}
        />
      ))}
      {isLoading && <TypingIndicator />}
    </>
  );
}
