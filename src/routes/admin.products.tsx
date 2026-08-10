import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Copy, PackagePlus, Pencil, Search, Trash2, Loader2, UploadCloud } from "lucide-react";
import { useMemo, useState, useRef } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { getUploadSignature } from "@/api/cloudinary";
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
import { EASE } from "@/components/Reveal";
import { formatPrice } from "@/data/products";
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProducts,
  useDuplicateProduct,
  useBulkSetActive,
} from "@/hooks/admin/useAdminProducts";
import { useAdminCategories } from "@/hooks/admin/useAdminCategories";
import type { Product } from "@/types/storefront";
import type { CreateProductInput } from "@/types/admin";
import { useStoreSettings } from "@/hooks/admin/useAdminSettings";

export const Route = createFileRoute("/admin/products")({
  component: ProductsPage,
});

const PER_PAGE = 8;

type DisplayStatus = "Active" | "Draft" | "Out of Stock";
type FormStatus = "Active" | "Draft";

type ImageItem = {
  url: string;
  isUploading?: boolean;
  preview?: string;
  abortController?: AbortController;
};

type FormState = {
  name: string;
  category: string;
  price: string;
  description: string;
  status: FormStatus;
  stock: string;
  variants: { label: string; stock: string }[];
  images: ImageItem[];
};

const emptyForm = (category: string): FormState => ({
  name: "",
  category,
  price: "",
  description: "",
  status: "Draft",
  stock: "0",
  variants: [],
  images: [],
});

function isPlaceholderVariant(v: Product["variants"][number]) {
  return !v.size && !v.color && !v.design;
}

function totalStock(p: Product) {
  return (p.variants ?? []).reduce((sum, v) => sum + (v.stock ?? 0), 0);
}

function displayStatus(p: Product): DisplayStatus {
  if (totalStock(p) === 0) return "Out of Stock";
  return p.isActive ? "Active" : "Draft";
}

const toForm = (p: Product): FormState => {
  const realVariants = (p.variants ?? []).filter((v) => !isPlaceholderVariant(v));
  const placeholder = (p.variants ?? []).find(isPlaceholderVariant);

  return {
    name: p.name,
    category: p.category,
    price: String(p.basePrice),
    description: p.description ?? "",
    status: p.isActive ? "Active" : "Draft",
    stock: String(placeholder?.stock ?? 0),
    variants: realVariants.map((v) => ({
      label: v.size || v.color || v.design || "",
      stock: String(v.stock ?? 0),
    })),
    images: (p.images ?? []).map((img) => ({ url: img.url })),
  };
};

function formToInput(form: FormState): CreateProductInput {
  const realVariants = form.variants.filter((v) => v.label.trim());

  return {
    name: form.name.trim(),
    category: form.category,
    basePrice: Number(form.price),
    description: form.description.trim(),
    isActive: form.status === "Active",
    variants:
      realVariants.length > 0
        ? realVariants.map((v) => ({
            size: v.label.trim(),
            color: null,
            design: null,
            sku: null,
            priceOverride: null,
            stock: Number(v.stock) || 0,
          }))
        : [
            {
              size: null,
              color: null,
              design: null,
              sku: null,
              priceOverride: null,
              stock: Number(form.stock) || 0,
            },
          ],
    imageUrls: form.images.map((u) => u.url.trim()).filter(Boolean),
  };
}

function ProductsPage() {
  const { data: products = [], isLoading } = useAdminProducts();
  const { data: categoryRows = [] } = useAdminCategories();
  const { data: storeSettings } = useStoreSettings();
  const lowStockThreshold = storeSettings?.lowStockThreshold ?? 5;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProducts = useDeleteProducts();
  const duplicateProduct = useDuplicateProduct();
  const bulkSetActive = useBulkSetActive();

  const categories = useMemo(
    () => [...categoryRows].map((c) => c.name).sort((a, b) => a.localeCompare(b)),
    [categoryRows],
  );

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("updated");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(""));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<string[] | null>(null);

  const filtered = useMemo(() => {
    const list = products.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = category === "all" || p.category === category;
      const matchesStatus = status === "all" || displayStatus(p) === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.basePrice - b.basePrice);
    if (sort === "price-desc") sorted.sort((a, b) => b.basePrice - a.basePrice);
    if (sort === "stock") sorted.sort((a, b) => totalStock(a) - totalStock(b));
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "updated")
      sorted.sort((a, b) => +new Date(b.createdAt || "") - +new Date(a.createdAt || ""));
    return sorted;
  }, [products, query, category, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const allChecked = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(categories[0] ?? ""));
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm(toForm(p));
    setErrors({});
    setFormOpen(true);
  };

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next["name"] = "Name is required.";
    if (!form.category) next["category"] = "Pick a category.";
    const price = Number(form.price);
    if (!form.price || Number.isNaN(price) || price <= 0) next["price"] = "Enter a price above 0.";
    if (!form.description.trim() || form.description.trim().length < 10)
      next["description"] = "Add at least 10 characters.";
    if (form.variants.length === 0 && Number(form.stock) < 0)
      next["stock"] = "Stock cannot be negative.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const input = formToInput(form);

    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, input });
        toast.success("Product updated", { description: input.name });
      } else {
        await createProduct.mutateAsync(input);
        toast.success("Product created", { description: `${input.name} is live in the store` });
      }
      setFormOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    e.target.value = ""; // reset

    const newImages: ImageItem[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 10MB limit`);
        continue;
      }
      validFiles.push(file);
      const abortController = new AbortController();
      newImages.push({
        url: "",
        preview: URL.createObjectURL(file),
        isUploading: true,
        abortController,
      });
    }

    if (!validFiles.length) return;

    setForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i] as File;
      const imageItem = newImages[i] as ImageItem;
      
      try {
        const sig = await getUploadSignature();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sig.apiKey);
        formData.append("timestamp", sig.timestamp.toString());
        formData.append("signature", sig.signature);
        formData.append("folder", sig.folder);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
          method: "POST",
          body: formData,
          signal: imageItem.abortController?.signal ?? null,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        
        setForm((prev) => {
          const idx = prev.images.findIndex((img) => img.abortController === imageItem.abortController);
          if (idx === -1) return prev; // cancelled
          
          const copy = [...prev.images];
          const updated = { ...copy[idx], url: data.secure_url, isUploading: false };
          delete updated.preview;
          delete updated.abortController;
          copy[idx] = updated;
          return { ...prev, images: copy };
        });
      } catch (err: any) {
        if (err.name === "AbortError") return;
        toast.error(`Failed to upload ${file.name}`);
        setForm((prev) => ({
          ...prev,
          images: prev.images.filter((img) => img.abortController !== imageItem.abortController)
        }));
      }
    }
  };

  const saving = createProduct.isPending || updateProduct.isPending;

  return (
    <AdminShell
      title="Products"
      description="Create, edit and organise the catalogue. Anything marked Active appears in the storefront immediately."
      actions={
        <button type="button" onClick={openCreate} className={btnPrimary}>
          <PackagePlus size={15} /> New product
        </button>
      }
    >
      <Panel>
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <div className="relative min-w-45 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search products"
              className={`${inputCls} pl-9`}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputCls} w-auto`}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${inputCls} w-auto`}
          >
            <option value="all">All statuses</option>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={`${inputCls} w-auto`}
          >
            <option value="updated">Recently updated</option>
            <option value="name">Name A–Z</option>
            <option value="price-asc">Price low–high</option>
            <option value="price-desc">Price high–low</option>
            <option value="stock">Lowest stock</option>
          </select>
        </div>

        {selected.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5"
          >
            <span className="text-xs font-semibold">{selected.length} selected</span>
            <button
              type="button"
              className={btnSubtle}
              onClick={async () => {
                const targets = products.filter((p) => selected.includes(p.id));
                await bulkSetActive.mutateAsync({ products: targets, isActive: true });
                toast.success("Marked active");
              }}
            >
              Mark active
            </button>
            <button
              type="button"
              className={btnSubtle}
              onClick={async () => {
                const targets = products.filter((p) => selected.includes(p.id));
                await bulkSetActive.mutateAsync({ products: targets, isActive: false });
                toast.success("Moved to draft");
              }}
            >
              Move to draft
            </button>
            <button
              type="button"
              className={`${btnSubtle} text-primary hover:text-primary`}
              onClick={() => setConfirm(selected)}
            >
              Delete
            </button>
          </motion.div>
        )}

        {isLoading ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState
            title="No products match"
            body="Try clearing the filters, or create your first product for this view."
            action={
              <button type="button" onClick={openCreate} className={btnPrimary}>
                New product
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Select all"
                      checked={allChecked}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? Array.from(new Set([...selected, ...rows.map((r) => r.id)]))
                            : selected.filter((id) => !rows.some((r) => r.id === id)),
                        )
                      }
                    />
                  </th>
                  <th className="px-2 py-3 text-xs font-semibold text-muted-foreground">Product</th>
                  <th className="px-2 py-3 text-xs font-semibold text-muted-foreground">
                    Category
                  </th>
                  <th className="px-2 py-3 text-xs font-semibold text-muted-foreground">Price</th>
                  <th className="px-2 py-3 text-xs font-semibold text-muted-foreground">Stock</th>
                  <th className="px-2 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const stock = totalStock(p);
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/40"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Select ${p.name}`}
                          checked={selected.includes(p.id)}
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? [...selected, p.id]
                                : selected.filter((id) => id !== p.id),
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          {p.images?.[0]?.url && (
                            <img
                              src={p.images[0].url}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-sm object-cover"
                            />
                          )}
                          <span className="font-medium tracking-tight">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-muted-foreground">{p.category}</td>
                      <td className="px-2 py-3 tabular-nums">{formatPrice(p.basePrice)}</td>
                      <td className="px-2 py-3 tabular-nums">
                        <span
                          className={
                            stock > 0 && stock <= lowStockThreshold
                              ? "font-semibold text-primary"
                              : ""
                          }
                        >
                          {stock}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <StatusBadge status={displayStatus(p)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            aria-label={`Edit ${p.name}`}
                            onClick={() => openEdit(p)}
                            className={btnSubtle}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Duplicate ${p.name}`}
                            onClick={async () => {
                              await duplicateProduct.mutateAsync(p);
                              toast.success("Duplicated as draft");
                            }}
                            className={btnSubtle}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${p.name}`}
                            onClick={() => setConfirm([p.id])}
                            className={`${btnSubtle} hover:text-primary`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {filtered.length} product{filtered.length === 1 ? "" : "s"} · page {current} of{" "}
              {pages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
                className={btnGhost}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
                className={btnGhost}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Panel>

      <SlideOver
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit product" : "New product"}
        footer={
          <>
            <button type="button" className={btnGhost} onClick={() => setFormOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="button" className={btnPrimary} onClick={submit} disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" error={errors["name"]}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
              placeholder="Ronin Heavyweight Hoodie"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors["category"]}>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={inputCls}
              >
                <option value="" disabled>
                  {categories.length ? "Select a category" : "No categories yet"}
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as FormStatus })}
                className={inputCls}
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </Field>
            <Field label="Price (USD)" error={errors["price"]}>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                inputMode="decimal"
                className={inputCls}
                placeholder="128"
              />
            </Field>
          </div>

          <Field label="Description" error={errors["description"]}>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={`${inputCls} h-auto py-2.5`}
              placeholder="Materials, fit, finish…"
            />
          </Field>

          {form.variants.length === 0 && (
            <Field label="Stock" error={errors["stock"]}>
              <input
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                inputMode="numeric"
                className={inputCls}
              />
            </Field>
          )}

          <div>
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[10px] text-muted-foreground">Images</span>
              <div className="flex gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  className={btnSubtle}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud size={14} /> Upload
                </button>
                <button
                  type="button"
                  className={btnSubtle}
                  onClick={() => setForm({ ...form, images: [...form.images, { url: "" }] })}
                >
                  Add link
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload images directly or paste URLs. The first one is the main product image. Max size: 10MB.
            </p>
            <div className="mt-2 space-y-2">
              {form.images.map((img, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-sm border border-border bg-surface-2 text-[10px] text-muted-foreground">
                    {img.isUploading && (
                      <div className="absolute inset-0 z-10 grid place-items-center bg-background/50">
                        <Loader2 size={16} className="animate-spin text-primary" />
                      </div>
                    )}
                    {img.preview || img.url.trim() ? (
                      <img src={img.preview || img.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <input
                    value={img.url}
                    onChange={(e) => {
                      const images = [...form.images];
                      images[i] = { ...images[i], url: e.target.value };
                      setForm({ ...form, images });
                    }}
                    placeholder={img.isUploading ? "Uploading..." : "https://… "}
                    aria-label={`Image URL ${i + 1}`}
                    className={inputCls}
                    disabled={img.isUploading}
                  />
                  <button
                    type="button"
                    aria-label={img.isUploading ? "Cancel upload" : "Remove image"}
                    onClick={() => {
                      if (img.isUploading && img.abortController) {
                        img.abortController.abort();
                      }
                      setForm({ ...form, images: form.images.filter((_, j) => j !== i) });
                    }}
                    className={`${btnSubtle} shrink-0`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[10px] text-muted-foreground">Variants</span>
              <button
                type="button"
                className={btnSubtle}
                onClick={() =>
                  setForm({ ...form, variants: [...form.variants, { label: "", stock: "0" }] })
                }
              >
                Add variant
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {form.variants.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No variants — the product uses a single stock count.
                </p>
              )}
              {form.variants.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={v.label}
                    onChange={(e) => {
                      const variants = [...form.variants];
                      variants[i] = { ...v, label: e.target.value };
                      setForm({ ...form, variants });
                    }}
                    placeholder="Size / colour"
                    className={inputCls}
                  />
                  <input
                    value={v.stock}
                    onChange={(e) => {
                      const variants = [...form.variants];
                      variants[i] = { ...v, stock: e.target.value };
                      setForm({ ...form, variants });
                    }}
                    inputMode="numeric"
                    className={`${inputCls} w-24`}
                  />
                  <button
                    type="button"
                    aria-label="Remove variant"
                    onClick={() =>
                      setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })
                    }
                    className={`${btnSubtle} shrink-0`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-border bg-surface-2 p-4">
            <p className="eyebrow text-[10px] text-muted-foreground">Storefront preview</p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold tracking-tight">
                  {form.name || "Untitled product"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {form.category || "No category"}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-primary tabular-nums">
                {formatPrice(Number(form.price) || 0)}
              </p>
            </div>
          </div>
        </div>
      </SlideOver>

      <ConfirmDialog
        open={confirm !== null}
        loading={deleteProducts.isPending}
        title={
          confirm && confirm.length > 1 ? `Delete ${confirm.length} products?` : "Delete product?"
        }
        body="This permanently removes the item from the catalogue and the storefront. This cannot be undone."
        onCancel={() => setConfirm(null)}
        onConfirm={async () => {
          if (confirm) {
            try {
              await deleteProducts.mutateAsync(confirm);
              setSelected([]);
              toast.success(
                confirm.length > 1 ? `${confirm.length} products deleted` : "Product deleted",
              );
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
