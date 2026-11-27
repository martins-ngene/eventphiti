import { clerkMiddleware } from "@clerk/nextjs/server";

// STEP 1 · clerkMiddleware() reads the session on every request.
// It doesn't lock any page yet; that's step 3.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
