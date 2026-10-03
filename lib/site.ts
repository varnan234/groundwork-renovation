// Every value here is a placeholder until the owner confirms it.
// Swap them in one place; nothing else in the app hard-codes contact details.
// The phone number is in the 555-01xx range reserved for fiction.
// Flip to false once real details are in; the UI shows a placeholder marker while true.
export const placeholderContact = true;

export const site = {
  name: "Groundwork Renovation Co.",
  shortName: "Groundwork",
  area: "Greater Toronto Area",
  areaShort: "the GTA",
  phoneDisplay: "(416) 555-0142",
  phoneHref: "tel:+14165550142",
  smsHref: "sms:+14165550142",
  email: "hello@example.com",
  // Placeholder handle. The links point at Instagram itself, not at a guessed account,
  // so no visitor's photos can reach a stranger. Set the real handle, profile URL and
  // https://ig.me/m/<handle> DM link once the owner confirms them.
  instagramHandle: "@yourhandle",
  instagramUrl: "https://www.instagram.com/",
  instagramDmUrl: "https://www.instagram.com/direct/inbox/",
  ownerName: "[Owner name]",
} as const;
