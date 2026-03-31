"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export default function SyncUser()
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

        await fetch("http://localhost:8000/api/users/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            username: user.username,
            profileImage: user.imageUrl,
          }),
        });
      }
      catch (err)
      {
        console.error("Sync failed:", err);
      }
    };

    syncUser();
  }, [isLoaded, user]);

  return null;
}