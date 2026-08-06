import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="display-xl text-3xl">KidaMerch</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Independent anime merch, made in small runs. Four drops a year, no restocks on
              numbered editions.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social profile"
                  className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors duration-200 hover:bg-secondary"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { label: "All items", to: "/shop" },
              { label: "Wishlist", to: "/wishlist" },
              { label: "Cart", to: "/cart" },
            ]}
          />
          <FooterCol
            title="Studio"
            links={[
              { label: "Events", to: "/events" },
              { label: "About", to: "/" },
              { label: "Stockists", to: "/" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { label: "Terms", to: "/" },
              { label: "Privacy", to: "/" },
              { label: "Returns", to: "/" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2 border-t border-border py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KidaMerch. Prototype — no real orders.</p>
          <p>All artwork original. No franchise properties.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string }[];
}) {
  return (
    <div>
      <p className="eyebrow text-[10px] text-muted-foreground">{title}</p>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to as never}
              className="text-foreground/80 transition-colors duration-150 hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
