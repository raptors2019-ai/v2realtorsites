import { create } from "zustand";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatbotState {
  isOpen: boolean;
  isPromptVisible: boolean;
  messages: Message[];
  isLoading: boolean;

  // Actions
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  dismissPrompt: () => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm here to help you find your perfect home. What can I assist you with today?",
  timestamp: new Date(),
};

export const useChatbotStore = create<ChatbotState>((set) => ({
  isOpen: false,
  isPromptVisible: true,
  messages: [INITIAL_MESSAGE],
  isLoading: false,

  setOpen: (open) => set({ isOpen: open }),

  toggleOpen: () => set((state) => ({
    isOpen: !state.isOpen,
    isPromptVisible: false, // Hide prompt when opening chat
  })),

  dismissPrompt: () => set({ isPromptVisible: false }),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: new Date(),
        },
      ],
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [INITIAL_MESSAGE] }),
}));
