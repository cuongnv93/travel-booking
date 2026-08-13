import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface INews extends Document {
  slug: string;
  title: any;
  content: any;
  excerpt: any;
  thumbnail: string;
  category: string;
  author: string;
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
}

const newsSchema = new Schema<INews>({
  slug: { type: String, required: true, unique: true },
  title: i18nSchema,
  content: i18nSchema,
  excerpt: i18nSchema,
  thumbnail: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  isPublished: { type: Boolean, default: true },
  publishedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<INews>('News', newsSchema);
