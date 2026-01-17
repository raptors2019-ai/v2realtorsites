'use client'

import Link from 'next/link'
import type { NavigationCTA } from './chatbot-store'

interface ChatNavigationCTAProps extends NavigationCTA {}

export function ChatNavigationCTA({
  url,
  title,
  description,
  buttonText,
  external,
}: ChatNavigationCTAProps) {
  const LinkComponent = external ? 'a' : Link
  const linkProps = external
    ? { href: url, target: '_blank', rel: 'noopener noreferrer' }
    : { href: url }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm overflow-hidden">
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-[#0a1628] to-[#1a2d4d]" />

      <div className="p-5">
        {/* Tool icon + title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0a1628] to-[#1a2d4d] flex items-center justify-center shadow-md">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
            {external && (
              <span className="text-xs text-slate-500">External link</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          {description}
        </p>

        {/* CTA Button */}
        <LinkComponent
          {...linkProps}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-[#0a1628] to-[#1a2d4d] text-white rounded-xl font-semibold text-sm hover:from-[#1a2d4d] hover:to-[#0a1628] transition-all duration-300 shadow-md hover:shadow-lg group"
        >
          {buttonText}
          <svg
            className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {external ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            )}
          </svg>
        </LinkComponent>
      </div>
    </div>
  )
}
