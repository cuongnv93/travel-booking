export interface I18nText {
  vi: string;
  en: string;
  zh: string;
  ko: string;
  ja: string;
}

export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface Tour {
  _id?: string;
  id: string;
  slug: string;
  title: I18nText | string;
  description: I18nText | string;
  images: string[];
  price: number;
  originalPrice?: number;
  duration: string | number;
  destination: string;
  highlights: any[];
  itinerary: any[];
  rating: number;
  reviewCount: number;
  maxGuests: number;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
}

export interface Booking {
  _id?: string;
  id: string;
  bookingCode: string;
  userId: string;
  tourId?: string;
  hotelId?: string;
  flightId?: string;
  tour?: Tour;
  hotel?: Hotel;
  flight?: any;
  type: 'tour' | 'hotel' | 'flight';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  travelDate: string;
  guests: {
    adults: number;
    children: number;
  };
  rooms?: number;
  totalPrice: number;
  discount?: number;
  couponCode?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
  };
  createdAt: string;
}

export interface CartItem {
  type: 'tour' | 'hotel' | 'flight';
  itemData: any; // The Tour, Hotel, or Flight object
  travelDate: string; // or checkIn for hotel, departureDate for flight
  checkOut?: string; // for hotels
  guests: {
    adults: number;
    children: number;
  };
  rooms?: number;
  totalPrice: number;
}

export interface News {
  _id?: string;
  id: string;
  slug: string;
  title: I18nText | string;
  content: I18nText | string;
  excerpt: I18nText | string;
  thumbnail: string;
  category: string;
  author: string;
  isPublished?: boolean;
  publishedAt?: string;
}

export interface Hotel {
  _id?: string;
  id: string;
  name: I18nText | string;
  location: string;
}

export interface Specialty {
  _id?: string;
  id: string;
  name: I18nText | string;
}

export interface Page {
  id: string;
  slug: string;
}

export interface Setting {
  key: string;
  value: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
