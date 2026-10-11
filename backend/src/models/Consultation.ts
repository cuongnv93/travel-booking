import mongoose, { Document, Schema } from 'mongoose';

export interface IConsultation extends Document {
  name: string;
  phone: string;
  email?: string;
  country?: string;
  travelDate?: string;
  guests?: string | number;
  type: 'visa' | 'tour' | 'hotel' | 'general';
  notes?: string;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const consultationSchema = new Schema<IConsultation>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    country: { type: String, trim: true },
    travelDate: { type: String, trim: true },
    guests: { type: Schema.Types.Mixed },
    type: {
      type: String,
      enum: ['visa', 'tour', 'hotel', 'general'],
      default: 'visa',
      index: true,
    },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

consultationSchema.index({ createdAt: -1 });
consultationSchema.index({ status: 1, type: 1 });

export default mongoose.model<IConsultation>('Consultation', consultationSchema);
