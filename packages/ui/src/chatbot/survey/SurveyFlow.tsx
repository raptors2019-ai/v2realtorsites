"use client";

import { PropertyTypeStep } from "./steps/PropertyTypeStep";
import { BudgetStep } from "./steps/BudgetStep";
import { BedroomsStep } from "./steps/BedroomsStep";
import { TimelineStep } from "./steps/TimelineStep";
import { LocationStep } from "./steps/LocationStep";
import { ListingsDisplayStep } from "./steps/ListingsDisplayStep";
import { ContactInfoStep } from "./steps/ContactInfoStep";
import { SoftAskStep } from "./steps/SoftAskStep";
import { HardGateStep } from "./steps/HardGateStep";

// Property listing type for the listings display
interface PropertyListing {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  address: string;
  image?: string;
}

// Survey step types
export type SurveyStepType =
  | "idle"
  | "property-type"
  | "budget"
  | "bedrooms"
  | "timeline"
  | "location"
  | "show-listings"
  | "contact-info"
  | "soft-ask"
  | "hard-gate"
  | "complete";

export type SurveyType = "dream-home" | "general-contact";

// Survey state interface
export interface SurveyState {
  step: SurveyStepType;
  type?: SurveyType;
  propertyType?: string;
  budget?: string;
  bedrooms?: string;
  timeline?: string;
  locations?: string[];
  matchingListings?: PropertyListing[];
  firstName?: string;
  email?: string;
  phone?: string;
}

interface SurveyFlowProps {
  step: SurveyStepType;
  surveyType?: SurveyType;
  matchingListings?: PropertyListing[];
  onPropertyType: (type: string) => void;
  onBudget: (budget: string) => void;
  onBedrooms: (bedrooms: string) => void;
  onTimeline: (timeline: string) => void;
  onLocation: (locations: string[]) => void;
  onShowListingsContinue: () => void;
  onContactSubmit: (contact: { fullName: string; phone: string; email?: string }) => void;
  // Lead gate handlers
  onSoftAskSubmit?: (contact: { fullName: string; phone: string; email?: string }) => void;
  onSoftAskSkip?: () => void;
  onHardGateSubmit?: (contact: { fullName: string; phone: string; email?: string }) => void;
}

export function SurveyFlow({
  step,
  surveyType,
  matchingListings,
  onPropertyType,
  onBudget,
  onBedrooms,
  onTimeline,
  onLocation,
  onShowListingsContinue,
  onContactSubmit,
  onSoftAskSubmit,
  onSoftAskSkip,
  onHardGateSubmit,
}: SurveyFlowProps) {
  // Don't render anything if step is idle or complete
  if (step === "idle" || step === "complete") {
    return null;
  }

  return (
    <div className="mb-4 p-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
      {step === "property-type" && (
        <PropertyTypeStep onSelect={onPropertyType} />
      )}
      {step === "budget" && (
        <BudgetStep onSelect={onBudget} />
      )}
      {step === "bedrooms" && (
        <BedroomsStep onSelect={onBedrooms} />
      )}
      {step === "timeline" && (
        <TimelineStep onSelect={onTimeline} />
      )}
      {step === "location" && (
        <LocationStep onSelect={onLocation} />
      )}
      {step === "show-listings" && matchingListings && (
        <ListingsDisplayStep
          listings={matchingListings}
          onContinue={onShowListingsContinue}
        />
      )}
      {step === "contact-info" && (
        <ContactInfoStep
          onSubmit={onContactSubmit}
          surveyType={surveyType}
        />
      )}
      {step === "soft-ask" && onSoftAskSubmit && onSoftAskSkip && (
        <SoftAskStep
          onSubmit={onSoftAskSubmit}
          onSkip={onSoftAskSkip}
        />
      )}
      {step === "hard-gate" && onHardGateSubmit && (
        <HardGateStep
          onSubmit={onHardGateSubmit}
        />
      )}
    </div>
  );
}
