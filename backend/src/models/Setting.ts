import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
  group: string;
  createdAt: Date;
}

const settingSchema = new Schema<ISetting>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  group: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ISetting>('Setting', settingSchema);
