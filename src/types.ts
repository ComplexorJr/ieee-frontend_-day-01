export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

export interface Step {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billing: string;
  description: string;
  features: string[];
  isPopular: boolean;
  ctaText: string;
}

export interface WaitlistSubmission {
  name: string;
  email: string;
  teamSize: string;
  role: string;
  submittedAt: string;
  queueNumber: number;
}
