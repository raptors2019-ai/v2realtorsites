import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  // Optional tool result data for rich rendering
  toolResult?: {
    type: "propertySearch";
    data: unknown;
  };
}

export interface UserPreferences {
  leadType?: "buyer" | "seller" | "investor" | "general";
  budget?: { min?: number; max?: number };
  propertyType?: "detached" | "semi-detached" | "townhouse" | "condo";
  bedrooms?: number;
  bathrooms?: number;
  locations?: string[];
  timeline?: "immediate" | "3-months" | "6-months" | "12-months" | "just-browsing";
  preApproved?: boolean;
  capturedAt?: string;
}

export interface ViewedProperty {
  listingId: string;
  address: string;
  price: number;
  viewedAt: string;
  source: "chatbot" | "browse";
}

interface ChatbotState {
  // Session
  sessionId: string | null;

  // UI state
  isOpen: boolean;
  isPromptVisible: boolean;
  isLoading: boolean;

  // Messages (not persisted - privacy)
  messages: Message[];

  // Persisted preferences
  preferences: UserPreferences;
  viewedProperties: ViewedProperty[];

  // Contact sync (phone is primary identifier)
  contactId: string | null;
  phone: string | null; // Primary identifier - more valuable than email
  email: string | null; // Optional secondary identifier

  // Actions
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  dismissPrompt: () => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;

  // Preference actions
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  clearPreferences: () => void;
  addViewedProperty: (property: ViewedProperty) => void;

  // Session actions
  setSessionId: (id: string) => void;
  setContactId: (id: string, phone: string, email?: string) => void;
  clearSession: () => void;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm here to help you find your perfect home. What can I assist you with today?",
  timestamp: new Date(),
};

export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set) => ({
      // Initial state
      sessionId: null,
      isOpen: false,
      isPromptVisible: true,
      isLoading: false,
      messages: [INITIAL_MESSAGE],
      preferences: {},
      viewedProperties: [],
      contactId: null,
      phone: null, // Primary identifier
      email: null, // Optional secondary

      // UI actions
      setOpen: (open) => set({ isOpen: open }),

      toggleOpen: () =>
        set((state) => ({
          isOpen: !state.isOpen,
          isPromptVisible: false,
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

      // Preference actions
      updatePreferences: (prefs) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...prefs,
            capturedAt: prefs.capturedAt || new Date().toISOString(),
          },
        })),

      clearPreferences: () => set({ preferences: {}, viewedProperties: [] }),

      addViewedProperty: (property) =>
        set((state) => {
          // Deduplicate by listingId
          const existing = state.viewedProperties.filter(
            (p) => p.listingId !== property.listingId
          );
          return {
            viewedProperties: [...existing, property].slice(-20), // Keep last 20
          };
        }),

      // Session actions
      setSessionId: (id) => set({ sessionId: id }),

      setContactId: (id, phone, email) =>
        set({ contactId: id, phone, email: email || null }),

      clearSession: () =>
        set({
          sessionId: null,
          contactId: null,
          phone: null,
          email: null,
          preferences: {},
          viewedProperties: [],
          messages: [INITIAL_MESSAGE],
        }),
    }),
    {
      name: "sri-chatbot-storage",
      storage: createJSONStorage(() => localStorage),

      // Only persist these fields (not messages for privacy)
      partialize: (state) => ({
        sessionId: state.sessionId,
        preferences: state.preferences,
        viewedProperties: state.viewedProperties,
        contactId: state.contactId,
        phone: state.phone, // Primary identifier
        email: state.email, // Optional secondary
        isPromptVisible: state.isPromptVisible,
      }),

      // Skip hydration for SSR
      skipHydration: true,
    }
  )
);
