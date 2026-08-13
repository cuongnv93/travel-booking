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
  bookingCode: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour' },
  hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel' },
  flightId: { type: Schema.Types.ObjectId, ref: 'Flight' },
  type: { type: String, enum: ['tour', 'hotel', 'flight'], default: 'tour' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  travelDate: { type: Date },
  checkIn: { type: Date },
  checkOut: { type: Date },
  guests: {
    adults: { type: Number, default: 1 },
    children: { type: Number, default: 0 }
  },
  rooms: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  couponCode: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    notes: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IBooking>('Booking', bookingSchema);
