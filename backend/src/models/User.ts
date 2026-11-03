import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: { type: String, select: false },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user', index: true },
  avatar: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.index({ createdAt: -1 });

export default mongoose.model<IUser>('User', userSchema);
