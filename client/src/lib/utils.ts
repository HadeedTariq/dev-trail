import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      hour12: true,
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const colorMap: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  teal: "bg-teal-500",
  indigo: "bg-indigo-500",
  lime: "bg-lime-500",
  fuchsia: "bg-fuchsia-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  black: "bg-black text-white",
  white: "bg-white border border-gray-300 text-black",
  gray: "bg-gray-500",
  brown: "bg-amber-600",
  gold: "bg-yellow-400",
  silver: "bg-gray-300",
  cream: "bg-amber-50",
  beige: "bg-amber-100",
  tan: "bg-amber-200",
  maroon: "bg-red-700",
  navy: "bg-blue-800",
  olive: "bg-lime-700",
};

export const genders = ["male", "female", "other"] as const;

export const errorParser = (parsed: any) => {
  const fieldErrors = parsed?.error?.flatten?.().fieldErrors;

  const errorMessages = Object.entries(fieldErrors)
    .filter(([_, messages]: any) => messages && messages.length > 0)
    .map(([field, messages]: [string, any]) => {
      const fieldName =
        field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
      return `• ${fieldName}: ${messages.join(", ")}`;
    })
    .join("\n");

  return errorMessages.trim();
};

export const validateImage = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxFileSize = 6 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      resolve("Please upload JPG, PNG, or WEBP images.");
      return;
    }

    if (file.size > maxFileSize) {
      resolve("Image size should be less than 6MB.");
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      URL.revokeObjectURL(objectUrl);

      if (width < 1000 || height < 1000) {
        resolve("Image should be at least 1000 × 1000 pixels.");
        return;
      }

      const aspectRatio = width / height;

      if (aspectRatio < 0.9 || aspectRatio > 1.1) {
        resolve(
          "For best layout results, we recommend uploading square images (1:1 ratio).",
        );
        return;
      }

      resolve(null);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve("Invalid image file.");
    };

    img.src = objectUrl;
  });
};
