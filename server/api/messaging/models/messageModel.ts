// server/api/messaging/models/messageModel.ts

import mongoose, { type Document, Schema } from 'mongoose'

interface IMetadata extends Document {
  isSystemGenerated: boolean
  priority: string
  tags: string[]
}

interface IMedia extends Document {
  type: string
  url: string
  caption: string
}

interface IAttachment extends Document {
  filename: string
  url: string
  contentType: string
  size: number
}

interface IReaction extends Document {
  type: string
  userId: mongoose.Types.ObjectId
}

interface IReadReceipt extends Document {
  userId: mongoose.Types.ObjectId
  readAt: Date
}

interface IForwardingInfo extends Document {
  originalMessageId: mongoose.Types.ObjectId
  forwardedByUserId: mongoose.Types.ObjectId
  forwardedAt: Date
}

interface IEditHistory extends Document {
  editedAt: Date
  previousTextContent: string
}

interface IMention extends Document {
  mentionedUserId: mongoose.Types.ObjectId
  mentionedAt: Date
}

interface IReply extends Document {
  replyToMessageId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  textContent: string
  createdAt: Date
  updatedAt: Date
}

interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  textContent: string
  replies: IReply[]
  metadata: IMetadata
  media: IMedia[]
  attachments: IAttachment[]
  reactions: IReaction[]
  readReceipts: IReadReceipt[]
  forwardingInfo: IForwardingInfo
  editHistory: IEditHistory[]
  mentions: IMention[]
  createdAt: Date
  updatedAt: Date
}

const metadataSchema = new Schema<IMetadata>({
  isSystemGenerated: Boolean,
  priority: String,
  tags: [String]
})

const mediaSchema = new Schema<IMedia>({
  type: String,
  url: String,
  caption: String
})

const attachmentSchema = new Schema<IAttachment>({
  filename: String,
  url: String,
  contentType: String,
  size: Number
})

const reactionSchema = new Schema<IReaction>({
  type: String,
  userId: mongoose.Types.ObjectId
})

const readReceiptSchema = new Schema<IReadReceipt>({
  userId: mongoose.Types.ObjectId,
  readAt: Date
})

const forwardingInfoSchema = new Schema<IForwardingInfo>({
  originalMessageId: mongoose.Types.ObjectId,
  forwardedByUserId: mongoose.Types.ObjectId,
  forwardedAt: Date
})

const editHistorySchema = new Schema<IEditHistory>({
  editedAt: Date,
  previousTextContent: String
})

const mentionSchema = new Schema<IMention>({
  mentionedUserId: mongoose.Types.ObjectId,
  mentionedAt: Date
})

const replySchema = new Schema<IReply>({
  replyToMessageId: mongoose.Types.ObjectId,
  senderId: mongoose.Types.ObjectId,
  textContent: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

const messageSchema = new Schema<IMessage>({
  conversationId: mongoose.Types.ObjectId,
  senderId: mongoose.Types.ObjectId,
  textContent: String,
  replies: [replySchema],
  metadata: metadataSchema,
  media: [mediaSchema],
  attachments: [attachmentSchema],
  reactions: [reactionSchema],
  readReceipts: [readReceiptSchema],
  forwardingInfo: forwardingInfoSchema,
  editHistory: [editHistorySchema],
  mentions: [mentionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export const Message = mongoose.model<IMessage>('Message', messageSchema)
