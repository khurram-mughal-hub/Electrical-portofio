import mongoose, { Schema } from 'mongoose'

export interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
}

const messageSchema = new Schema<ContactMessage>(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 80, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    subject: { type: String, required: true, minlength: 3, maxlength: 120, trim: true },
    message: { type: String, required: true, minlength: 10, maxlength: 2000, trim: true },
  },
  { timestamps: true, versionKey: false },
)

export const Message = mongoose.model<ContactMessage>('Message', messageSchema)
