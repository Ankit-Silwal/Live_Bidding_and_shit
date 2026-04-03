export default function PriceDisplay({ currentPrice }: { currentPrice: number }) {
  return (
    <div className="flex flex-col justify-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
        Current Bid
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-xl text-gray-600 font-serif">₹</span>
        <h2 className="text-3xl font-serif text-gray-900">
          {currentPrice ? currentPrice.toLocaleString() : "--"}
        </h2>
      </div>
    </div>
  );
}