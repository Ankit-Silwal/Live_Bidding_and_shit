"use client";

import { useUser, useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useEffect } from "react";

export default function HomePage()
{
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() =>
  {
    if (!isLoaded || !user) return;

    const syncUser = async () =>
    {
      try
      {
        const token = await getToken();

        await fetch("http://localhost:5000/api/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          username: user.username || "",
          profileImage: user.imageUrl || "",
          })
        });
      }
      catch (err)
      {
        console.error("Sync failed:", err);
      }
    };

    syncUser();
  }, [isLoaded, user]);

  // ⛔ wait until Clerk loads
  if (!isLoaded)
  {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">

      <h1 className="text-2xl font-bold">Welcome</h1>

      {/* 🔥 Manual auth check */}
      {!user ? (
        <div className="flex gap-4">
          <SignInButton />
          <SignUpButton>
            <button className="bg-purple-600 text-white px-4 py-2 rounded">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <UserButton />

          <p className="text-sm text-gray-600">
            Logged in as: {user.primaryEmailAddress?.emailAddress}
          </p>
        </div>
      )}

    </div>
  );
}