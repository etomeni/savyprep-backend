import mongoose, { Schema } from 'mongoose';
// import validator from 'validator';

export type contactUsInterface = {
    _id: string;
    name: string;
    email: string;
    message: string;

    reply: contactReplyInterface[];

    status: "Pending" | "Seen" | "Replied";

    createdAt?: string;
    updatedAt?: string;
};

export type contactReplyInterface = {
    user_id: string;
    user_email: string;
    name: string;
    // replyTo?: string;
    message: string;
    date: string | any;
}


const contactReplySchema = {
    user_id: { type: String, required: true },
    user_email: { type: String, required: true },
    name: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now() },
};


const contactUsSchema = new Schema<contactUsInterface>(
    {
        name: {
            type: String,
            required: true,
            max: 255,
        },
        email: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },

        reply: {
            type: [contactReplySchema],
            required: false,
            default: []
        },
        status: {
            type: String,
            enum: ["Pending", "Seen", "Replied"],
            required: false,
            default: "Pending"
        },
    },
    { timestamps: true }
);
export const contactUsModel = mongoose.model("Contact", contactUsSchema);
