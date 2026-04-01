export interface FillAuction {
  item: string;
  start_price: number;
  current_price: number;
  end_time: string;
  image_url?: string;
}

export interface FillAuctionInput {
  item: string;
  start_price: string | number;
  current_price: string | number;
  end_time: string;
  image_url?: string;
}