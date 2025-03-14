import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/clerk/webhook(.*)',
    '/api/initial-sync(.*)' // Add this line to the array of public routes to allow the webhook to bypass the middleware and be accessible by Clerk
  ])
  
  export default clerkMiddleware(async (auth, request) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (!isPublicRoute(request)) {
      await auth.protect()
    }
  })
  

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

