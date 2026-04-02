import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () =>
{
  console.log("🟢 Connected:", socket.id);

  socket.emit("join-auction", "1");

  setTimeout(() =>
  {
    socket.emit(
      "place-bid",
      {
        auctionId: "1",
        userId: 1,
        amount: 60000
      },
      (res: any) =>
      {
        console.log("📥 ACK:", res);
      }
    );
  }, 1000);
});

socket.on("bid-update", (data) =>
{
  console.log("📢 Bid Update:", data);
});