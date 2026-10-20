export const SHIP_LABEL: Record<string, string> = {
  AWAITING_PACKING: "Awaiting packing",
  PACKED: "Packed",
  LABEL_GENERATED: "Label generated",
  DISPATCHED: "Picked up",
  IN_TRANSIT: "In transit",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  DELIVERY_FAILED: "Delivery failed",
  RETURNED: "Returned to origin",
};

export const SHIP_BADGE: Record<string, string> = {
  AWAITING_PACKING: "bg-amber-100 text-amber-800",
  PACKED: "bg-blue-100 text-blue-800",
  LABEL_GENERATED: "bg-blue-100 text-blue-800",
  DISPATCHED: "bg-blue-100 text-blue-800",
  IN_TRANSIT: "bg-blue-100 text-blue-800",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  DELIVERY_FAILED: "bg-red-100 text-red-700",
  RETURNED: "bg-red-100 text-red-700",
};

export const COURIERS = ["Delhivery Surface", "Blue Dart", "DTDC", "Xpressbees"] as const;