"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const SLIDES = [
    { src: "/hero-new.jpg", alt: "Group training session with TthePT", position: "50% 30%" },
    { src: "/gallery/img-2.jpg", alt: "Client doing a box jump", position: "50% 35%" },
    { src: "/gallery/img-3.jpg", alt: "Client training on the pull-up rig", position: "50% 25%" },
];

const SLIDE_MS = 6000;

// Full-bleed background slider: each image slowly zooms in while shown, then cross-fades to the next.
export function HeroSlider() {
    const [index, setIndex] = useState(0);
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        const timer = setTimeout(() => setIndex(i => (i + 1) % SLIDES.length), SLIDE_MS);
        return () => clearTimeout(timer);
    }, [index]);

    const slide = SLIDES[index];

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <AnimatePresence initial={false}>
                <motion.div
                    key={slide.src}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: reduceMotion ? 1 : 1.15 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        opacity: { duration: 1.2, ease: "easeInOut" },
                        scale: { duration: (SLIDE_MS + 1200) / 1000, ease: "linear" },
                    }}
                >
                    <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover opacity-85"
                        style={{ objectPosition: slide.position }}
                    />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30"></div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {SLIDES.map((s, i) => (
                    <button
                        key={s.src}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Show image ${i + 1} of ${SLIDES.length}`}
                        aria-current={i === index}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-500 cursor-pointer",
                            i === index ? "w-10 bg-primary" : "w-4 bg-white/40 hover:bg-white/70"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
