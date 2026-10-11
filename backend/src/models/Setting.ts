import mongoose, { Document, Schema } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
  group: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

settingSchema.index({ key: 1, group: 1 });
settingSchema.index({ group: 1 });

export default mongoose.model<ISetting>('Setting', settingSchema);
