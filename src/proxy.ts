import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// STEP 3 · Organizer pages need an account. Event pages stay open to anyone with the link.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/profile(.*)"]);

// STEP 1 · clerkMiddleware() reads the session on every request.
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
