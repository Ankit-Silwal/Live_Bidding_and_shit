export default function BidHistory() {
  const history = [
    { user: "User123", amount: "12,500", time: "Just now", leading: true },
    { user: "CryptoGuy", amount: "12,000", time: "1 min ago", leading: false },
    { user: "SpicyBidder", amount: "11,500", time: "3 mins ago", leading: false },
    { user: "Whale42", amount: "10,000", time: "10 mins ago", leading: false },
  ];

  return (
    <div className="bg-white border border-gray-200 p-6 h-full min-h-[300px] flex flex-col">
      
      <div className="border-b border-gray-200 pb-4 mb-4">
        <h3 className="text-sm font-medium text-gray-900 tracking-wide uppercase">Bidding History</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-1">
        {history.map((bid, i) => (
          <div 
            key={i} 
            className={`py-3 flex justify-between items-center text-sm border-b border-gray-100 last:border-0 ${
              bid.leading ? 'text-gray-900 font-medium bg-gray-50 px-2 -mx-2' : 'text-gray-600'
            }`}
          >
            <div>
              <span className="flex items-center gap-2">
                {bid.user}
                {bid.leading && <span className="text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 uppercase tracking-wider">Leading</span>}
              </span>
              <span className="text-xs text-gray-400 mt-0.5 block">{bid.time}</span>
            </div>
            <span className="font-serif">
              ₹ {bid.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}