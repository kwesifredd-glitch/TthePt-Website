import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'refunded';
export type PaymentPlatform = 'stripe' | 'paypal' | 'square' | 'manual' | 'webhook';

export type Booking = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    date: string; // ISO string YYYY-MM-DD
    time: string; // HH:mm
    package?: string;
    price?: number;
    currency?: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    paymentMethod?: string;
    paymentRef?: string;
    paidAt?: string;
    notes?: string;
    goals?: string;
    source?: 'website_booking' | 'contact_form' | 'manual_admin' | 'external_checkout';
    createdAt: string;
};

export type Payment = {
    id: string;
    bookingId?: string;
    clientName: string;
    clientEmail: string;
    amount: number;
    currency: string;
    platform: PaymentPlatform;
    status: 'succeeded' | 'pending' | 'failed' | 'refunded';
    referenceId: string;
    description?: string;
    eventType?: string;
    rawPayload?: Record<string, unknown>;
    createdAt: string;
};

export type Inquiry = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    objective: string;
    status: 'new' | 'contacted' | 'converted' | 'archived';
    createdAt: string;
};

export type GatewaySettings = {
    stripeEnabled: boolean;
    stripePublishableKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
    paypalEnabled: boolean;
    paypalClientId: string;
    paypalWebhookId: string;
    webhookSecretKey: string;
    currency: string;
};

export type Content = {
    heroTitle: string;
    heroSubtitle: string;
};

type DB = {
    bookings: Booking[];
    payments: Payment[];
    inquiries: Inquiry[];
    settings: {
        availableHours: string[];
        gateway: GatewaySettings;
    };
    content: Content;
};

// Keys are read from environment variables only and are never written to db.json
const SECRET_GATEWAY_FIELDS = [
    'stripePublishableKey',
    'stripeSecretKey',
    'stripeWebhookSecret',
    'webhookSecretKey',
] as const;

function envGatewaySecrets(): Pick<GatewaySettings, typeof SECRET_GATEWAY_FIELDS[number]> {
    return {
        stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
        stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        webhookSecretKey: process.env.WEBHOOK_SECRET || '',
    };
}

const defaultGatewaySettings: GatewaySettings = {
    stripeEnabled: true,
    paypalEnabled: false,
    paypalClientId: '',
    paypalWebhookId: '',
    currency: 'GBP',
    ...envGatewaySecrets()
};

const defaultDB: DB = {
    bookings: [],
    payments: [],
    inquiries: [],
    settings: {
        availableHours: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
        gateway: defaultGatewaySettings
    },
    content: {
        heroTitle: "Unlock Your True Potential",
        heroSubtitle: "Personalized training programs designed to help you build strength, lose weight, and transform your lifestyle."
    }
};

function readDB(): DB {
    if (!fs.existsSync(DB_PATH)) {
        writeDB(defaultDB);
        return defaultDB;
    }
    try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const data = JSON.parse(raw);

        // Normalize bookings so older records have status & paymentStatus
        const normalizedBookings: Booking[] = (data.bookings || []).map((b: Record<string, unknown>) => ({
            id: String(b.id || ''),
            name: String(b.name || ''),
            email: String(b.email || ''),
            phone: b.phone ? String(b.phone) : '',
            date: String(b.date || ''),
            time: String(b.time || ''),
            package: b.package ? String(b.package) : 'Single Session',
            price: typeof b.price === 'number' ? b.price : 30,
            currency: b.currency ? String(b.currency) : 'GBP',
            status: (b.status as BookingStatus) || 'confirmed',
            paymentStatus: (b.paymentStatus as PaymentStatus) || (b.status === 'confirmed' ? 'paid' : 'unpaid'),
            paymentMethod: b.paymentMethod ? String(b.paymentMethod) : undefined,
            paymentRef: b.paymentRef ? String(b.paymentRef) : undefined,
            paidAt: b.paidAt ? String(b.paidAt) : undefined,
            notes: b.notes ? String(b.notes) : undefined,
            goals: b.goals ? String(b.goals) : undefined,
            source: (b.source as Booking['source']) || 'website_booking',
            createdAt: b.createdAt ? String(b.createdAt) : new Date().toISOString()
        }));

        const normalizedSettings = {
            availableHours: data.settings?.availableHours || defaultDB.settings.availableHours,
            gateway: {
                ...defaultGatewaySettings,
                ...(data.settings?.gateway || {}),
                ...envGatewaySecrets()
            }
        };

        return {
            bookings: normalizedBookings,
            payments: data.payments || [],
            inquiries: data.inquiries || [],
            settings: normalizedSettings,
            content: { ...defaultDB.content, ...data?.content }
        };
    } catch {
        return defaultDB;
    }
}

function writeDB(db: DB) {
    const gateway: Partial<GatewaySettings> = { ...db.settings.gateway };
    for (const field of SECRET_GATEWAY_FIELDS) delete gateway[field];
    for (const legacy of ['paystackEnabled', 'paystackPublicKey', 'paystackSecretKey', 'paystackWebhookSecret']) {
        delete (gateway as Record<string, unknown>)[legacy];
    }
    const safe = { ...db, settings: { ...db.settings, gateway } };
    fs.writeFileSync(DB_PATH, JSON.stringify(safe, null, 2));
}

export const db = {
    // Bookings
    getBookings: (): Booking[] => {
        return readDB().bookings;
    },

    getBooking: (id: string): Booking | undefined => {
        return readDB().bookings.find(b => b.id === id);
    },

    addBooking: (booking: Booking): Booking => {
        const data = readDB();
        data.bookings.unshift(booking);
        writeDB(data);
        return booking;
    },

    updateBooking: (id: string, updates: Partial<Booking>): Booking | null => {
        const data = readDB();
        const index = data.bookings.findIndex(b => b.id === id);
        if (index === -1) return null;
        data.bookings[index] = { ...data.bookings[index], ...updates };
        writeDB(data);
        return data.bookings[index];
    },

    deleteBooking: (id: string): boolean => {
        const data = readDB();
        const initialLength = data.bookings.length;
        data.bookings = data.bookings.filter(b => b.id !== id);
        if (data.bookings.length !== initialLength) {
            writeDB(data);
            return true;
        }
        return false;
    },

    // Payments
    getPayments: (): Payment[] => {
        return readDB().payments;
    },

    addPayment: (payment: Payment): Payment => {
        const data = readDB();
        data.payments.unshift(payment);
        writeDB(data);
        return payment;
    },

    updatePayment: (id: string, updates: Partial<Payment>): Payment | null => {
        const data = readDB();
        const index = data.payments.findIndex(p => p.id === id);
        if (index === -1) return null;
        data.payments[index] = { ...data.payments[index], ...updates };
        writeDB(data);
        return data.payments[index];
    },

    // Inquiries
    getInquiries: (): Inquiry[] => {
        return readDB().inquiries;
    },

    addInquiry: (inquiry: Inquiry): Inquiry => {
        const data = readDB();
        data.inquiries.unshift(inquiry);
        writeDB(data);
        return inquiry;
    },

    updateInquiry: (id: string, updates: Partial<Inquiry>): Inquiry | null => {
        const data = readDB();
        const index = data.inquiries.findIndex(i => i.id === id);
        if (index === -1) return null;
        data.inquiries[index] = { ...data.inquiries[index], ...updates };
        writeDB(data);
        return data.inquiries[index];
    },

    deleteInquiry: (id: string): boolean => {
        const data = readDB();
        const initialLength = data.inquiries.length;
        data.inquiries = data.inquiries.filter(i => i.id !== id);
        if (data.inquiries.length !== initialLength) {
            writeDB(data);
            return true;
        }
        return false;
    },

    // Availability
    getAvailableSlots: (date: string): string[] => {
        const data = readDB();
        const bookedTimes = data.bookings
            .filter(b => b.date === date && b.status === "confirmed")
            .map(b => b.time);

        let available = data.settings.availableHours.filter(time => !bookedTimes.includes(time));

        // Filter out past time slots if the selected date is today
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (date === todayStr) {
            const currentHour = now.getHours();
            const currentMin = now.getMinutes();
            available = available.filter(slot => {
                const [h, m] = slot.split(':').map(Number);
                if (h > currentHour) return true;
                if (h === currentHour && m > currentMin) return true;
                return false;
            });
        }

        return available;
    },

    // Gateway & Settings
    getSettings: () => {
        return readDB().settings;
    },

    updateSettings: (settingsUpdates: Partial<DB['settings']>) => {
        const data = readDB();
        data.settings = {
            ...data.settings,
            ...settingsUpdates,
            gateway: {
                ...data.settings.gateway,
                ...(settingsUpdates.gateway || {})
            }
        };
        writeDB(data);
        return data.settings;
    },

    // Content
    getContent: () => readDB().content,
    updateContent: (content: Partial<Content>) => {
        const data = readDB();
        data.content = { ...data.content, ...content };
        writeDB(data);
        return data.content;
    },

    // Aggregated Stats
    getStats: () => {
        const data = readDB();
        const bookings = data.bookings;
        const payments = data.payments;

        // Total collected from succeeded payments or confirmed & paid bookings
        const paymentRevenue = payments
            .filter(p => p.status === 'succeeded')
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const paidBookingsRevenue = bookings
            .filter(b => b.paymentStatus === 'paid' && !payments.some(p => p.bookingId === b.id && p.status === 'succeeded'))
            .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

        const totalRevenue = paymentRevenue + paidBookingsRevenue;

        const pendingPaymentAmount = bookings
            .filter(b => b.paymentStatus !== 'paid' && b.status !== 'cancelled')
            .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

        return {
            totalRevenue,
            totalBookings: bookings.length,
            confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
            paidBookings: bookings.filter(b => b.paymentStatus === 'paid').length,
            pendingPaymentsCount: bookings.filter(b => b.paymentStatus !== 'paid' && b.status !== 'cancelled').length,
            pendingPaymentAmount,
            totalInquiries: data.inquiries.length,
            newInquiries: data.inquiries.filter(i => i.status === 'new').length,
            totalTransactions: payments.length,
            recentBookings: bookings.slice(0, 5),
            recentPayments: payments.slice(0, 5)
        };
    }
};
