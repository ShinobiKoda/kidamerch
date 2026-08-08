import { Link } from "@tanstack/react-router";

import { events, formatEventDate, isUpcoming } from "@/data/events";

import { Reveal, Stagger, StaggerItem, EASE } from "@/components/Reveal";
import SectionHead from "./SectionHead";

export default function EventsTeaser() {
  const upcoming = events.filter((e) => isUpcoming(e.date)).slice(0, 3);
  return (
    <section className="mx-auto max-w-7xl px-5 pt-24 sm:px-8">
      <Reveal>
        <SectionHead
          eyebrow="In person"
          title="Where to find us"
          action={{ label: "All events", to: "/events" }}
        />
      </Reveal>
      <Stagger className="grid gap-4 md:grid-cols-3">
        {upcoming.map((e) => (
          <StaggerItem key={e.id}>
            <Link
              to="/events"
              className="group block overflow-hidden rounded-sm border border-border bg-card transition-shadow duration-300 hover:shadow-lift"
            >
              <div className="aspect-16/10 overflow-hidden">
                <img
                  src={e.cover}
                  alt={e.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-drop group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="eyebrow text-[10px] text-primary">
                  {e.kind} · {formatEventDate(e.date)}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{e.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{e.location}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
