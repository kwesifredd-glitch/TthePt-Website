"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface AnimatedSectionProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    direction?: "up" | "down" | "left" | "right" | "none";
    delay?: number;
    duration?: number;
    distance?: number;
    scale?: number;
    className?: string;
    once?: boolean;
}

export function AnimatedSection({
    children,
    direction = "up",
    delay = 0,
    duration = 0.6,
    distance = 30,
    scale = 1,
    className = "",
    once = true,
    ...props
}: AnimatedSectionProps) {
    const getInitialPosition = () => {
        switch (direction) {
            case "up":
                return { y: distance, opacity: 0, scale };
            case "down":
                return { y: -distance, opacity: 0, scale };
            case "left":
                return { x: distance, opacity: 0, scale };
            case "right":
                return { x: -distance, opacity: 0, scale };
            case "none":
                return { opacity: 0, scale };
            default:
                return { y: distance, opacity: 0, scale };
        }
    };

    return (
        <motion.div
            initial={getInitialPosition()}
            whileInView={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
                transition: {
                    duration,
                    delay,
                    ease: [0.25, 0.1, 0.25, 1.0],
                },
            }}
            viewport={{ once, margin: "-50px" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({
    children,
    staggerChildren = 0.1,
    delayChildren = 0,
    className = "",
    once = true,
    ...props
}: {
    children: React.ReactNode;
    staggerChildren?: number;
    delayChildren?: number;
    className?: string;
    once?: boolean;
    [key: string]: any;
}) {
    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once, margin: "-50px" }}
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: {
                        staggerChildren,
                        delayChildren,
                    },
                },
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = "",
    direction = "up",
    distance = 25,
}: {
    children: React.ReactNode;
    className?: string;
    direction?: "up" | "down" | "left" | "right" | "none";
    distance?: number;
}) {
    const getOffset = () => {
        switch (direction) {
            case "up":
                return { y: distance };
            case "down":
                return { y: -distance };
            case "left":
                return { x: distance };
            case "right":
                return { x: -distance };
            default:
                return { y: distance };
        }
    };

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, ...getOffset() },
                show: {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    transition: {
                        duration: 0.5,
                        ease: [0.25, 0.1, 0.25, 1.0],
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
