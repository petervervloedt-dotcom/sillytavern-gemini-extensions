
export type Role = 'user' | 'model' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'voice';
  mediaUrl?: string;
}

export interface LoreEntry {
  keys: string[];
  content: string;
  name: string;
}

export type ExtensionTab = 'vision' | 'lore' | 'brainstorm' | 'settings';
