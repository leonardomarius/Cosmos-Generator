// Administrateurs : ADMIN_EMAILS, séparés par des virgules. Jamais affichés sur
// le site : seul SUPPORT_EMAIL est public.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((entry) => entry.trim().toLowerCase());
  return admins.includes(email.trim().toLowerCase());
}
