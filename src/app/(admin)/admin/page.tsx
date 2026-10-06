import { redirect } from "next/navigation"

import { HOME_PATH } from "@admin/lib/auth/constants"

export default function AdminIndex() {
  redirect(HOME_PATH)
}
