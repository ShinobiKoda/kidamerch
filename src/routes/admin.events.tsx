import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, Pencil, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  ConfirmDialog,
  EmptyState,
  Field,
  Panel,
  SlideOver,
  StatusBadge,
  TableSkeleton,
  btnGhost,
  btnPrimary,
  btnSubtle,
  inputCls,
} from "@/components/admin/parts";
import { formatEventDate } from "@/data/events";
import {
  useAdminEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useToggleFeatured,
} from "@/hooks/admin/useAdminEvents";
import type { AdminEvent, EventKind, EventStatus, CreateEventInput } from "@/types/admin";

export const Route = createFileRoute("/admin/events")({
  component: EventsPage,
});

const KINDS: EventKind[] = ["Convention", "Meetup", "Signing", "Pop-up"];
const STATUSES: EventStatus[] = ["Upcoming", "Past", "Cancelled"];

type FormState = {
  name: string;
  kind: EventKind;
  date: string;
  location: string;
  description: string;
  status: EventStatus;
  featured: boolean;
};

const empty: FormState = {
  name: "",
  kind: "Pop-up",
  date: "",
  location: "",
  description: "",
  status: "Upcoming",
  featured: false,
};

function EventsPage() {
  const { data: events = [], isLoading } = useAdminEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const { toggle: toggleFeatured, isPending: togglingFeatured } = useToggleFeatured();

  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<AdminEvent | null>(null);

  const rows = useMemo(
    () =>
      events
        .filter((e) => filter === "all" || e.status === filter)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [events, filter],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (e: AdminEvent) => {
    setEditing(e);
    setForm({
      name: e.name,
      kind: e.kind,
      date: e.date.slice(0, 10),
      location: e.location,
      description: e.description,
      status: e.status,
      featured: e.featured,
    });
    setErrors({});
    setOpen(true);
  };

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next["name"] = "Name is required.";
    if (!form.date) next["date"] = "Pick a date.";
    if (!form.location.trim()) next["location"] = "Location is required.";
    if (form.description.trim().length < 10) next["description"] = "Add at least 10 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const input: CreateEventInput = {
      name: form.name.trim(),
      kind: form.kind,
      date: form.date,
      location: form.location.trim(),
      description: form.description.trim(),
      cover: editing?.cover ?? "",
      gallery: editing?.gallery ?? [],
      status: form.status,
      featured: form.featured,
    };

    try {
      if (editing) {
        await updateEvent.mutateAsync({ id: editing.id, input });
        toast.success("Event updated", { description: input.name });
      } else {
        await createEvent.mutateAsync(input);
        toast.success("Event created", { description: "Now visible on the storefront" });
      }
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const saving = createEvent.isPending || updateEvent.isPending;

  return (
    <AdminShell
      title="Events"
      description="Conventions, meetups and pop-ups. Feature up to three events to pin them on the storefront events page."
      actions={
        <button type="button" onClick={openCreate} className={btnPrimary}>
          <CalendarPlus size={15} /> New event
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === s ? "border-primary bg-primary/10 text-primary" : "border-border"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Panel>
          <TableSkeleton />
        </Panel>
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState
            title="No events"
            body="Create your first event and it will appear on the storefront immediately."
            action={
              <button type="button" onClick={openCreate} className={btnPrimary}>
                New event
              </button>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((e) => (
            <article
              key={e.id}
              className="overflow-hidden rounded-md border border-border bg-surface shadow-elevate"
            >
              {e.cover && (
                <img src={e.cover} alt="" className="aspect-video w-full object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="eyebrow text-[10px] text-muted-foreground">{e.kind}</p>
                    <h3 className="mt-1 truncate text-sm font-semibold tracking-tight">{e.name}</h3>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatEventDate(e.date)} · {e.location}
                </p>
                <div className="mt-4 flex items-center gap-1">
                  <button
                    type="button"
                    className={btnSubtle}
                    disabled={togglingFeatured}
                    onClick={async () => {
                      const ok = await toggleFeatured(e, events);
                      if (!ok) toast.error("Only three events can be featured at once");
                    }}
                  >
                    <Star size={14} className={e.featured ? "fill-primary text-primary" : ""} />
                    {e.featured ? "Featured" : "Feature"}
                  </button>
                  <button type="button" className={btnSubtle} onClick={() => openEdit(e)}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className={`${btnSubtle} hover:text-primary`}
                    onClick={() => setConfirm(e)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit event" : "New event"}
        footer={
          <>
            <button type="button" className={btnGhost} onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className={btnPrimary} onClick={submit} disabled={saving}>
              {saving ? "Saving…" : editing ? "Save changes" : "Create event"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Event name" error={errors["name"]}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="Night Market Vol. 4"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as EventKind })}
                className={inputCls}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}
                className={inputCls}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date" error={errors["date"]}>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Location" error={errors["location"]}>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={inputCls}
                placeholder="Warehouse 9, Berlin"
              />
            </Field>
          </div>
          <Field label="Description" error={errors["description"]}>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={`${inputCls} h-auto py-2.5`}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Feature on the storefront
          </label>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirm !== null}
        title="Delete event?"
        body="It will be removed from the admin list and the storefront events page."
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm) {
            try {
              await deleteEvent.mutateAsync(confirm.id);
              toast.success("Event deleted");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to delete");
            }
          }
          setConfirm(null);
        }}
      />
    </AdminShell>
  );
}