import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrdersApi } from "@/api/admin/orders";
import type { Order, UpdateOrderInput, OrderStatus } from "@/types/admin";

export const adminOrderKeys = {
  all: ["admin", "orders"] as const,
  detail: (id: string) => [...adminOrderKeys.all, "detail", id] as const,
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "processing",
  processing: "shipped",
  shipped: "delivered",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function useAdminOrders() {
  return useQuery<Order[], Error>({
    queryKey: adminOrderKeys.all,
    queryFn: adminOrdersApi.getAll,
    staleTime: 1000 * 30,
  });
}

export function useAdminOrder(id: string) {
  return useQuery<Order, Error>({
    queryKey: adminOrderKeys.detail(id),
    queryFn: () => adminOrdersApi.getById(id),
    enabled: !!id,
  });
}

function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, { id: string; input: UpdateOrderInput }>({
    mutationFn: ({ id, input }) => adminOrdersApi.update(id, input),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
      queryClient.setQueryData(adminOrderKeys.detail(order.id), order);
    },
  });
}

export function useAdvanceOrder() {
  const update = useUpdateOrder();
  return {
    ...update,
    mutateAsync: (order: Order) => {
      const next = NEXT_STATUS[order.status];
      if (!next) return Promise.resolve(order);
      return update.mutateAsync({
        id: order.id,
        input: { status: next, historyLabel: `Marked ${STATUS_LABEL[next]}` },
      });
    },
  };
}

export function useSetOrderStatus() {
  const update = useUpdateOrder();
  return {
    ...update,
    mutateAsync: (args: { id: string; status: OrderStatus; reason?: string | undefined }) =>
      //
      update.mutateAsync({
        id: args.id,
        input: {
          status: args.status,
          reason: args.reason,
          paymentStatus: args.status === "refunded" ? "refunded" : undefined,
          historyLabel: `Marked ${STATUS_LABEL[args.status]}`,
        },
      }),
  };
}

export function useSetTracking() {
  const update = useUpdateOrder();
  return {
    ...update,
    mutateAsync: (args: { id: string; tracking: string }) =>
      update.mutateAsync({
        id: args.id,
        input: { trackingNumber: args.tracking, historyLabel: `Tracking added: ${args.tracking}` },
      }),
  };
}
