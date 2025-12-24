import { requireAuth } from "@clerk/express";

const clerkProtect = requireAuth();
export default clerkProtect;
