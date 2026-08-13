import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface ITour extends Document {
  slug: string;
  title: any;
  description: any;
  images: string[];
  price: number;
  originalPrice?: number;
  duration: number;
  destination: string;
  highlights: any[];
  itinerary: any[];
  departureDates: { date: Date; price: number; availableSlots: number }[];
  rating: number;
  reviewCount: number;
  maxGuests: number;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEnd?: Date;
  createdAt: Date;
}

const tourSchema = new Schema<ITour>({
  slug: { type: String, required: true, unique: true },
  title: i18nSchema,
  description: i18nSchema,
  images: [{ type: String }],
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  duration: { type: Number, required: true },
  destination: { type: String, required: true },
  highlights: [i18nSchema],
  itinerary: [{
    title: i18nSchema,
    description: i18nSchema
  }],
  departureDates: [{
    date: { type: Date },
    price: { type: Number },
    availableSlots: { type: Number, default: 20 }
  }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  maxGuests: { type: Number, required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: { type: Number },
  flashSaleEnd: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITour>('Tour', tourSchema);
