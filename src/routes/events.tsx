import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, MapPin, X } from "lucide-react";
import { useMemo, useState } from "react";
import { EASE, Reveal } from "@/components/Reveal";
import { useEvents } from "@/hooks/useEvents";
import { formatEventDate } from "@/lib/helpers";
import { seo, canonicalLink } from "@/lib/seo";
import type { Event } from "@/api/events";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: seo({
      title: "Pop-ups & Conventions",
      description: "Come find us in person: anime conventions, cosplay meetups, and exclusive pop-ups.",
      path: "/events",
    }),
    links: canonicalLink("/events"),
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data: events = [], isLoading, isError } = useEvents();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [open, setOpen] = useState<Event | null>(null);

  const list = useMemo(
    () =>
      events.filter((e) =>
        tab === "upcoming" ? e.status !== "Past" : e.status === "Past",
      ),
    [events, tab],
  );

  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-8">
      <header>
        <p className="eyebrow text-primary">In person</p>
        <h1 className="display-xl mt-3 max-w-2xl text-5xl sm:text-6xl">
          Conventions, meets & pop-ups
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
          We show up in rooms rather than run ads. Come see the pieces in person, meet the
          sculptors, and shoot with the crew.
        </p>
      </header>

      <div className="mt-10 inline-flex rounded-sm border border-border p-1">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="relative h-11 min-w-28 rounded-sm px-5 text-xs font-bold uppercase tracking-[0.18em]"
          >
            {tab === t && (
              <motion.span
                layoutId="events-tab"
                className="absolute inset-0 rounded-sm bg-primary"
                transition={{ duration: 0.3, ease: EASE }}
              />
            )}
            <span className={`relative ${tab === t ? "text-primary-foreground" : "text-muted-foreground"}`}>
              {t}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-4/5 w-full animate-pulse rounded-sm border border-border bg-secondary" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-24 text-center text-sm text-muted-foreground">
          Unable to load events right now.
        </p>
      ) : (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((e, i) => (
              <motion.button
                key={e.id}
                type="button"
                onClick={() => setOpen(e)}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: EASE }}
                className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-sm border border-border bg-card text-left transition-shadow duration-300 hover:shadow-lift"
              >
                <div className={`relative overflow-hidden ${i % 3 === 1 ? "aspect-4/5" : "aspect-16/10"}`}>
                  {e.cover ? (
                    <img
                      src={e.cover}
                      alt={e.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-drop group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-surface-2" />
                  )}
                  {e.status === "Cancelled" && (
                    <span className="absolute left-3 top-3 rounded-sm bg-ink/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Cancelled
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="eyebrow text-[10px] text-primary">{e.kind}</p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight">{e.name}</h2>
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays size={13} /> {formatEventDate(e.date)}
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin size={13} /> {e.location}
                  </p>
                  <p className="eyebrow mt-4 text-[10px] text-foreground">Details →</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && !isError && list.length === 0 && (
        <p className="py-24 text-center text-sm text-muted-foreground">
          No {tab} events on the calendar right now.
        </p>
      )}

      <EventModal event={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function EventModal({ event, onClose }: { event: Event | null; onClose: () => void }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {event && (
        <>
          <motion.div
            className="fixed inset-0 z-85 bg-ink/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label={event.name}
            className="fixed inset-0 z-90 overflow-y-auto bg-background sm:inset-auto sm:left-1/2 sm:top-1/2 sm:max-h-[86svh] sm:w-[min(760px,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-sm sm:border sm:border-border sm:shadow-lift"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="relative aspect-video">
              {event.cover ? (
                <img src={event.cover} alt={event.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-surface-2" />
              )}
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-background/85 backdrop-blur-sm"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 sm:p-8">
              <p className="eyebrow text-primary">
                {event.kind} · {formatEventDate(event.date)}
                {event.status === "Cancelled" && " · Cancelled"}
              </p>
              <h2 className="display-xl mt-3 text-3xl sm:text-4xl">{event.name}</h2>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin size={13} /> {event.location}
              </p>
              {event.description && (
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              )}

              {event.gallery.length > 0 && (
                <>
                  <p className="eyebrow mt-8 text-[10px] text-muted-foreground">Highlights</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {event.gallery.map((g, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightbox(g)}
                        className="aspect-square overflow-hidden rounded-sm border border-border"
                      >
                        <img
                          src={g}
                          alt={`${event.name} highlight ${i + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {lightbox && (
              <motion.button
                type="button"
                aria-label="Close image"
                onClick={() => setLightbox(null)}
                className="fixed inset-0 z-95 grid place-items-center bg-ink/90 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.img
                  src={lightbox}
                  alt=""
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="max-h-[86svh] w-auto max-w-full rounded-sm object-contain"
                />
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}