"use client";

import { useEffect, useState } from "react";
import PriceDisplay from "./PriceDisplay";
import Timer from "./Timer";
import BidPanel from "./BidPanel";
import BidHistory from "./BIdHistory";

export default function AuctionRoom({ auctionId }: { auctionId: string }) {
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 📥 FETCH SPECIFIC AUCTION
  useEffect(() => {
    if (!auctionId) return;

    const fetchAuction = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auctions");
        const data = await res.json();
        // Temporary filter until a GET /auctions/:id endpoint is built
        const found = data.data?.find((a: any) => a.id.toString() === String(auctionId));
        setAuction(found || null);
      } catch (err) {
        console.error("Failed to fetch auction:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [auctionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
          <p className="text-sm tracking-widest uppercase text-gray-500">Loading Lot</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] font-sans">
        <p className="text-gray-500 uppercase tracking-widest text-sm mb-4">Lot Not Found</p>
        <h1 className="text-3xl text-gray-900 font-serif">We couldn't locate this auction.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      
      <div className="max-w-5xl mx-auto p-6 sm:p-10">
        
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8 flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500 tracking-widest uppercase mb-2">Lot {auction.id}</p>
            <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 tracking-tight">
              {auction.item}
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
            Bidding Open
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Image/Status */}
          <div className="space-y-6">
            <div className="w-full aspect-square bg-gray-100 border border-gray-200 relative overflow-hidden group">
              {/* Decorative hover effect */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
              {auction.image_url ? (
                <img
                  src={auction.image_url}
                  alt={auction.item}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400 uppercase tracking-widest text-sm">
                    No Image
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
              <PriceDisplay currentPrice={auction?.current_price} />
              <Timer endTime={auction?.end_time} />
            </div>
          </div>

          {/* Right Column: Interaction */}
          <div className="space-y-6">
            <BidPanel currentPrice={auction?.current_price} />
            <BidHistory />
          </div>

        </div>

      </div>
    </div>
  );
}