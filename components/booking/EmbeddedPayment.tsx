"use client";

import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

// Stripe's card form, shown inside the booking page's payment step
export function EmbeddedPayment({ clientSecret }: { clientSecret: string }) {
    if (!stripePromise) {
        return (
            <p role="alert" className="text-sm font-bold text-red-300">
                Online payment isn&apos;t available right now. Please get in touch to book.
            </p>
        );
    }

    return (
        <div className="rounded-[2rem] overflow-hidden bg-white min-h-[420px]">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    );
}
