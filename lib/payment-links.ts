// Stripe Payment Links, keyed by package name. A package without a link is paid in person.
export const STRIPE_PAYMENT_LINKS: Record<string, string> = {
    "1-to-1 session": "https://buy.stripe.com/14A7sN1HO6Od0sf8q43Ru03",
    "2 days a week": "https://buy.stripe.com/aFa4gB5Y47Shb6TeOs3Ru04",
    "3x a week": "https://buy.stripe.com/00w28t0DKc8x6QD35K3Ru05",
    "12 Sessions a month": "https://buy.stripe.com/fZu00l4U0fkJej5fSw3Ru00",
};

export function stripeCheckoutUrl(packageName: string | undefined, email: string, bookingId: string): string | null {
    const link = packageName ? STRIPE_PAYMENT_LINKS[packageName] : undefined;
    if (!link) return null;
    const url = new URL(link);
    url.searchParams.set("prefilled_email", email);
    url.searchParams.set("client_reference_id", bookingId);
    return url.toString();
}
