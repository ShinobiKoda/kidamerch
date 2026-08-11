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

export const STATUS_LABEL: Record<OrderStatus, string> = {
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

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation<Order, Error, { id: string; input: UpdateOrderInput }, { prevDetail: Order | undefined; prevAll: Order[] | undefined }>({
    mutationFn: ({ id, input }) => adminOrdersApi.update(id, input),

    onMutate: async ({ id, input }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: adminOrderKeys.all });
      await queryClient.cancelQueries({ queryKey: adminOrderKeys.detail(id) });

      // Snapshot current cache for rollback
      const prevDetail = queryClient.getQueryData<Order>(adminOrderKeys.detail(id));
      const prevAll = queryClient.getQueryData<Order[]>(adminOrderKeys.all);

      // Optimistically update the detail cache
      if (prevDetail) {
        queryClient.setQueryData<Order>(adminOrderKeys.detail(id), {
          ...prevDetail,
          ...(input.status ? { status: input.status } : {}),
          ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
          ...(input.trackingNumber ? { trackingNumber: input.trackingNumber } : {}),
        });
      }

      // Optimistically update the list cache
      if (prevAll) {
        queryClient.setQueryData<Order[]>(adminOrderKeys.all, prevAll.map((o) =>
          o.id === id
            ? {
                ...o,
                ...(input.status ? { status: input.status } : {}),
                ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
                ...(input.trackingNumber ? { trackingNumber: input.trackingNumber } : {}),
              }
            : o
        ));
      }

      return { prevDetail, prevAll };
    },

    onError: (_err, { id }, context) => {
      // Roll back to previous cache on failure
      if (context?.prevDetail) {
        queryClient.setQueryData(adminOrderKeys.detail(id), context.prevDetail);
      }
      if (context?.prevAll) {
        queryClient.setQueryData(adminOrderKeys.all, context.prevAll);
      }
    },

    onSettled: (_data, _err, { id }) => {
      // Refetch to get the server's authoritative state
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(id) });
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
