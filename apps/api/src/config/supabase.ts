
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);
export async function uploadAuctionImage(file: Express.Multer.File, auctionId: number) {
  const fileName=file.originalname;
  const filePath = `public/auctions/${auctionId}-${Date.now()}-${fileName}`;

  const { error } = await supabase.storage.from("auction").upload(filePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) {
    throw new Error(error.message);
  }
  const { data } = supabase.storage.from("auction").getPublicUrl(filePath);
  return data.publicUrl;
}