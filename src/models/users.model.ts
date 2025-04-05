import mongoose, { Schema } from 'mongoose';
import validator from 'validator';

export interface userInterface extends Document {
    _id: string;
    fullName: string;
    // lastName: string;
    email: string;
    password: string;
    role:  'user' | 'admin' | 'super admin' | 'moderator' | 'editor' | 'support';
	plan: "free" | "standard" | "premium";
	status: false,
    location: any,
}

const userSchema = new Schema<userInterface>(
    {
        fullName: {
            type: String,
            required: true,
            max: 255,
        },

        role: { 
            type: String, 
            enum: ['user', 'admin', 'super admin', 'moderator', 'editor', 'support'], 
            default: 'user' 
        }, // Added role field

        email: {
            type: String,
            required: [true, "Please enter the user email adddress."],
            max: 255,

            unique: true,
            lowercase: true,
            validate: {
              validator: (v: string) => validator.isEmail(v),
              message: ({ value }) => `${value} is not a valid email`,
            },
        },

        plan: {
            type: String,
            enum: ['free', 'standard', 'premium'],
            default: 'free'
        },

        status: {
            type: Boolean,
            default: false
        },

        password: {
            type: String,
            required: [true, "User password required."]
        },
        location: { type: Object }
    },
    { timestamps: true }
);

export const userModel = mongoose.model("User", userSchema);
