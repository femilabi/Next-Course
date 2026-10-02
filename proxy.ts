// proxy.ts
import { withAuth } from "next-auth/middleware";

export const proxy = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ["/api/users/:path*", "/api/auth/token", "/change-password"],
};