export type UserDetails = {
    id: number
    email: string
    password_hash: string
}

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    userId?: number | null;
    loggedIn?: boolean;
  }
}