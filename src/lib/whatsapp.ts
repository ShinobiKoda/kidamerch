const WHATSAPP_NUMBER = "2348105503361";

interface CartLineLike {
  line: {
    qty: number;
    variant?: { size?: string | null; color?: string | null; design?: string | null } | null;
  };
  product: { name: string; basePrice: number };
}

function formatUSD(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function buildWhatsAppOrderMessage(
  lines: CartLineLike[],
  total: number,
): string {
  const itemLines = lines.map(({ line, product }) => {
    const variantLabel = line.variant
      ? line.variant.size || line.variant.color || line.variant.design
      : null;
    const suffix = variantLabel ? ` (${variantLabel})` : "";
    return `• ${product.name}${suffix} × ${line.qty}`;
  });

  const message = [
    "Hi! I'd like to order the following from KidaMerch:",
    "",
    ...itemLines,
    "",
    `Estimated total: ${formatUSD(total)}`,
    "",
    "Can you confirm availability and next steps?",
  ].join("\n");

  return message;
}

export function buildWhatsAppLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}