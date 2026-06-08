import { handlers } from "@/auth";

// Auth.js mounts all OAuth endpoints (signin, callback, signout, session).
export const { GET, POST } = handlers;
