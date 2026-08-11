import { Reveal } from "@/components/Reveal";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to subscribe");
      }

      toast.success("You're on the list. Check your email.");
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

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
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-14 min-w-0 md:flex-1 rounded-sm border border-input bg-background px-4 text-sm outline-none transition-colors duration-200 focus:border-primary disabled:opacity-50"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="eyebrow flex h-14 shrink-0 items-center justify-center gap-2 rounded-sm bg-primary px-7 text-primary-foreground transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Notify me"}
            </button>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
