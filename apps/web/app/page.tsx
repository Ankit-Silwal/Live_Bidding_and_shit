"use client";

import { useUser, useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage()
{
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [auctions, setAuctions] = useState<any[]>([]);

  // 🔄 Sync user (keep this)
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

  // 🧪 MOCK DATA (NO BACKEND)
  useEffect(() =>
  {
    if (!user) return;

    const mockAuctions = [
      {
        id: 1,
        item: "iPhone 15 Pro",
        current_price: 85000,
        end_time: new Date(Date.now() + 1000 * 60 * 5),
      },
      {
        id: 2,
        item: "Gaming Laptop RTX 4060",
        current_price: 120000,
        end_time: new Date(Date.now() + 1000 * 60 * 10),
      },
      {
        id: 3,
        item: "Nike Air Jordans",
        current_price: 15000,
        end_time: new Date(Date.now() + 1000 * 60 * 2),
      },
    ];

    setAuctions(mockAuctions);
  }, [user]);

  // ⏳ Loading
  if (!isLoaded)
  {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-sm tracking-widest uppercase text-gray-500">Loading</p>
        </div>
      </div>
    );
  }

  // 🔐 Not logged in
  if (!user)
  {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] font-sans">
        <div className="w-full max-w-lg bg-white border border-gray-200 p-12 text-center shadow-sm">
          
          <h1 className="text-4xl text-gray-900 tracking-tight font-serif mb-2">
            BidX
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs mb-10">Premier Auction House</p>
          
          <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
            <SignInButton mode="modal">
              <button className="w-full px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium tracking-wide">
                SIGN IN
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full px-6 py-3 bg-white text-black border border-black hover:bg-gray-50 transition-colors text-sm font-medium tracking-wide">
                CREATE ACCOUNT
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    );
  }

  // 🟢 Logged in → Show auctions
  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6 sm:px-12 font-sans text-gray-900">
      
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 pb-4 border-b border-gray-200 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif text-gray-900 tracking-tight">
              Current Auctions
            </h1>
            <p className="mt-2 text-gray-500 text-sm tracking-wide">Discover exceptional lots.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((auction) => (
            <Link key={auction.id} href={`/auction/${auction.id}`} className="group block bg-white border border-gray-200 hover:border-gray-400 transition-colors">
              <div className="relative h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                <span className="text-gray-400 uppercase tracking-widest text-xs">Preview Not Available</span>
              </div>

              <div className="p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                    {auction.item}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Bidding Open</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current Bid</p>
                  <p className="text-2xl font-serif text-gray-900">
                    ₹ {auction.current_price.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    Closes: {new Date(auction.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}