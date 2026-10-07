import { config } from "@backend/config";

/**
 * Makes the website show newly published content: tells the frontend to drop
 * its cached pages (POST /api/revalidate, signed with the shared secret).
 * Pages share data (the footer lists solutions and offices on every page), so
 * everything is refreshed rather than tracking which page uses what.
 *
 * It doesn't wait for the website: the save has already succeeded, and if the
 * website is down it starts fresh anyway.
 */
export function revalidateContent() {
  if (!config.sharedSecret) {
    console.warn("[revalidate] SPARK_SHARED_SECRET is not set, so the website can't be told to refresh.");
    return;
  }
  void fetch(`${config.frontendUrl}/api/revalidate`, {
    method: "POST",
    headers: { "x-spark-secret": config.sharedSecret },
    signal: AbortSignal.timeout(10_000),
  })
    .then((response) => {
      if (!response.ok) console.error(`[revalidate] the website answered ${response.status}`);
    })
    .catch((error: unknown) => console.error("[revalidate] couldn't reach the website:", error));
}
