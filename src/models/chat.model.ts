import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  orderId: any;
  messages: { sender: string; content: string; timestamp: Date }[];
  closed: boolean;
  summary?: string;
}

const ChatSchema = new Schema<IChat>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    messages: [
      {
        sender: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    closed: { type: Boolean, default: false },
    summary: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", ChatSchema);
