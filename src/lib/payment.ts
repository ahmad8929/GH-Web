import type { Order } from "@/lib/api/types";

/**
 * Payment abstraction. Checkout creates the order first (backend marks it
 * `unpaid`), then hands it to the selected provider. A real gateway slots in
 * by adding a provider here — checkout code does not change.
 */

export type PaymentResult = {
  status: "unpaid" | "paid";
  reference?: string;
};

export interface PaymentProvider {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  pay(order: Order): Promise<PaymentResult>;
}

const payOnDelivery: PaymentProvider = {
  id: "cod",
  label: "Pay on delivery",
  description: "Pay in cash or UPI when your order arrives.",
  enabled: true,
  async pay() {
    return { status: "unpaid" };
  },
};

const onlinePayment: PaymentProvider = {
  id: "online",
  label: "Pay online",
  description: "Cards, UPI, and netbanking — coming soon.",
  enabled: false,
  async pay() {
    throw new Error("Online payments are not available yet");
  },
};

export const paymentProviders: PaymentProvider[] = [
  payOnDelivery,
  onlinePayment,
];

export function getPaymentProvider(id: string): PaymentProvider {
  const provider = paymentProviders.find((p) => p.id === id && p.enabled);
  if (!provider) throw new Error("Select a valid payment method");
  return provider;
}
