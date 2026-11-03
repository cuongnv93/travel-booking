import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  bookingCode: string;
  userId: mongoose.Types.ObjectId;
  tourId?: mongoose.Types.ObjectId;
  hotelId?: mongoose.Types.ObjectId;
  flightId?: mongoose.Types.ObjectId;
  type: 'tour' | 'hotel' | 'flight';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  travelDate: Date;
  checkIn?: Date;
  checkOut?: Date;
  roomName?: string;
  guests: {
    adults: number;
    children: number;
  };
  rooms?: number;
  totalPrice: number;
  discount?: number;
  couponCode?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    notes?: string;
  };
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  bookingCode: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour' },
  hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel' },
  flightId: { type: Schema.Types.ObjectId, ref: 'Flight' },
  type: { type: String, enum: ['tour', 'hotel', 'flight'], default: 'tour', index: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending', index: true },
  travelDate: { type: Date },
  checkIn: { type: Date },
  checkOut: { type: Date },
  roomName: { type: String, trim: true },
  guests: {
    adults: { type: Number, default: 1, min: 1 },
    children: { type: Number, default: 0, min: 0 }
  },
  rooms: { type: Number, default: 1, min: 1 },
  totalPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  couponCode: { type: String, trim: true, uppercase: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending', index: true },
  customerInfo: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    notes: { type: String, trim: true }
  },
  createdAt: { type: Date, default: Date.now, index: true }
});

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ type: 1, status: 1, createdAt: -1 });

export default mongoose.model<IBooking>('Booking', bookingSchema);
