import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  jokeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  text: string;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  jokeId: { type: Schema.Types.ObjectId, ref: 'Joke', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IComment>('Comment', CommentSchema);
