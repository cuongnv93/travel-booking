import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface IRoom {
  _id?: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  capacity: { adults: number; children: number };
  size: number; // in square meters
  bedType: string;
  amenities: string[];
  images: string[];
}

export interface IHotel extends Document {
  slug: string;
  name: any;
  description: any;
  images: string[];
  pricePerNight: number; // Keep as "from price"
  stars: number;
  location: string;
  address: string;
  amenities: string[];
  rooms: IRoom[];
  policies: string[];
  locationDetails: {
    lat?: number;
    lng?: number;
    nearbyPlaces?: { name: string; distance: string }[];
  };
  isActive: boolean;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEnd?: Date;
  createdAt: Date;
}

const roomSchema = new Schema<IRoom>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  capacity: {
    adults: { type: Number, required: true, default: 2 },
    children: { type: Number, required: true, default: 0 },
  },
  size: { type: Number },
  bedType: { type: String },
  amenities: [{ type: String }],
  images: [{ type: String }],
});

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
  rooms: [roomSchema],
  policies: [{ type: String }],
  locationDetails: {
    lat: { type: Number },
    lng: { type: Number },
    nearbyPlaces: [{
      name: { type: String },
      distance: { type: String }
    }]
  },
  isActive: { type: Boolean, default: true },
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: { type: Number },
  flashSaleEnd: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IHotel>('Hotel', hotelSchema);
