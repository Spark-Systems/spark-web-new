/**
 * A field people never see or fill in. Spam bots fill in every field, so a
 * value here marks the message as spam (see server/enquiries).
 */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
