import { pool } from "../../config/db.js";
import { uploadAuctionImage } from "../../config/supabase.js";
import type { FillAuctionInput } from "./auction.types.js";

export async function fillAuctionService(auction: FillAuctionInput, file?: Express.Multer.File) {
	const { item, start_price, current_price, end_time, image_url } = auction;
	const parsedStartPrice = Number(start_price);
	const parsedCurrentPrice = Number(current_price);

	const result = await pool.query<{ id: number }>(
		`INSERT INTO auctions (item, start_price, current_price, end_time, image_url)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id`,
		[item, parsedStartPrice, parsedCurrentPrice, end_time, image_url ?? null]
	);

	const id = result.rows[0]?.id;
	if (!id) {
		throw new Error("Failed to create auction id");
	}

	if (file) {
		const publicUrl = await uploadAuctionImage(file, id);
		await pool.query("UPDATE auctions SET image_url = $1 WHERE id = $2", [publicUrl, id]);
		return { id, imageUrl: publicUrl };
	}

	return { id, imageUrl: image_url ?? null };
}