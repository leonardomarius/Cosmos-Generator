// Textes liés au paiement. "contact" : supportEmail(), lu côté serveur et
// transmis par la page (jamais l'email des administrateurs).

function ContactLink({ contact }: { contact: string }) {
  return (
    <a href={`mailto:${contact}`} className="font-semibold text-foreground underline underline-offset-4">
      {contact}
    </a>
  );
}

// Compte bloqué après une rétrofacturation, dans une ligne de formulaire.
export function SuspendedText({ contact }: { contact: string }) {
  return (
    <>
      Ton compte est suspendu à la suite d&apos;une contestation de paiement. Pour en parler, écris-nous à{" "}
      <ContactLink contact={contact} />.
    </>
  );
}

export function SuspendedNotice({ contact }: { contact: string }) {
  return (
    <p className="liquid-glass rounded-[24px] px-5 py-4 text-base leading-relaxed text-secondary">
      <SuspendedText contact={contact} />
    </p>
  );
}

// Un client qui sait qui contacter ne conteste pas son paiement auprès de sa banque.
export function PaymentHelp({ contact }: { contact: string }) {
  return (
    <p className="text-sm leading-relaxed text-secondary">
      Un problème avec un paiement ? Écris-nous à <ContactLink contact={contact} />, on trouvera une solution.
    </p>
  );
}
