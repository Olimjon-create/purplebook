"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already linked to a password account. Please sign in with your email and password.",
  OAuthSignin: "There was a problem with Google sign-in. Please try again.",
  OAuthCallback: "There was a problem completing Google sign-in.",
  Default: "An authentication error occurred. Please try again.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";

  const message =
    errorMessages[error as keyof typeof errorMessages] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>

        <h2 className="text-2xl font-bold text-purple-950 mb-3">
          Sign-in error
        </h2>

        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex gap-3 justify-center">
          <Link href="/auth/signin" className="btn-primary text-sm">
            Try again
          </Link>
          <Link href="/" className="btn-secondary text-sm">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
