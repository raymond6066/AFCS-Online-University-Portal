"use client";

import { uploadData, getUrl } from "aws-amplify/storage";

export async function uploadFileToStorage(file: File, options: { prefix: string }) {
  const key = `${options.prefix}${crypto.randomUUID()}-${file.name}`;
  await uploadData({
    key,
    data: file,
    options: {
      contentType: file.type,
    },
  }).result;
  const signedUrl = await getUrl({ key, options: { expiresIn: 60 * 60 } });
  return signedUrl.url.toString();
}
