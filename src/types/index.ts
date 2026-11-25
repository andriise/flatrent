export type Role = "USER" | "OWNER" | "ADMIN";
export type ListingStatus = "ACTIVE" | "PENDING" | "REJECTED" | "FLAGGED";
export type SubscriptionPlan = "FREE" | "MONTHLY" | "PREMIUM";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  trustScore: number;
}

export interface Photo {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  active: boolean;
  startedAt: string;
  endsAt?: string | null;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  district: string;
  address: string;
  rooms: number;
  area: number;
  floor: number;
  totalFloors: number;
  isFurnished: boolean;
  petsAllowed: boolean;
  street?: string | null;
  houseNumber?: string | null;
  propertyType: string;
  condition?: string | null;
  buildingType?: string | null;
  furniture: string;
  minRentPeriod?: string | null;
  childrenAllowed: boolean;
  contactMethods: string[];
  status: ListingStatus;
  trustScore: number;
  owner: User;
  photos: Photo[];
  amenities: Amenity[];
  createdAt: string;
}

export interface SearchFilters {
  q?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  minArea?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  verifiedOnly?: boolean;
  balcony?: boolean;
  notFirstFloor?: boolean;
  notLastFloor?: boolean;
}

export const DISTRICTS = [
  "Центр",
  "Вишенька",
  "Замостя",
  "Пирогово",
  "Старе місто",
  "Поділля",
  "Слов'янка",
  "Тяжилів",
] as const;

export const PLAN_INFO = {
  FREE: {
    label: "Безкоштовний",
    price: 0,
    contactLimit: 3,
    listingLimit: 3,
  },
  MONTHLY: {
    label: "Місячний",
    price: 199,
    contactLimit: 100,
    listingLimit: 10,
  },
  PREMIUM: {
    label: "Преміум",
    price: 399,
    contactLimit: 300,
    listingLimit: 30,
  },
} as const;
