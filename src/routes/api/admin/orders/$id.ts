// src/routes/api/admin/orders/$id.ts
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireRole, AuthError } from "@/server/utils/require-role";
import { transformOrder } from "@/lib/helpers";
import type { UpdateOrderInput } from "@/types/admin";

async function loadOrder(id: string) {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !order) throw new Error("Order not found");

  const { data: items } = await supabaseAdmin.from("order_items").select("*").eq("order_id", id);
  const { data: history } = await supabaseAdmin
    .from("order_history")
    .select("*")
    .eq("order_id", id);

  let email = "";
  if (order.user_id && !order.guest_email) {
    const { data } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
    email = data?.user?.email ?? "";
  }

  return transformOrder(order, items ?? [], history ?? [], email, email || "Guest");
}

export const Route = createFileRoute("/api/admin/orders/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          await requireRole(request, "admin");
          return Response.json(await loadOrder(params.id));
        } catch (err) {
          if (err instanceof AuthError) return err;
          return Response.json({ message: (err as Error).message }, { status: 500 });
        }
      },

      PUT: async ({ request, params }) => {
        try {
          await requireRole(request, "admin");
          const body = (await request.json()) as UpdateOrderInput;

          const updates: {
            status?: string;
            payment_status?: string;
            tracking_number?: string;
            reason?: string;
          } = {};

          if (body.status) updates.status = body.status;
          if (body.paymentStatus) updates.payment_status = body.paymentStatus;
          if (body.trackingNumber !== undefined) updates.tracking_number = body.trackingNumber;
          if (body.reason !== undefined) updates.reason = body.reason;

          if (Object.keys(updates).length) {
            const { error } = await supabaseAdmin
              .from("orders")
              .update(updates)
              .eq("id", params.id);
            if (error) throw new Error(`Database Error: ${error.message}`);
          }

          if (body.historyLabel) {
            const { error } = await supabaseAdmin
              .from("order_history")
              .insert({ order_id: params.id, label: body.historyLabel });
            if (error) throw new Error(`Database Error: ${error.message}`);
          }

          return Response.json(await loadOrder(params.id));
        } catch (err) {
          if (err instanceof AuthError) return err;
          return Response.json({ message: (err as Error).message }, { status: 500 });
        }
      },
    },
  },
});
