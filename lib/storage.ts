import { supabaseAdmin } from './supabase'

const BUCKET = 'documents'

export async function uploadDocument(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_ ]/g, '_')
  const path = `${Date.now()}-${safeName}`

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, fileBuffer, { contentType: mimeType, upsert: false })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10) // 10 year signed URL

  return data?.signedUrl || path
}
