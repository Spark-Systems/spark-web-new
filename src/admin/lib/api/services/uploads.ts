import { apiClient } from "../client"
import type { UploadResult } from "../types"

export const uploadsApi = {
  /** Uploads one file as multipart/form-data and returns its stored URL. */
  upload: (file: File, folder?: string) => {
    const body = new FormData()
    body.append("file", file)
    if (folder) body.append("folder", folder)
    return apiClient.post<UploadResult>("/uploads", body)
  },
}
