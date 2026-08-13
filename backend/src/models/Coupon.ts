import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountAmount: number;
  isActive: boolean;
  validUntil: Date;
  usageLimit: number;
  currentUses: number;
  createdAt: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountAmount: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  validUntil: { type: Date, required: true },
  usageLimit: { type: Number, default: 0 }, // 0 means unlimited
  currentUses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICoupon>('Coupon', couponSchema);
