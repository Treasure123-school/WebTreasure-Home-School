// shared/types.ts (frontend-safe, no backend imports)
export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
