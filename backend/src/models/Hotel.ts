import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface IHotel extends Document {
  slug: string;
  name: any;
  description: any;
  images: string[];
  pricePerNight: number;
  stars: number;
  location: string;
  address: string;
  amenities: string[];
  isActive: boolean;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEnd?: Date;
  createdAt: Date;
}

const hotelSchema = new Schema<IHotel>({
  slug: { type: String, required: true, unique: true },
  name: i18nSchema,
  description: i18nSchema,
  images: [{ type: String }],
  pricePerNight: { type: Number, required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  location: { type: String, required: true },
  address: { type: String, required: true },
  amenities: [{ type: String }],
  isActive: { type: Boolean, default: true },
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: { type: Number },
  flashSaleEnd: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IHotel>('Hotel', hotelSchema);
