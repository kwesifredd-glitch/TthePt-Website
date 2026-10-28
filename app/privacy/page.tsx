import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
    title: "Privacy Policy | TthePT",
    description: "How TthePT collects, uses and protects your personal information.",
};

// DRAFT: review with the business owner before relying on it. Update LAST_UPDATED when edited.
const LAST_UPDATED = "28 October 2026";

const sections: { heading: string; body: React.ReactNode }[] = [
    {
        heading: "Who we are",
        body: (
            <p>
                TthePT is a personal training business. We are responsible for the personal information you give us
                through this website. If you have any questions about this policy or your information, contact us
                through our <Link href="/contact" className="text-primary underline">contact page</Link>.
            </p>
        ),
    },
    {
        heading: "What we collect",
        body: (
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Bookings:</strong> your name, email address, chosen package, and the date and time you book.</li>
                <li><strong>Contact form:</strong> your name, email address and the message you send us.</li>
                <li><strong>Meal plans sign-up:</strong> your email address, and your name and goals if you give them.</li>
                <li><strong>Payments:</strong> handled by Stripe. We never see or store your card details. Stripe tells us whether a payment succeeded and the amount.</li>
            </ul>
        ),
    },
    {
        heading: "How we use it",
        body: (
            <ul className="list-disc pl-5 space-y-2">
                <li>To arrange and run your training sessions, and contact you about them.</li>
                <li>To reply to your messages and questions.</li>
                <li>To keep records of bookings and payments, as the law requires for a business.</li>
            </ul>
        ),
    },
    {
        heading: "Our legal basis",
        body: (
            <p>
                We use your information to take steps you ask for before entering a contract with us (such as booking
                a session) and to perform that contract; to meet our legal obligations, such as keeping financial
                records; and, for replying to enquiries and meal plan sign-ups, our legitimate interest in responding
                to people who contact us. We do not send marketing emails without your consent.
            </p>
        ),
    },
    {
        heading: "Who we share it with",
        body: (
            <>
                <p>We do not sell your information. We only share it with the services that run this website:</p>
                <ul className="list-disc pl-5 space-y-2 mt-3">
                    <li><strong>Vercel</strong> hosts the website.</li>
                    <li><strong>Upstash</strong> stores booking and contact records.</li>
                    <li><strong>Stripe</strong> processes card payments.</li>
                </ul>
                <p className="mt-3">
                    Some of these providers may store data outside the UK. Where they do, they use legal safeguards
                    approved for UK data transfers.
                </p>
            </>
        ),
    },
    {
        heading: "How long we keep it",
        body: (
            <p>
                We keep booking and payment records for up to six years to meet tax and accounting rules. We delete
                enquiries and meal plan sign-ups that don&apos;t lead to a booking after two years, or sooner if you ask.
            </p>
        ),
    },
    {
        heading: "Cookies",
        body: (
            <p>
                This website does not use advertising or tracking cookies. Your browser may store a small note so the
                meal plans page remembers you have signed up. The staff login uses a cookie that only staff receive.
            </p>
        ),
    },
    {
        heading: "Your rights",
        body: (
            <>
                <p>
                    Under UK data protection law you can ask to see the information we hold about you, correct it,
                    delete it, or object to how we use it. Contact us through
                    our <Link href="/contact" className="text-primary underline">contact page</Link> and we will
                    respond within one month.
                </p>
                <p className="mt-3">
                    If you are unhappy with how we handle your information, you can complain to the Information
                    Commissioner&apos;s Office (ICO) at{" "}
                    <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" className="text-primary underline">ico.org.uk</a>.
                </p>
            </>
        ),
    },
];

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            <Navbar />
            <main className="flex-1 pt-32 pb-24">
                <div className="container-custom max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-3">
                        Privacy <span className="text-primary not-italic">Policy</span>
                    </h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-12">Last updated {LAST_UPDATED}</p>

                    <div className="glass-card rounded-[2rem] p-6 sm:p-10 space-y-10 text-gray-300 leading-relaxed">
                        {sections.map(section => (
                            <section key={section.heading}>
                                <h2 className="text-xl font-black uppercase italic tracking-tight text-white mb-3">{section.heading}</h2>
                                {section.body}
                            </section>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
