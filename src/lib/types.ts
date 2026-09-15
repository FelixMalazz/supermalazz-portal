export type UserRole = 'CHEF' | 'SIRKEL' | 'MALAZZ';

export interface UserSession {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  role: UserRole;
}

export interface CommentItem {
  id: string;
  content: string;
  authorId: string;
  author: {
    username: string;
    displayName: string | null;
    avatar: string | null;
    role: UserRole;
  };
  createdAt: string;
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  userIds: string[];
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
  comments?: CommentItem[];
  reactions?: ReactionGroup[];
  createdAt: string | Date;
  updatedAt?: string | Date;
}


