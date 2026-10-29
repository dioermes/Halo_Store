"use client";

import { createContext, useContext } from "react";
import { defaultStoreContact, type StoreContact } from "@/lib/store-contact";

const StoreContactContext = createContext<StoreContact>(defaultStoreContact);

export function StoreContactProvider({
  contact,
  children,
}: {
  contact: StoreContact;
  children: React.ReactNode;
}) {
  return <StoreContactContext.Provider value={contact}>{children}</StoreContactContext.Provider>;
}

export function useStoreContact() {
  return useContext(StoreContactContext);
}
