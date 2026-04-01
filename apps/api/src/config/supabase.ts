
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!)

export async function uploadFile( fileName: string) {
  const filePath = `public/${fileName}`
  const { data, error } = await supabase.storage
    .from("Auction")
    .createSignedUploadUrl(filePath)

  if (error) {
    throw new Error(error.message)
  }

  return data.signedUrl
}