import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface ISpecialty extends Document {
  slug: string;
  name: any;
  description: any;
  image: string;
  price: number;
  region: string;
  isActive: boolean;
  createdAt: Date;
}

const specialtySchema = new Schema<ISpecialty>({
  slug: { type: String, required: true, unique: true },
  name: i18nSchema,
  description: i18nSchema,
  image: { type: String, required: true },
  price: { type: Number, required: true },
  region: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISpecialty>('Specialty', specialtySchema);
