import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash?: string;
  googleId?: string;
  xp: number;
  level: number;
  achievements: string[];
  favorites: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  achievements: { type: [String], default: [] },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Joke' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
