/**
 * Stub: run `npx convex dev` to generate the real API.
 * This file allows the Next.js app to build before Convex is linked.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const api = {
  users: {
    updateOrCreate: undefined as any,
    list: undefined as any,
    listExceptCurrent: undefined as any,
    getCurrent: undefined as any,
  },
  conversations: {
    getOrCreate: undefined as any,
    get: undefined as any,
    getWithOtherUser: undefined as any,
    listForCurrentUser: undefined as any,
  },
  messages: {
    send: undefined as any,
    list: undefined as any,
  },
};
