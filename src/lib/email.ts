// Envoi des emails au client via l'API REST de Resend, uniquement côté serveur.
// Chaque email porte une clé d'idempotence liée à la tâche fal : si fal renvoie
// le même webhook, Resend renvoie la réponse du premier envoi sans renvoyer
// l'email (Resend garde ces clés 24 h, fal arrête ses renvois au bout d'1 h).
import { MODELS, PRODUCT, supportEmail, type ModelId } from "@/config/product";

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

async function sendEmail(params: {
  to: string;
  subject: string;
  lines: string[];
  link: { url: string; label: string };
  idempotencyKey: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY ou EMAIL_FROM manquant dans .env.local");

  const { to, subject, lines, link } = params;
  const text = [...lines, "", `${link.label} : ${link.url}`, "", `— ${PRODUCT.siteName}`].join("\n");
  const html = [
    ...lines.map((line) => `<p>${escapeHtml(line)}</p>`),
    `<p><a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a></p>`,
    `<p>— ${escapeHtml(PRODUCT.siteName)}</p>`,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": params.idempotencyKey,
    },
    // Les réponses du client arrivent sur l'adresse de contact, pas sur EMAIL_FROM.
    body: JSON.stringify({
      from,
      to: [to],
      ...(process.env.SUPPORT_EMAIL && { reply_to: supportEmail() }),
      subject,
      text,
      html,
    }),
  });
  // En cas d'échec (y compris un envoi identique encore en cours, 409),
  // l'erreur fait répondre le webhook en 500 : fal le renverra plus tard.
  if (!res.ok) throw new Error(`Resend a refusé l'email (${res.status}) : ${await res.text()}`);
}

// Les clés d'idempotence gardent le préfixe "video-" des premiers envois.
export function sendResultReadyEmail(to: string, model: ModelId, url: string, requestId: string) {
  const image = MODELS[model].kind === "image";
  return sendEmail({
    to,
    subject: image ? "Ton image est prête" : "Ta vidéo est prête",
    lines: [
      "Bonjour,",
      model === "kling4" ? "Ta vidéo de star est prête." : image ? "Ton image est prête." : "Ta vidéo est prête.",
      `Elle reste disponible pendant ${PRODUCT.retentionDays} jours : pense à la télécharger.`,
    ],
    link: { url, label: image ? "Voir et télécharger l'image" : "Voir et télécharger la vidéo" },
    idempotencyKey: `video-ready/${requestId}`,
  });
}

export function sendGenerationFailedEmail(to: string, model: ModelId, retryUrl: string, requestId: string) {
  const image = MODELS[model].kind === "image";
  return sendEmail({
    to,
    subject: image ? "Ton image n'a pas pu être créée" : "Ta vidéo n'a pas pu être créée",
    lines: [
      "Bonjour,",
      `Désolé : la création de ${image ? "ton image" : "ta vidéo"} a échoué de notre côté. Tes tokens t'ont été rendus.`,
      model === "kling4"
        ? "Tu peux relancer une génération, avec d'autres photos si possible (visage net et bien éclairé)."
        : "Tu peux relancer une génération, en reformulant ta description si besoin.",
    ],
    link: { url: retryUrl, label: "Relancer une génération" },
    idempotencyKey: `video-failed/${requestId}`,
  });
}

// Vidéo du Père Noël : assemblée en quelques secondes, le lien part aussitôt.
export function sendSantaVideoEmail(to: string, url: string, generationId: string) {
  return sendEmail({
    to,
    subject: "Ta vidéo du Père Noël est prête",
    lines: [
      "Bonjour,",
      "Ta vidéo du Père Noël est prête.",
      `Elle reste disponible pendant ${PRODUCT.retentionDays} jours : pense à la télécharger.`,
    ],
    link: { url, label: "Voir et télécharger la vidéo" },
    idempotencyKey: `santa-ready/${generationId}`,
  });
}
