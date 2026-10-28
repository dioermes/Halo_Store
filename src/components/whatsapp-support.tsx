"use client";

import { usePathname } from "next/navigation";
import { useReservation } from "@/components/reservation-provider";

const supportUrl = "https://wa.me/393319875979";

export function WhatsAppSupport() {
  const pathname = usePathname();
  const { count } = useReservation();

  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={supportUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contatta Halo Store su WhatsApp"
      title="Contattaci su WhatsApp"
      className={`fixed right-5 z-[105] flex h-14 w-14 items-center justify-center rounded-full border border-black/40 bg-white text-[#25D366] shadow-[0_2px_12px_rgba(0,0,0,0.16)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] ${
        count > 0 ? "bottom-24 md:bottom-6" : "bottom-6"
      }`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        className="h-8 w-8"
        aria-hidden="true"
      >
        <path
          d="M16.04 2.67A13.25 13.25 0 0 0 4.68 22.75L2.9 29.27l6.67-1.75a13.26 13.26 0 1 0 6.47-24.85Z"
          fill="white"
          stroke="#25D366"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M21.99 18.67c-.33-.17-1.95-.96-2.25-1.07-.3-.11-.52-.17-.74.17-.22.33-.85 1.07-1.04 1.29-.19.22-.39.25-.72.08-.33-.17-1.4-.52-2.66-1.65-.98-.87-1.65-1.95-1.84-2.28-.19-.33-.02-.51.14-.68.15-.15.33-.39.5-.58.17-.19.22-.33.33-.55.11-.22.06-.41-.03-.58-.08-.17-.74-1.79-1.01-2.45-.27-.65-.54-.56-.74-.57l-.63-.01c-.22 0-.58.08-.88.41-.3.33-1.16 1.13-1.16 2.75 0 1.62 1.19 3.19 1.35 3.41.17.22 2.34 3.57 5.67 5 .79.34 1.4.54 1.88.69.79.25 1.51.21 2.08.13.63-.1 1.95-.8 2.23-1.57.28-.77.28-1.43.19-1.57-.08-.14-.3-.22-.63-.39Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
