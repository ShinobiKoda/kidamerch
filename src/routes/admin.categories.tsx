import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  ConfirmDialog,
  EmptyState,
  Field,
  Panel,
  PanelHead,
  btnGhost,
  btnPrimary,
  btnSubtle,
  inputCls,
} from "@/components/admin/parts";
import { useAdminProducts } from "@/hooks/admin/useAdminProducts";
import {
  useAdminCategories,
  useCreateCategory,
  useRenameCategory,
  useDeleteCategory,
} from "@/hooks/admin/useAdminCategories";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories — KidaMerch Operations" },
      {
        name: "description",
        content: "Create, rename and remove catalogue categories for the KidaMerch storefront.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories = [], isLoading } = useAdminCategories();
  const { data: products = [] } = useAdminProducts();
  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const deleteCategory = useDeleteCategory();

  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null); // category id
  const [editValue, setEditValue] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; name: string } | null>(null);
  const [reassign, setReassign] = useState("");

  const productCountByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [products]);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );
  const others = useMemo(
    () => sorted.filter((c) => c.id !== confirm?.id),
    [sorted, confirm],
  );

  const add = async () => {
    if (!draft.trim()) return;
    try {
      await createCategory.mutateAsync({ name: draft.trim() });
      toast.success("Category added", { description: draft.trim() });
      setDraft("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That category already exists");
    }
  };

  const saveRename = async (id: string) => {
    if (!editValue.trim()) {
      toast.error("Pick a unique, non-empty name");
      return;
    }
    try {
      await renameCategory.mutateAsync({ id, name: editValue.trim() });
      toast.success("Category renamed");
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Pick a unique, non-empty name");
    }
  };

  return (
    <AdminShell
      title="Categories"
      description="Categories group the catalogue and power the storefront filters. Renaming one updates every product using it."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHead title={`All categories (${sorted.length})`} />
          {isLoading ? (
            <EmptyState title="Loading…" body="Fetching categories." />
          ) : sorted.length === 0 ? (
            <EmptyState title="No categories yet" body="Add your first category to start grouping products." />
          ) : (
            <ul className="divide-y divide-border">
              {sorted.map((c) => {
                const count = productCountByCategory[c.name] ?? 0;
                const isEditing = editing === c.id;
                return (
                  <li key={c.id} className="px-4 py-3.5">
                    {isEditing ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveRename(c.id)}
                          aria-label={`Rename ${c.name}`}
                          className={`${inputCls} min-w-40 flex-1`}
                        />
                        <button type="button" className={btnPrimary} onClick={() => saveRename(c.id)}>
                          Save
                        </button>
                        <button
                          type="button"
                          className={btnSubtle}
                          aria-label="Cancel rename"
                          onClick={() => setEditing(null)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm border border-border bg-surface-2 text-muted-foreground">
                          <Tags size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold tracking-tight">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {count} {count === 1 ? "product" : "products"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link
                            to="/admin/products"
                            className={btnSubtle}
                            aria-label={`View ${c.name} products`}
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            className={btnSubtle}
                            aria-label={`Rename ${c.name}`}
                            onClick={() => {
                              setEditing(c.id);
                              setEditValue(c.name);
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className={btnSubtle}
                            aria-label={`Delete ${c.name}`}
                            onClick={() => {
                              setConfirm({ id: c.id, name: c.name });
                              setReassign("");
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel>
          <PanelHead title="Add category" />
          <div className="space-y-4 p-4">
            <Field label="Name" hint="Shown on the storefront filters.">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="Outerwear"
                className={inputCls}
              />
            </Field>
            <button type="button" onClick={add} className={`${btnPrimary} w-full`} disabled={createCategory.isPending}>
              <Plus size={15} /> Add category
            </button>
            <p className="text-xs text-muted-foreground">
              Deleting a category lets you move its products elsewhere, or remove them with it.
            </p>
          </div>
        </Panel>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={`Delete "${confirm?.name ?? ""}"?`}
        body={
          confirm && (productCountByCategory[confirm.name] ?? 0) > 0
            ? `${productCountByCategory[confirm.name]} product(s) use this category. Choose where they should go.`
            : "No products use this category, so it can be removed safely."
        }
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm) {
            try {
              await deleteCategory.mutateAsync({ id: confirm.id, reassignTo: reassign || undefined });
              toast.success(reassign ? `Products moved to ${reassign}` : `"${confirm.name}" deleted`);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to delete category");
            }
          }
          setConfirm(null);
        }}
      >
        {confirm && (productCountByCategory[confirm.name] ?? 0) > 0 && (
          <Field label="Move products to">
            <select
              value={reassign}
              onChange={(e) => setReassign(e.target.value)}
              className={inputCls}
            >
              <option value="">Delete the products too</option>
              {others.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        )}
      </ConfirmDialog>

      <div className="mt-4 flex">
        <Link to="/admin/products" className={btnGhost}>
          Back to products
        </Link>
      </div>
    </AdminShell>
  );
}