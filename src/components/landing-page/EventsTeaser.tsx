import { Link } from "@tanstack/react-router";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";
import SectionHead from "./SectionHead";
import { useFeaturedEvents } from "@/hooks/useEvents";
import { formatEventDate } from "@/lib/helpers";

export default function EventsTeaser() {
  const { data: upcoming = [], isLoading, isError } = useFeaturedEvents(3);

  return (
    <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">
      <Reveal>
        <SectionHead
          eyebrow="In person"
          title="Where to find us"
          action={{ label: "All events", to: "/events" }}
        />
      </Reveal>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-80 w-full animate-pulse rounded-sm border border-border bg-secondary"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-xs text-muted-foreground">
          Unable to load upcoming events.
        </p>
      ) : upcoming.length === 0 ? (
        <p className="py-12 text-center text-xs text-muted-foreground">
          No upcoming events scheduled right now. Check back soon!
        </p>
      ) : (
        <Stagger className="grid gap-4 md:grid-cols-3">
          {upcoming.map((e) => (
            <StaggerItem key={e.id}>
              <Link
                to="/events"
                className="group block overflow-hidden rounded-sm border border-border bg-card transition-shadow duration-300 hover:shadow-lift"
              >
                <div className="aspect-16/10 overflow-hidden bg-muted">
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
                </div>
                <div className="p-5">
                  <p className="eyebrow text-[10px] text-primary">
                    {e.kind} · {formatEventDate(e.date)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">
                    {e.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {e.location}
                  </p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </section>
  );
}