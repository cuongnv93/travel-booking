import mongoose, { Document, Schema } from 'mongoose';

const i18nSchema = {
  vi: { type: String, required: true },
  en: { type: String, default: '' },
  zh: { type: String, default: '' },
  ko: { type: String, default: '' },
  ja: { type: String, default: '' }
};

export interface IPage extends Document {
  slug: string;
  title: any;
  content: any;
  metaDescription: any;
  isPublished: boolean;
  createdAt: Date;
}

const pageSchema = new Schema<IPage>({
  slug: { type: String, required: true, unique: true },
  title: i18nSchema,
  content: i18nSchema,
  metaDescription: i18nSchema,
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPage>('Page', pageSchema);
