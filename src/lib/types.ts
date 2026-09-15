export type UserRole = 'CHEF' | 'SIRKEL' | 'MALAZZ';

export interface UserSession {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  role: UserRole;
}

export type AnnouncementCategory = 'PENTING' | 'TURNAMEN' | 'UPDATE' | 'SANTAI';

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  isPinned: boolean;
  authorId: string;
  author: {
    username: string;
    displayName: string | null;
    role: UserRole;
    avatar: string | null;
  };
  createdAt: string | Date;
  updatedAt?: string | Date;
}

