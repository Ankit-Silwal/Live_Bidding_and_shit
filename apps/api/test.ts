import { io } from "socket.io-client";
type BidAck = {
  success?: boolean;
  data?: unknown;
  error?: string;
};

const socket = io("http://localhost:5000");

socket.on("connect", () =>
{
  console.log("🟢 Connected:", socket.id);

  // join auction room
  socket.emit("join-auction", "1");

  // place bid after small delay
  setTimeout(() =>
  {
    socket.emit(
      "place-bid",
      {
        auctionId: "1",
        userId: "user1",
        amount: 60000
      },
      (response: BidAck) =>
      {
        console.log("📥 ACK:", response);
      }
    );
  }, 1000);
});

// listen for real-time updates
socket.on("bid-update", (data: unknown) =>
{
  console.log("📢 Bid Update:", data);
});

socket.on("disconnect", () =>
{
  console.log("🔴 Disconnected");
});