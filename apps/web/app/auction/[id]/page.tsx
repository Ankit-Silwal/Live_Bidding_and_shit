import AuctionRoom from "@/components/AuctionRoom";

export default async function AuctionPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Await params safely for both Next 14 and 15
  const resolvedParams = await params;
  return <AuctionRoom auctionId={resolvedParams.id} />;
}