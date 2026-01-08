"use client";

import { forwardRef } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  function ChatInput(
    {
      value,
      onChange,
      onSubmit,
      disabled = false,
      placeholder = "Type your message...",
    },
    ref
  ) {
    return (
      <form onSubmit={onSubmit} className="p-5 border-t border-gray-200 bg-white shrink-0">
        <div className="flex gap-2">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:outline-none focus:border-gray-300 focus:bg-white disabled:opacity-50 placeholder-gray-400 transition-all"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
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
    );
  }
);
