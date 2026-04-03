"use client";

import { useState } from "react";
import { socket } from "../lib/socket";

interface BidPanelProps
{
  auctionId: string;
  userId: string;
  currentPrice: number;
}

export default function BidPanel({ auctionId, userId, currentPrice }: BidPanelProps)
{
  const minBid = currentPrice ? currentPrice + 500 : 500;

  const [bidAmount, setBidAmount] = useState<number | "">(minBid);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickBid = (increment: number) =>
  {
    setBidAmount((currentPrice || 0) + increment);
  };

  const handleBid = () =>
  {
    setError(null);

    if (!bidAmount)
    {
      setError("Enter a bid amount");
      return;
    }

    const amountToBid = Number(bidAmount);

    if (isNaN(amountToBid) || amountToBid < minBid)
    {
      setError(`Minimum bid is ₹ ${minBid.toLocaleString()}`);
      return;
    }

    if (!socket.connected)
    {
      setError("Connection lost. Try again.");
      return;
    }

    setLoading(true);

    console.log("🚀 Sending bid:", {
      auctionId,
      userId,
      amount: amountToBid
    });

    // ⛑️ Safety timeout (prevents infinite loading)
    const timeout = setTimeout(() =>
    {
      setLoading(false);
      setError("Server not responding. Try again.");
    }, 5000);

    socket.emit(
      "place-bid",
      {
        auctionId,
        userId,
        amount: amountToBid,
      },
      (response: any) =>
      {
        clearTimeout(timeout);
        setLoading(false);

        console.log("📩 Response:", response);

        if (response?.success)
        {
          setBidAmount("");
        }
        else
        {
          setError(response?.error || "Bid failed");
        }
      }
    );
  };

  return (
    <div className="bg-white border border-gray-200 p-8">

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-serif text-gray-900 mb-1">
          Place Bid
        </h3>
        <p className="text-sm text-gray-500">
          Minimum next bid: ₹ {minBid.toLocaleString()}
        </p>
      </div>

      {/* Input + Button */}
      <div className="space-y-4">

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-500 font-serif">₹</span>
          </div>

          <input
            type="number"
            min={minBid}
            value={bidAmount}
            onChange={(e) =>
              setBidAmount(e.target.value ? Number(e.target.value) : "")
            }
            placeholder={`Enter amount (min ${minBid})`}
            className="w-full pl-9 pr-4 py-3 border border-gray-300 text-gray-900 outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        <button
          onClick={handleBid}
          disabled={loading}
          className={`w-full py-3 text-white font-medium tracking-wide transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {loading ? "PLACING BID..." : "PLACE BID"}
        </button>

        {error && (
          <p className="text-red-500 text-xs text-center uppercase tracking-wide">
            {error}
          </p>
        )}
      </div>

      {/* Quick Bids */}
      <div className="mt-6 pt-6 border-t border-gray-100 flex gap-2">
        {[500, 1000, 5000].map((value) => (
          <button
            key={value}
            onClick={() => handleQuickBid(value)}
            disabled={loading}
            className="flex-1 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm transition-colors disabled:opacity-50"
          >
            + {value.toLocaleString()}
          </button>
        ))}
      </div>

    </div>
  );
}