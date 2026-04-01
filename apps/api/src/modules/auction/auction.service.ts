import { pool } from "../../config/db.js";
import { uploadFile } from "../../config/supabase.js";
import type { FillAuction } from "./auction.types.js";

export async function fillAuctionService(auction: FillAuction) {
	const { item, start_price, current_price, end_time, image_url } = auction;

	const result = await pool.query<{ id: number }>(
		`INSERT INTO auctions (item, start_price, current_price, end_time, image_url)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id`,
		[item, start_price, current_price, end_time, image_url ?? null]
	);

	const id = result.rows[0]?.id;
	if (!id) {
		throw new Error("Failed to create auction id");
	}

	const signedUrl = await uploadFile(id.toString());
	return { id, signedUrl };
}