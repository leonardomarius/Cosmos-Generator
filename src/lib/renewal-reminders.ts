// Rappel de reconduction de l'abonnement annuel (art. L215-1 du Code de la
// consommation : information au plus tôt 3 mois, au plus tard 1 mois avant le
// terme). Envoi à J-60, rattrapé chaque jour jusqu'à J-31 si un envoi échoue
// ou si le cron n'a pas tourné, une seule fois par période.
import { PLANS, isBillingInterval, isPlanId, planPriceEur } from "@/config/product";
import { sendRenewalReminderEmail } from "@/lib/email";
import { adminClient } from "@/lib/supabase";

const FIRST_DAY_BEFORE = 60;
const LAST_DAY_BEFORE = 31;
const DAY_MS = 24 * 60 * 60 * 1000;

const formatDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export async function sendRenewalReminders(accountUrl: string, now = new Date()) {
  const db = adminClient();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const { data: rows, error } = await db
    .from("subscriptions")
    .select("user_id, plan, next_plan, next_interval, current_period_end")
    .eq("billing_interval", "year")
    .eq("status", "active")
    .eq("cancel_at_period_end", false)
    .is("renewal_reminder_sent_at", null)
    .gte("current_period_end", new Date(today + LAST_DAY_BEFORE * DAY_MS).toISOString())
    .lt("current_period_end", new Date(today + (FIRST_DAY_BEFORE + 1) * DAY_MS).toISOString());
  if (error) throw error;

  let sent = 0;
  let failed = 0;
  for (const row of rows ?? []) {
    try {
      const plan = isPlanId(row.next_plan) ? row.next_plan : row.plan;
      if (!isPlanId(plan) || !row.current_period_end) throw new Error("abonnement incomplet");
      const { data: found, error: userError } = await db.auth.admin.getUserById(row.user_id);
      if (userError) throw userError;
      if (!found.user.email) throw new Error("utilisateur sans email");

      const interval = isBillingInterval(row.next_interval) ? row.next_interval : "year";
      const renewal = new Date(row.current_period_end);
      await sendRenewalReminderEmail({
        to: found.user.email,
        planLabel: PLANS[plan].label,
        renewalDate: formatDate(renewal),
        // Dernier jour pour résilier : la veille du prélèvement.
        lastCancelDate: formatDate(new Date(+renewal - DAY_MS)),
        amountEur: planPriceEur(plan, interval),
        interval,
        accountUrl,
        idempotencyKey: `renewal-reminder/${row.user_id}/${row.current_period_end}`,
      });
      const { error: saveError } = await db
        .from("subscriptions")
        .update({ renewal_reminder_sent_at: new Date().toISOString() })
        .eq("user_id", row.user_id);
      if (saveError) throw saveError;
      sent++;
    } catch (err) {
      // Les autres clients reçoivent leur rappel ; celui-ci repart demain.
      console.error(`Rappel de renouvellement de ${row.user_id} non envoyé`, err);
      failed++;
    }
  }
  return { sent, failed };
}
