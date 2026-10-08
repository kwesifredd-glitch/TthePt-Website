"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3 w-full text-white", className)}
            classNames={{
                months: "flex flex-col space-y-4 w-full",
                month: "space-y-6 w-full",
                month_caption: "flex justify-center pt-1 relative items-center mb-4 h-10 text-primary font-black italic uppercase tracking-[0.2em]",
                caption_label: "text-sm font-black italic uppercase tracking-[0.2em] text-primary",
                nav: "flex items-center absolute w-full left-0 justify-between px-2 z-10",
                button_previous: cn(
                    "h-8 w-8 bg-white/5 p-0 opacity-50 hover:opacity-100 border border-white/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all text-white"
                ),
                button_next: cn(
                    "h-8 w-8 bg-white/5 p-0 opacity-50 hover:opacity-100 border border-white/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all text-white"
                ),
                month_grid: "w-full border-collapse",
                weekdays: "flex w-full",
                weekday: "text-gray-400 flex-1 font-black text-[0.7rem] uppercase tracking-tighter text-center py-2",
                weeks: "space-y-2",
                week: "flex w-full",
                day: cn(
                    "flex-1 aspect-square p-0 font-bold text-sm relative flex items-center justify-center transition-all duration-300 rounded-xl hover:bg-primary/20 hover:text-white"
                ),
                day_button: "w-full h-full flex items-center justify-center rounded-xl transition-all text-white hover:text-white",
                selected: "!bg-primary !text-white shadow-[0_5px_15px_rgba(255,77,0,0.4)]",
                today: "bg-white/10 text-primary border border-primary/30",
                outside: "text-gray-600 opacity-30",
                disabled: "text-gray-700 opacity-20 cursor-not-allowed",
                range_middle: "bg-white/5 text-white",
                hidden: "invisible",
                ...classNames,
            }}
            {...props}
        />
    )
}
Calendar.displayName = "Calendar"

export { Calendar }

