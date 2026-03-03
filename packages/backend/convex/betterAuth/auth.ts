import { createAuth } from "../auth";

// Export a static instance for Better Auth schema generation
// This file should NOT be imported at runtime (will error due to missing env vars)
export const auth = createAuth({} as any);
