import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products as seedProducts, type Category, type Product } from "@/data/products";
import { events as seedEvents, isUpcoming, type Event } from "@/data/events";

/* ------------------------------------------------------------------ types */

export type ProductStatus = "Active" | "Draft" | "Out of Stock";

export type AdminProduct = Product & {
  stock: number;
  compareAtPrice: number | null;
  status: ProductStatus;
  updatedAt: string;
  /** stock per variant label; key "—" when the product has no variants */
  variantStock: Record<string, number>;
};

export type EventStatus = "Upcoming" | "Past" | "Cancelled";

export type AdminEvent = Event & {
  status: EventStatus;
  featured: boolean;
};

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export type PaymentStatus = "Paid" | "Unpaid" | "Refunded";

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  variant: string | null;
  qty: number;
  price: number;
};

export type OrderEvent = { at: string; label: string };

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  address: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  payment: PaymentStatus;
  status: OrderStatus;
  tracking: string | null;
  reason: string | null;
  history: OrderEvent[];
};

export type StockAdjustment = {
  id: string;
  productId: string;
  productName: string;
  variant: string;
  delta: number;
  reason: "Restock" | "Damaged" | "Correction";
  at: string;
};

export type ProductInput = {
  name: string;
  description: string;
  category: Category | string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  status: ProductStatus;
  variants: { label: string; stock: number }[];
  images: string[];
};

export type EventInput = {
  name: string;
  kind: Event["kind"];
  date: string;
  location: string;
  description: string;
  cover: string;
  gallery: string[];
  status: EventStatus;
  featured: boolean;
};

export type OrderDraft = Omit<
  Order,
  "id" | "createdAt" | "history" | "status" | "payment"
> & { id?: string };

export const DEFAULT_LOW_STOCK_THRESHOLD = 8;
export const NO_VARIANT_KEY = "—";

/* ---------------------------------------------------------------- seeding */

function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function seedProductList(): AdminProduct[] {
  const rand = lcg(42);
  return seedProducts.map((p) => {
    const labels = p.variants.length ? p.variants : [NO_VARIANT_KEY];
    const variantStock: Record<string, number> = {};
    for (const label of labels) {
      variantStock[label] = p.inStock ? Math.round(2 + rand() * 22) : 0;
    }
    const stock = Object.values(variantStock).reduce((a, b) => a + b, 0);
    return {
      ...p,
      stock,
      compareAtPrice: rand() > 0.7 ? Math.round(p.price * 1.25) : null,
      status: p.inStock ? ("Active" as ProductStatus) : ("Out of Stock" as ProductStatus),
      updatedAt: p.createdAt,
      variantStock,
    };
  });
}

function seedEventList(): AdminEvent[] {
  return seedEvents.map((e, i) => ({
    ...e,
    status: isUpcoming(e.date) ? "Upcoming" : "Past",
    featured: i < 3 && isUpcoming(e.date),
  }));
}

const NAMES = [
  ["Mika Tanaka", "mika.tanaka@example.com", "14 Sakura Lane, Tokyo, JP"],
  ["Jonas Weber", "jonas.weber@example.com", "9 Kreuzberg Str., Berlin, DE"],
  ["Amara Osei", "amara.osei@example.com", "42 Marina Rd., Lagos, NG"],
  ["Elena Ruiz", "elena.ruiz@example.com", "77 Calle Sur, Madrid, ES"],
  ["Owen Park", "owen.park@example.com", "310 Dundas St W, Toronto, CA"],
  ["Sofia Lima", "sofia.lima@example.com", "5 Rua Alta, Lisbon, PT"],
  ["Dean Whitfield", "dean.whitfield@example.com", "88 Ludgate Hill, London, UK"],
  ["Nina Kovač", "nina.kovac@example.com", "12 Dockside, Rotterdam, NL"],
];

const FLOW: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];

function seedOrderList(list: AdminProduct[]): Order[] {
  const rand = lcg(1337);
  const orders: Order[] = [];
  for (let i = 0; i < 24; i++) {
    const person = NAMES[i % NAMES.length]!;
    const itemCount = 1 + Math.floor(rand() * 3);
    const items: OrderItem[] = [];
    for (let j = 0; j < itemCount; j++) {
      const p = list[Math.floor(rand() * list.length)]!;
      items.push({
        productId: p.id,
        name: p.name,
        image: p.images[0]!,
        variant: p.variants[0] ?? null,
        qty: 1 + Math.floor(rand() * 2),
        price: p.price,
      });
    }
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const shipping = subtotal > 250 ? 0 : 14;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const day = new Date(2026, 6, 30 - i * 1.2).toISOString();
    const roll = rand();
    const status: OrderStatus =
      roll > 0.93 ? "Cancelled" : FLOW[Math.min(3, Math.floor(i / 3))] ?? "Pending";
    orders.push({
      id: `KG-${2400 + i}`,
      customerName: person[0]!,
      customerEmail: person[1]!,
      address: person[2]!,
      createdAt: day,
      items,
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax,
      payment: status === "Cancelled" ? "Unpaid" : "Paid",
      status,
      tracking: status === "Shipped" || status === "Delivered" ? `KGX${918000 + i}DE` : null,
      reason: null,
      history: [{ at: day, label: "Order placed" }],
    });
  }
  return orders;
}

export function makeSalesSeries(days: number) {
  const rand = lcg(days === 7 ? 7 : 30);
  const out: { label: string; revenue: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const base = days === 7 ? 2200 : 1800;
    const revenue = Math.round(base + rand() * 2600);
    out.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue,
      orders: Math.max(1, Math.round(revenue / 240)),
    });
  }
  return out;
}

/* -------------------------------------------------------------- persisted */

type Persisted = {
  products: AdminProduct[];
  events: AdminEvent[];
  orders: Order[];
  adjustments: StockAdjustment[];
  categories: string[];
  lowStockThreshold: number;
};


const KEY = "kurogane.data.v1";
const SESSION_KEY = "kurogane.admin.session";

export const ADMIN_EMAIL = "admin@store.com";
export const ADMIN_PASSWORD = "admin123";

function initial(): Persisted {
  const products = seedProductList();
  return {
    products,
    events: seedEventList(),
    orders: seedOrderList(products),
    adjustments: [],
    categories: Array.from(new Set(products.map((p) => p.category as string))),
    lowStockThreshold: DEFAULT_LOW_STOCK_THRESHOLD,
  };
}

const uid = () => Math.random().toString(36).slice(2, 9);
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `item-${uid()}`;

const sumStock = (v: Record<string, number>) => Object.values(v).reduce((a, b) => a + b, 0);

/* --------------------------------------------------------------- provider */

type DataValue = Persisted & {
  ready: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  getProductById: (id: string) => AdminProduct | undefined;
  storefrontProducts: AdminProduct[];
  categories: string[];
  productCountByCategory: Record<string, number>;
  createCategory: (name: string) => boolean;
  renameCategory: (from: string, to: string) => boolean;
  deleteCategory: (name: string, reassignTo?: string) => void;
  setLowStockThreshold: (value: number) => void;

  createProduct: (input: ProductInput) => AdminProduct;
  updateProduct: (id: string, input: ProductInput) => void;
  duplicateProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;
  bulkStatus: (ids: string[], status: ProductStatus) => void;
  createEvent: (input: EventInput) => void;
  updateEvent: (id: string, input: EventInput) => void;
  deleteEvent: (id: string) => void;
  toggleFeatured: (id: string) => boolean;
  setVariantStock: (productId: string, variant: string, qty: number) => void;
  adjustStock: (
    productId: string,
    variant: string,
    delta: number,
    reason: StockAdjustment["reason"],
  ) => void;
  placeOrder: (order: OrderDraft) => Order;
  advanceOrder: (id: string) => void;
  setOrderStatus: (id: string, status: OrderStatus, reason?: string) => void;
  setTracking: (id: string, tracking: string) => void;
};

const DataContext = createContext<DataValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => initial());
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        if (parsed?.products?.length) {
          setState({
            products: parsed.products,
            events: parsed.events ?? seedEventList(),
            orders: parsed.orders ?? [],
            adjustments: parsed.adjustments ?? [],
            categories:
              parsed.categories ??
              Array.from(new Set(parsed.products.map((p) => p.category as string))),
            lowStockThreshold: parsed.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
          });
        }
      }
      setIsAdmin(localStorage.getItem(SESSION_KEY) === "1");
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota — ignore for the prototype */
    }
  }, [state, ready]);

  const patch = useCallback((fn: (prev: Persisted) => Persisted) => setState(fn), []);

  const login = useCallback((email: string, password: string) => {
    const ok = email.trim().length > 0 && password.length > 0;
    if (ok) {
      localStorage.setItem(SESSION_KEY, "1");
      setIsAdmin(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  }, []);

  const fromInput = useCallback(
    (input: ProductInput, base?: AdminProduct): AdminProduct => {
      const variantStock: Record<string, number> = {};
      if (input.variants.length) {
        for (const v of input.variants) variantStock[v.label] = Math.max(0, v.stock);
      } else {
        variantStock[NO_VARIANT_KEY] = Math.max(0, input.stock);
      }
      const stock = sumStock(variantStock);
      return {
        id: base?.id ?? `${slug(input.name)}-${uid()}`,
        name: input.name,
        category: input.category as Category,
        price: input.price,
        description: input.description,
        images: input.images.length ? input.images : (base?.images ?? []),
        variants: input.variants.map((v) => v.label),
        inStock: stock > 0 && input.status === "Active",
        popularity: base?.popularity ?? 50,
        createdAt: base?.createdAt ?? new Date().toISOString().slice(0, 10),
        ...(base?.tag ? { tag: base.tag } : {}),
        stock,
        compareAtPrice: input.compareAtPrice,
        status: stock === 0 && input.status === "Active" ? "Out of Stock" : input.status,
        updatedAt: new Date().toISOString(),
        variantStock,
      };
    },
    [],
  );

  const createProduct = useCallback(
    (input: ProductInput) => {
      const product = fromInput(input);
      patch((prev) => ({ ...prev, products: [product, ...prev.products] }));
      return product;
    },
    [fromInput, patch],
  );

  const updateProduct = useCallback(
    (id: string, input: ProductInput) => {
      patch((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === id ? fromInput(input, p) : p)),
      }));
    },
    [fromInput, patch],
  );

  const duplicateProduct = useCallback(
    (id: string) => {
      patch((prev) => {
        const src = prev.products.find((p) => p.id === id);
        if (!src) return prev;
        const copy: AdminProduct = {
          ...src,
          id: `${slug(src.name)}-copy-${uid()}`,
          name: `${src.name} (Copy)`,
          status: "Draft",
          updatedAt: new Date().toISOString(),
        };
        const idx = prev.products.findIndex((p) => p.id === id);
        const next = [...prev.products];
        next.splice(idx + 1, 0, copy);
        return { ...prev, products: next };
      });
    },
    [patch],
  );

  const deleteProducts = useCallback(
    (ids: string[]) =>
      patch((prev) => ({ ...prev, products: prev.products.filter((p) => !ids.includes(p.id)) })),
    [patch],
  );

  const bulkStatus = useCallback(
    (ids: string[], status: ProductStatus) =>
      patch((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          ids.includes(p.id)
            ? { ...p, status, inStock: status === "Active" && p.stock > 0, updatedAt: new Date().toISOString() }
            : p,
        ),
      })),
    [patch],
  );

  const createCategory = useCallback(
    (name: string) => {
      const clean = name.trim();
      let ok = false;
      setState((prev) => {
        if (!clean || prev.categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
          return prev;
        }
        ok = true;
        return { ...prev, categories: [...prev.categories, clean] };
      });
      return ok;
    },
    [],
  );

  const renameCategory = useCallback((from: string, to: string) => {
    const clean = to.trim();
    let ok = false;
    setState((prev) => {
      if (
        !clean ||
        prev.categories.some((c) => c.toLowerCase() === clean.toLowerCase() && c !== from)
      ) {
        return prev;
      }
      ok = true;
      return {
        ...prev,
        categories: prev.categories.map((c) => (c === from ? clean : c)),
        products: prev.products.map((p) =>
          p.category === from ? { ...p, category: clean as Category } : p,
        ),
      };
    });
    return ok;
  }, []);

  const deleteCategory = useCallback(
    (name: string, reassignTo?: string) =>
      patch((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c !== name),
        products: reassignTo
          ? prev.products.map((p) =>
              p.category === name ? { ...p, category: reassignTo as Category } : p,
            )
          : prev.products.filter((p) => p.category !== name),
      })),
    [patch],
  );

  const setLowStockThreshold = useCallback(
    (value: number) =>
      patch((prev) => ({
        ...prev,
        lowStockThreshold: Math.max(1, Math.min(999, Math.round(value) || 1)),
      })),
    [patch],
  );


  const createEvent = useCallback(
    (input: EventInput) =>
      patch((prev) => ({
        ...prev,
        events: [{ id: `${slug(input.name)}-${uid()}`, ...input }, ...prev.events],
      })),
    [patch],
  );

  const updateEvent = useCallback(
    (id: string, input: EventInput) =>
      patch((prev) => ({
        ...prev,
        events: prev.events.map((e) => (e.id === id ? { ...e, ...input } : e)),
      })),
    [patch],
  );

  const deleteEvent = useCallback(
    (id: string) => patch((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== id) })),
    [patch],
  );

  const toggleFeatured = useCallback(
    (id: string) => {
      let allowed = true;
      setState((prev) => {
        const target = prev.events.find((e) => e.id === id);
        if (!target) return prev;
        const count = prev.events.filter((e) => e.featured).length;
        if (!target.featured && count >= 3) {
          allowed = false;
          return prev;
        }
        return {
          ...prev,
          events: prev.events.map((e) => (e.id === id ? { ...e, featured: !e.featured } : e)),
        };
      });
      return allowed;
    },
    [],
  );

  const setVariantStock = useCallback(
    (productId: string, variant: string, qty: number) =>
      patch((prev) => ({
        ...prev,
        products: prev.products.map((p) => {
          if (p.id !== productId) return p;
          const variantStock = { ...p.variantStock, [variant]: Math.max(0, qty) };
          const stock = sumStock(variantStock);
          return {
            ...p,
            variantStock,
            stock,
            status: stock === 0 && p.status === "Active" ? "Out of Stock" : p.status,
            inStock: stock > 0 && p.status !== "Draft",
            updatedAt: new Date().toISOString(),
          };
        }),
      })),
    [patch],
  );

  const adjustStock = useCallback(
    (productId: string, variant: string, delta: number, reason: StockAdjustment["reason"]) =>
      patch((prev) => {
        const product = prev.products.find((p) => p.id === productId);
        if (!product) return prev;
        const current = product.variantStock[variant] ?? 0;
        const variantStock = { ...product.variantStock, [variant]: Math.max(0, current + delta) };
        const stock = sumStock(variantStock);
        return {
          ...prev,
          products: prev.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  variantStock,
                  stock,
                  inStock: stock > 0 && p.status !== "Draft",
                  status: stock === 0 && p.status === "Active" ? "Out of Stock" : p.status,
                  updatedAt: new Date().toISOString(),
                }
              : p,
          ),
          adjustments: [
            {
              id: uid(),
              productId,
              productName: product.name,
              variant,
              delta,
              reason,
              at: new Date().toISOString(),
            },
            ...prev.adjustments,
          ].slice(0, 60),
        };
      }),
    [patch],
  );

  const placeOrder = useCallback(
    (draft: OrderDraft) => {
      const now = new Date().toISOString();
      const order: Order = {
        ...draft,
        id: draft.id ?? `KG-${Math.floor(2500 + Math.random() * 400)}`,
        createdAt: now,
        status: "Pending",
        payment: "Paid",
        history: [{ at: now, label: "Order placed from storefront" }],
      } as Order;
      patch((prev) => ({ ...prev, orders: [order, ...prev.orders] }));
      return order;
    },
    [patch],
  );

  const pushHistory = (order: Order, label: string): Order => ({
    ...order,
    history: [...order.history, { at: new Date().toISOString(), label }],
  });

  const advanceOrder = useCallback(
    (id: string) =>
      patch((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => {
          if (o.id !== id) return o;
          const idx = FLOW.indexOf(o.status);
          if (idx < 0 || idx === FLOW.length - 1) return o;
          const next = FLOW[idx + 1]!;
          return pushHistory({ ...o, status: next }, `Status advanced to ${next}`);
        }),
      })),
    [patch],
  );

  const setOrderStatus = useCallback(
    (id: string, status: OrderStatus, reason?: string) =>
      patch((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === id
            ? pushHistory(
                {
                  ...o,
                  status,
                  reason: reason ?? o.reason,
                  payment: status === "Refunded" ? "Refunded" : o.payment,
                },
                `Marked ${status}${reason ? ` — ${reason}` : ""}`,
              )
            : o,
        ),
      })),
    [patch],
  );

  const setTracking = useCallback(
    (id: string, tracking: string) =>
      patch((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === id ? pushHistory({ ...o, tracking }, `Tracking added: ${tracking}`) : o,
        ),
      })),
    [patch],
  );

  const value = useMemo<DataValue>(() => {
    const categories = Array.from(
      new Set([...state.categories, ...state.products.map((p) => p.category as string)]),
    );
    const productCountByCategory: Record<string, number> = {};
    for (const c of categories) productCountByCategory[c] = 0;
    for (const p of state.products) {
      productCountByCategory[p.category] = (productCountByCategory[p.category] ?? 0) + 1;
    }
    return {
      ...state,
      ready,
      isAdmin,
      login,
      logout,
      categories,
      productCountByCategory,
      createCategory,
      renameCategory,
      deleteCategory,
      setLowStockThreshold,
      storefrontProducts: state.products.filter((p) => p.status !== "Draft"),
      getProductById: (id: string) => state.products.find((p) => p.id === id),
      createProduct,
      updateProduct,
      duplicateProduct,
      deleteProducts,
      bulkStatus,
      createEvent,
      updateEvent,
      deleteEvent,
      toggleFeatured,
      setVariantStock,
      adjustStock,
      placeOrder,
      advanceOrder,
      setOrderStatus,
      setTracking,
    };
  }, [
    state,
    ready,
    isAdmin,
    login,
    logout,
    createProduct,
    createCategory,
    renameCategory,
    deleteCategory,
    setLowStockThreshold,
    updateProduct,
    duplicateProduct,
    deleteProducts,
    bulkStatus,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleFeatured,
    setVariantStock,
    adjustStock,
    placeOrder,
    advanceOrder,
    setOrderStatus,
    setTracking,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

/* ------------------------------------------------------------- selectors */

export function useCustomers() {
  const { orders } = useData();
  return useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; orders: Order[]; spent: number; last: string }
    >();
    for (const o of orders) {
      const entry = map.get(o.customerEmail) ?? {
        name: o.customerName,
        email: o.customerEmail,
        orders: [],
        spent: 0,
        last: o.createdAt,
      };
      entry.orders.push(o);
      if (o.status !== "Cancelled" && o.status !== "Refunded") entry.spent += o.total;
      if (o.createdAt > entry.last) entry.last = o.createdAt;
      map.set(o.customerEmail, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.spent - a.spent);
  }, [orders]);
}
