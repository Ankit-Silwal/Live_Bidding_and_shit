import PriceDisplay from "./PriceDisplay";
import Timer from "./Timer";
import BidPanel from "./BidPanel";
import BidHistory from "./BIdHistory";

export default function AuctionRoom() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans pb-20">
      
      <div className="max-w-5xl mx-auto p-6 sm:p-10">
        
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8 flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500 tracking-widest uppercase mb-2">Lot 42</p>
            <h1 className="text-3xl sm:text-4xl font-serif text-gray-900 tracking-tight">
              Exclusive Auction Item
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
            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center border border-gray-200">
              <span className="text-gray-400 uppercase tracking-widest text-sm">Image Preview</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
              <PriceDisplay />
              <Timer />
            </div>
          </div>

          {/* Right Column: Interaction */}
          <div className="space-y-6">
            <BidPanel />
            <BidHistory />
          </div>

        </div>

      </div>
    </div>
  );
}