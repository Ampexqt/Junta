import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr: string = "MMM dd, yyyy") {
    if (!date) return "";
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        return format(d, formatStr);
    } catch (e) {
        return String(date);
    }
}
