import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export const matchTime = (value: string) => new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
export const matchDate = (value: string) => new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date(value));
export const shortDate = (value: string) => new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date(value));
