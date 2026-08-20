import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

export type Booking = {
    id: string;
    name: string;
    email: string;
    date: string; // ISO string YYYY-MM-DD
    time: string; // HH:mm
    package?: string;
    price?: number;
    status: 'confirmed' | 'cancelled';
    createdAt: string;
};

export type Content = {
    heroTitle: string;
    heroSubtitle: string;
};

type DB = {
    bookings: Booking[];
    settings: {
        availableHours: string[]; // ["09:00", "10:00", ...]
    },
    content: Content;
};

const defaultDB: DB = {
    bookings: [],
    settings: {
        availableHours: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"]
    },
    content: {
        heroTitle: "Unlock Your True Potential",
        heroSubtitle: "Personalized training programs designed to help you build strength, lose weight, and transform your lifestyle."
    }
};

function readDB(): DB {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
        return defaultDB;
    }
    try {
        const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
        // Ensure content exists even if reading old DB
        return { ...defaultDB, ...data, content: { ...defaultDB.content, ...data?.content } };
    } catch (e) {
        return defaultDB;
    }
}

function writeDB(db: DB) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const db = {
    getBookings: () => readDB().bookings,
    addBooking: (booking: Booking) => {
        const data = readDB();
        data.bookings.push(booking);
        writeDB(data);
        return booking;
    },
    getAvailableSlots: (date: string) => {
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
    getContent: () => readDB().content,
    updateContent: (content: Partial<Content>) => {
        const data = readDB();
        data.content = { ...data.content, ...content };
        writeDB(data);
        return data.content;
    }
};
