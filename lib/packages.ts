// Training packages offered on the booking page. The server uses this list for prices,
// so a booking can never be created at a price the browser made up.
export type TrainingPackage = {
    id: string;
    name: string;
    price: number;
    desc: string;
    highlight: boolean;
};

export const PACKAGES: TrainingPackage[] = [
    {
        id: "single",
        name: "1-to-1 session",
        price: 35,
        desc: "A single one-to-one session.",
        highlight: false
    },
    {
        id: "biweekly",
        name: "2 days a week",
        price: 55,
        desc: "Two sessions a week for steady progress.",
        highlight: false
    },
    {
        id: "weekly",
        name: "3x a week",
        price: 75,
        desc: "Three sessions a week for faster results.",
        highlight: true
    },
    {
        id: "monthly",
        name: "12 Sessions a month",
        price: 280,
        desc: "Twelve sessions across the month.",
        highlight: false
    }
];

export function findPackage(name: unknown): TrainingPackage | undefined {
    return PACKAGES.find(p => p.name === name);
}
