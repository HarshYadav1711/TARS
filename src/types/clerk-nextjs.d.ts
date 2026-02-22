/// <reference types="react" />

declare module "@clerk/nextjs" {
  export function useAuth(): {
    getToken: (options?: {
      template?: "convex" | string;
      skipCache?: boolean;
    }) => Promise<string | null>;
    isLoaded: boolean;
    isSignedIn: boolean | undefined;
    orgId: string | undefined | null;
    orgRole: string | undefined | null;
  };
  export const ClerkProvider: React.ComponentType<{
    children?: React.ReactNode;
    publishableKey?: string;
    jwtTemplate?: string;
  }>;
  export function useUser(): {
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      fullName?: string | null;
      imageUrl: string;
      emailAddresses: unknown[];
      primaryEmailAddress?: { emailAddress: string } | null;
    } | null | undefined;
    isLoaded: boolean;
  };
  export const UserButton: React.ComponentType<Record<string, unknown>>;
  export const SignIn: React.ComponentType<Record<string, unknown>>;
  export const SignUp: React.ComponentType<Record<string, unknown>>;
  export const SignedIn: React.ComponentType<{ children: React.ReactNode }>;
  export const SignedOut: React.ComponentType<{ children: React.ReactNode }>;
  export function clerkMiddleware(
    ...args: unknown[]
  ): (req: unknown, event: unknown) => unknown;
}
