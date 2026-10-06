import { apiClient } from "../client"
import type { UploadResult } from "../types"

export const uploadsApi = {
  /** Uploads one picture as multipart/form-data; the server resizes it and returns the stored picture. */
  upload: (file: File, folder?: string) => {
    const body = new FormData()
    body.append("file", file)
    if (folder) body.append("folder", folder)
    return apiClient.post<UploadResult>("/uploads", body)
  },
}
