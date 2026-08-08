import { Reveal } from "@/components/Reveal";

export default function NewsletterBand() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-5 sm:px-8">
      <Reveal>
        <div className="rounded-sm border border-border bg-surface px-6 py-14 text-center sm:px-12">
          <p className="eyebrow text-primary">Drop 05 · November</p>
          <h2 className="display-xl mx-auto mt-4 max-w-2xl text-4xl sm:text-5xl">
            Get first access
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            One email per drop. Early links, edition sizes, and event invites. No noise.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="h-14 min-w-0 flex-1 rounded-sm border border-input bg-background px-4 text-sm outline-none transition-colors duration-200 focus:border-primary"
            />
            <button
              type="submit"
              className="eyebrow h-14 shrink-0 rounded-sm bg-primary px-7 text-primary-foreground transition-opacity duration-200 hover:opacity-90"
            >
              Notify me
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
