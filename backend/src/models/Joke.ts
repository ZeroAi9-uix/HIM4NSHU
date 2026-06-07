import mongoose, { Schema, Document } from 'mongoose';

export interface IJoke extends Document {
  text?: string;
  setup?: string;
  punchline?: string;
  category: 'dark' | 'funny' | 'lame' | 'romance' | 'roast' | 'general';
  isQuiz: boolean;
  creator: 'AI' | 'user';
  userId?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  dislikes: mongoose.Types.ObjectId[];
  commentsCount: number;
  createdAt: Date;
}

const JokeSchema: Schema = new Schema({
  text: { type: String },
  setup: { type: String },
  punchline: { type: String },
  category: { 
    type: String, 
    enum: ['dark', 'funny', 'lame', 'romance', 'roast', 'general'], 
    required: true 
  },
  isQuiz: { type: Boolean, default: false },
  creator: { type: String, enum: ['AI', 'user'], default: 'AI' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  commentsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IJoke>('Joke', JokeSchema);
