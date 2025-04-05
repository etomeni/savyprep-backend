import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  description: string;
  specifications: string;
  quantity: number;
  status: "Review" | "Processing" | "Completed";
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true },
    description: { type: String, required: true },
    specifications: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: ["Review", "Processing", "Completed"], default: "Review" }
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
