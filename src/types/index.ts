export type LeadStatus = 'hot' | 'followup' | 'won' | 'none';

export interface ChatMessage {
  id: string;
  sender: 'Customer' | 'Merchant';
  text: string;
  timestamp: string;
  isIncoming: boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  leadStatus: LeadStatus;
  messages: ChatMessage[];
  businessCategory: string;
  suggestedPrompt: string;
}

export interface DealReply {
  type: 'Persuasive' | 'Direct' | 'Urgent';
  short_label: string;
  text: string;
}

export interface GenerateDealResponseResult {
  success: boolean;
  deal_state?: 'CLOSING' | 'OBJECTION' | 'DISCOVERY' | 'LOGISTICS';
  objection_detected: string;
  replies: DealReply[];
  credits_remaining: number;
  is_pro: boolean;
  consumed: number;
}
