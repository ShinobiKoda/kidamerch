import apparel from "@/assets/p-apparel.jpg";
import figure from "@/assets/p-figure.jpg";
import accessory from "@/assets/p-accessory.jpg";
import print from "@/assets/p-print.jpg";
import hero from "@/assets/hero-figure.jpg";

export type Category = "Apparel" | "Figures" | "Accessories" | "Prints";

export type Product = {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  images: string[];
  variants: string[];
  inStock: boolean;
  popularity: number;
  createdAt: string;
  tag?: string;
};

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const NO_VARIANT: string[] = [];
const PRINT_SIZES = ["A3", "A2", "A1"];

export const products: Product[] = [
  {
    id: "ronin-heavyweight-hoodie",
    name: "Ronin Heavyweight Hoodie",
    category: "Apparel",
    price: 128,
    description:
      "480gsm loopback cotton, boxed shoulder, and a single hand-pulled brushstroke across the chest. Garment-dyed in small batches so no two drops match exactly.",
    images: [apparel, hero],
    variants: APPAREL_SIZES,
    inStock: true,
    popularity: 98,
    createdAt: "2026-07-28",
    tag: "Drop 04",
  },
  {
    id: "crimson-blade-statue",
    name: "Crimson Blade 1/7 Statue",
    category: "Figures",
    price: 289,
    description:
      "Hand-painted polystone statue on a machined base. 24cm tall with dual-blade stance and a matte lacquer finish that holds shadow beautifully.",
    images: [figure, hero],
    variants: NO_VARIANT,
    inStock: true,
    popularity: 95,
    createdAt: "2026-07-30",
    tag: "Limited 300",
  },
  {
    id: "impact-frame-print",
    name: "Impact Frame Risograph Print",
    category: "Prints",
    price: 46,
    description:
      "Two-colour risograph on 300gsm cotton rag. Halftone speed lines and one confident stroke of crimson. Signed and numbered on the reverse.",
    images: [print, apparel],
    variants: PRINT_SIZES,
    inStock: true,
    popularity: 74,
    createdAt: "2026-07-20",
  },
  {
    id: "sigil-enamel-pin-set",
    name: "Sigil Enamel Pin Set",
    category: "Accessories",
    price: 32,
    description:
      "Six hard-enamel pins in blackened brass with rubber clutch backs. Comes carded on recycled board.",
    images: [accessory, print],
    variants: NO_VARIANT,
    inStock: true,
    popularity: 61,
    createdAt: "2026-07-18",
  },
  {
    id: "nightfall-boxy-tee",
    name: "Nightfall Boxy Tee",
    category: "Apparel",
    price: 68,
    description:
      "Heavy 260gsm jersey with a dropped shoulder and cropped body. Screen-printed back panel, minimal front hit.",
    images: [apparel, print],
    variants: APPAREL_SIZES,
    inStock: true,
    popularity: 88,
    createdAt: "2026-07-26",
  },
  {
    id: "silent-vigil-figure",
    name: "Silent Vigil Deluxe Figure",
    category: "Figures",
    price: 214,
    description:
      "Articulated 1/9 scale collector figure with three swappable hands, a fabric cape, and a display stand milled from aluminium.",
    images: [figure, accessory],
    variants: NO_VARIANT,
    inStock: false,
    popularity: 92,
    createdAt: "2026-07-12",
  },
  {
    id: "brushwork-cap",
    name: "Brushwork 6-Panel Cap",
    category: "Accessories",
    price: 54,
    description:
      "Unstructured washed twill cap with tonal embroidery and a woven inner label. Adjustable metal clasp.",
    images: [accessory, apparel],
    variants: ["One Size"],
    inStock: true,
    popularity: 55,
    createdAt: "2026-07-08",
  },
  {
    id: "ink-study-triptych",
    name: "Ink Study Triptych",
    category: "Prints",
    price: 92,
    description:
      "Three-panel giclée set exploring negative space and single-stroke composition. Sold as a matched edition of 150.",
    images: [print, figure],
    variants: PRINT_SIZES,
    inStock: true,
    popularity: 67,
    createdAt: "2026-07-04",
  },
  {
    id: "shadowline-work-jacket",
    name: "Shadowline Work Jacket",
    category: "Apparel",
    price: 218,
    description:
      "Waxed cotton chore jacket with corozo buttons, storm cuffs, and a crimson bar-tack at the hem.",
    images: [apparel, hero],
    variants: APPAREL_SIZES,
    inStock: true,
    popularity: 81,
    createdAt: "2026-06-30",
  },
  {
    id: "wandering-scholar-figure",
    name: "Wandering Scholar Mini",
    category: "Figures",
    price: 74,
    description:
      "10cm hand-cast resin mini with a hand-finished patina. Weighted base, no assembly required.",
    images: [figure, print],
    variants: NO_VARIANT,
    inStock: true,
    popularity: 49,
    createdAt: "2026-06-26",
  },
  {
    id: "keeper-canvas-tote",
    name: "Keeper Canvas Tote",
    category: "Accessories",
    price: 48,
    description:
      "16oz natural canvas tote with reinforced webbing handles, interior pocket, and a discreet screen print.",
    images: [accessory, apparel],
    variants: NO_VARIANT,
    inStock: true,
    popularity: 58,
    createdAt: "2026-06-22",
  },
  {
    id: "speedline-poster",
    name: "Speedline Offset Poster",
    category: "Prints",
    price: 28,
    description:
      "Large-format offset poster on uncoated stock. Ships rolled in a rigid tube.",
    images: [print, accessory],
    variants: ["A2", "A1"],
    inStock: true,
    popularity: 44,
    createdAt: "2026-06-18",
  },
  {
    id: "duel-panel-crewneck",
    name: "Duel Panel Crewneck",
    category: "Apparel",
    price: 112,
    description:
      "Brushed-back fleece crewneck with a spliced panel construction and ribbed side gussets.",
    images: [apparel, figure],
    variants: APPAREL_SIZES,
    inStock: true,
    popularity: 76,
    createdAt: "2026-06-14",
  },
  {
    id: "oni-mask-bust",
    name: "Oni Mask Wall Bust",
    category: "Figures",
    price: 168,
    description:
      "Wall-mounted resin bust with a hand-lacquered finish. Includes flush-mount hardware.",
    images: [figure, hero],
    variants: NO_VARIANT,
    inStock: true,
    popularity: 70,
    createdAt: "2026-06-10",
  },
  {
    id: "kanji-chain-necklace",
    name: "Cast Chain Necklace",
    category: "Accessories",
    price: 88,
    description:
      "Stainless steel curb chain with a cast pendant and a lobster clasp. 55cm length.",
    images: [accessory, print],
    variants: NO_VARIANT,
    inStock: false,
    popularity: 52,
    createdAt: "2026-06-06",
  },
  {
    id: "quiet-city-print",
    name: "Quiet City Screenprint",
    category: "Prints",
    price: 58,
    description:
      "Four-layer screenprint of an empty midnight street. Deep blacks, one crimson streetlight.",
    images: [print, apparel],
    variants: PRINT_SIZES,
    inStock: true,
    popularity: 64,
    createdAt: "2026-06-02",
  },
  {
    id: "drop-zero-cargo",
    name: "Drop Zero Cargo Pant",
    category: "Apparel",
    price: 164,
    description:
      "Relaxed ripstop cargo with articulated knees, cinch hems, and six pockets.",
    images: [apparel, accessory],
    variants: ["28", "30", "32", "34", "36"],
    inStock: true,
    popularity: 72,
    createdAt: "2026-05-28",
  },
  {
    id: "twin-blade-diorama",
    name: "Twin Blade Diorama",
    category: "Figures",
    price: 342,
    description:
      "Full diorama scene with LED underlighting, two figures, and a sculpted rock base. Assembled to order.",
    images: [figure, hero],
    variants: NO_VARIANT,
    inStock: true,
    popularity: 90,
    createdAt: "2026-05-24",
    tag: "Limited 120",
  },
  {
    id: "utility-belt-bag",
    name: "Utility Belt Bag",
    category: "Accessories",
    price: 96,
    description:
      "Cordura belt bag with a magnetic buckle, three internal dividers, and a webbing strap.",
    images: [accessory, apparel],
    variants: NO_VARIANT,
    inStock: true,
    popularity: 60,
    createdAt: "2026-05-20",
  },
  {
    id: "storyboard-zine",
    name: "Storyboard Zine Vol. 2",
    category: "Prints",
    price: 24,
    description:
      "64-page saddle-stitched zine of process sketches, layouts, and panel studies.",
    images: [print, figure],
    variants: NO_VARIANT,
    inStock: true,
    popularity: 41,
    createdAt: "2026-05-16",
  },
  {
    id: "monochrome-scarf",
    name: "Monochrome Knit Scarf",
    category: "Accessories",
    price: 76,
    description:
      "Lambswool scarf with a fine intarsia stripe and hand-knotted fringe.",
    images: [accessory, print],
    variants: NO_VARIANT,
    inStock: true,
    popularity: 38,
    createdAt: "2026-05-12",
  },
  {
    id: "sentinel-varsity",
    name: "Sentinel Varsity Jacket",
    category: "Apparel",
    price: 298,
    description:
      "Melton wool body, leather sleeves, chenille patchwork, and a quilted satin lining.",
    images: [apparel, hero],
    variants: APPAREL_SIZES,
    inStock: true,
    popularity: 94,
    createdAt: "2026-05-08",
    tag: "Archive",
  },
  {
    id: "ember-lantern-figure",
    name: "Ember Lantern Figure",
    category: "Figures",
    price: 132,
    description:
      "1/12 scale figure holding a translucent resin lantern that catches warm light.",
    images: [figure, accessory],
    variants: NO_VARIANT,
    inStock: true,
    popularity: 66,
    createdAt: "2026-05-04",
  },
  {
    id: "grid-study-print",
    name: "Grid Study Letterpress",
    category: "Prints",
    price: 68,
    description:
      "Blind-deboss letterpress on heavy cotton stock. Sculptural, almost textless.",
    images: [print, apparel],
    variants: ["A3", "A2"],
    inStock: true,
    popularity: 47,
    createdAt: "2026-04-30",
  },
];

export const categories: { name: Category; blurb: string; image: string }[] = [
  { name: "Apparel", blurb: "Heavyweight cut-and-sew", image: apparel },
  { name: "Figures", blurb: "Hand-finished collectibles", image: figure },
  { name: "Accessories", blurb: "Everyday hardware", image: accessory },
  { name: "Prints", blurb: "Editions & paper goods", image: print },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
