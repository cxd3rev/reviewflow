export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        createdAt?: string;
      };
      userRow?: Record<string, unknown>;
      business?: Record<string, unknown> | null;
      businessRow?: Record<string, unknown> | null;
      entitlement?: Record<string, unknown>;
      supabaseAdmin?: unknown;
      supabase?: unknown;
    }
  }
}
