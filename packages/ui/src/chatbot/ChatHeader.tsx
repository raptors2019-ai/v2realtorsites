"use client";

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  avatarInitials?: string;
  onMinimize: () => void;
  onClose: () => void;
}

export function ChatHeader({
  title = "Sri Collective Group",
  subtitle = "Online now",
  avatarInitials = "SC",
  onMinimize,
  onClose,
}: ChatHeaderProps) {
  return (
    <div className="relative bg-[#1a2332] text-white px-5 py-4 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#c9a962] flex items-center justify-center shadow-md">
            <span className="text-white text-sm font-bold">{avatarInitials}</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="text-xs text-white/70">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Minimize button */}
          <button
            onClick={onMinimize}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Minimize chat"
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
                d="M18 12H6"
              />
            </svg>
          </button>
          {/* Close button */}
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1"
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
    </div>
  );
}
