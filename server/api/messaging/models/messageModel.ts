import mongoose, { type Document, Schema } from 'mongoose'

interface IReply extends Document {
  replyToMessageId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  textContent: string
  createdAt: Date
  updatedAt: Date
}

const replySchema = new Schema<IReply>({
  replyToMessageId: mongoose.Types.ObjectId,
  senderId: mongoose.Types.ObjectId,
  textContent: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  textContent: string
  replies: IReply[]
  createdAt: Date
  updatedAt: Date
}

const messageSchema = new Schema<IMessage>({
  conversationId: mongoose.Types.ObjectId,
  senderId: mongoose.Types.ObjectId,
  textContent: String,
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const Message = mongoose.model<IMessage>('Message', messageSchema)
