import mongoose, { Document, Schema } from 'mongoose';

export interface IFlight extends Document {
  airline: string;
  logo: string;
  flightNumber: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  isAvailable: boolean;
  createdAt: Date;
}

const flightSchema = new Schema<IFlight>({
  airline: { type: String, required: true },
  logo: { type: String, default: 'VN' },
  flightNumber: { type: String, required: true, unique: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, default: '2h 15m' },
  price: { type: Number, required: true },
  availableSeats: { type: Number, default: 100 },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFlight>('Flight', flightSchema);
