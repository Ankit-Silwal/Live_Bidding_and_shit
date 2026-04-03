export default function BidPanel() {
  return (
    <div className="bg-white border border-gray-200 p-8">
      
      <div className="mb-6">
        <h3 className="text-lg font-serif text-gray-900 mb-1">Place Bid</h3>
        <p className="text-sm text-gray-500">Minimum next bid: ₹ 13,000</p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-500 font-serif">₹</span>
          </div>
          <input
            type="number"
            placeholder="Enter amount"
            className="w-full pl-9 pr-4 py-3 border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-base"
          />
        </div>

        <button className="w-full bg-black py-3 text-white font-medium tracking-wide hover:bg-gray-800 transition-colors">
          PLACE BID
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 flex gap-2">
        {['+ 500', '+ 1,000', '+ 5,000'].map((amt) => (
          <button key={amt} className="flex-1 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm transition-colors">
            {amt}
          </button>
        ))}
      </div>
    </div>
  );
}