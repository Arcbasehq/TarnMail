export type Attachment = {
  id: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
};

export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  to?: string;
  body: string;
  html?: string;
  listUnsubscribe?: string;
  createdAt: string;
  attachments: Attachment[];
};

export type Conversation = {
  id: string;
  subject: string;
  participants: string[];
  lastMessageAt: string;
  preview: string;
  unread: boolean;
};
