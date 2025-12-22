export interface BuyerPreferences {
  budget?: {
    min?: number;
    max?: number;
    range?: string;
  };
  propertyType?: 'detached' | 'semi-detached' | 'townhouse' | 'condo';
  bedrooms?: number;
  bathrooms?: number;
  locations?: string[];
  timeline?: 'immediate' | '3-months' | '6-months' | '12-months' | 'just-browsing';
  preApproved?: boolean;
  firstTimeBuyer?: boolean;
  mustHaves?: string[];
}

export interface SellerPreferences {
  propertyAddress?: string;
  propertyType?: string;
  reasonForSelling?: string;
  timeline?: string;
  expectedPrice?: number;
  currentMortgageStatus?: 'paid-off' | 'has-mortgage' | 'unknown';
}

export interface InvestorPreferences {
  investmentBudget?: number;
  investmentType?: 'rental' | 'flip' | 'commercial' | 'land';
  preferredAreas?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
}

export interface Contact {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified?: boolean;
  phone?: string;
  cellPhone?: string;
  phoneVerified?: boolean;
  phoneType?: 'mobile' | 'landline' | 'voip' | 'unknown';

  source: 'newhomeshow' | 'sri-collective' | 'chatbot';
  leadType: 'buyer' | 'seller' | 'investor' | 'general';
  leadQuality?: 'hot' | 'warm' | 'cold' | 'unqualified';

  buyerPreferences?: BuyerPreferences;
  sellerPreferences?: SellerPreferences;
  investorPreferences?: InvestorPreferences;

  urgencyFactors?: string[];
  message?: string;
  conversationId?: string;

  timestamp: Date;
  lastEngagement?: Date;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export type LeadType = Contact['leadType'];
export type LeadQuality = NonNullable<Contact['leadQuality']>;
