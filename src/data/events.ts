import convention from "@/assets/e-convention.jpg";
import cosplay from "@/assets/e-cosplay.jpg";
import popup from "@/assets/e-popup.jpg";

export type Event = {
  id: string;
  name: string;
  kind: "Convention" | "Meetup" | "Signing" | "Pop-up";
  date: string;
  location: string;
  cover: string;
  description: string;
  gallery: string[];
};

export const events: Event[] = [
  {
    id: "night-market-vol-3",
    name: "Night Market Vol. 3",
    kind: "Pop-up",
    date: "2026-09-12",
    location: "Warehouse 9, Berlin",
    cover: popup,
    description:
      "A one-night concrete pop-up: full Drop 04 rack, four unreleased figures on plinths, and a live screenprinting station. First 100 through the door leave with a numbered card.",
    gallery: [popup, convention, cosplay],
  },
  {
    id: "aurora-con-2026",
    name: "Aurora Con 2026",
    kind: "Convention",
    date: "2026-10-03",
    location: "Hall C, Toronto",
    cover: convention,
    description:
      "Three days on the main floor. Booth C14 carries the full catalogue plus convention-only colourways, and our sculptors run open studio hours each afternoon.",
    gallery: [convention, cosplay, popup],
  },
  {
    id: "midnight-cosplay-run",
    name: "Midnight Cosplay Run",
    kind: "Meetup",
    date: "2026-09-27",
    location: "Shinjuku Loop, Tokyo",
    cover: cosplay,
    description:
      "An after-dark photo run through neon side streets with a rotating crew of photographers. Free to join, original designs only, no franchise cosplay.",
    gallery: [cosplay, popup, convention],
  },
  {
    id: "inkwork-signing",
    name: "Inkwork Signing Night",
    kind: "Signing",
    date: "2026-11-08",
    location: "Ledger Books, Brooklyn",
    cover: popup,
    description:
      "Two hours with the illustrators behind the Impact Frame series. Bring any print from the archive and have it signed and stamped in person.",
    gallery: [popup, print_placeholder(), convention],
  },
  {
    id: "spring-drop-preview",
    name: "Spring Drop Preview",
    kind: "Pop-up",
    date: "2026-03-14",
    location: "Studio Annex, Lisbon",
    cover: popup,
    description:
      "An invite-only preview of the spring line with samples on the rack and open feedback boards. Notes from this room shaped half of Drop 04.",
    gallery: [popup, convention],
  },
  {
    id: "harbour-cosplay-meet",
    name: "Harbour Cosplay Meet",
    kind: "Meetup",
    date: "2026-02-22",
    location: "Old Docks, Rotterdam",
    cover: cosplay,
    description:
      "A daylight meet on the docks: original character builds, armour workshops, and a peer-judged craft table.",
    gallery: [cosplay, convention],
  },
  {
    id: "winter-con-recap",
    name: "Winter Con",
    kind: "Convention",
    date: "2026-01-17",
    location: "Expo Sur, Madrid",
    cover: convention,
    description:
      "Our first international booth. Sold through the figure allocation in a day and a half — restocks went live the following week.",
    gallery: [convention, popup],
  },
  {
    id: "archive-signing",
    name: "Archive Signing",
    kind: "Signing",
    date: "2025-12-06",
    location: "The Reading Room, London",
    cover: popup,
    description:
      "A quiet evening with the archive binders open on the table and every print from Vol. 1 available to sign.",
    gallery: [popup, cosplay],
  },
];

function print_placeholder() {
  return cosplay;
}

export const formatEventDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const isUpcoming = (iso: string) => new Date(iso).getTime() > Date.now();
