import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase";

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("unauthenticated");
  }
  const user = await currentUser();
  if (!user) {
    throw new Error("unauthenticated");
  }
  return user;
}

export function isOwnerUser(user: User | null | undefined) {
  if (!user) return false;
  const metaRole = user.publicMetadata?.role;
  if (metaRole === "owner") return true;
  const allow = (process.env.HALO_OWNER_CLERK_IDS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allow.includes(user.id);
}

export async function requireOwner() {
  const user = await requireUser();
  if (!isOwnerUser(user)) {
    throw new Error("forbidden");
  }
  return user;
}

export function customerName(user: User) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
}

export function customerEmail(user: User) {
  return user.emailAddresses[0]?.emailAddress ?? "";
}

export async function ensureCustomer(user: User) {
  const admin = createAdminClient();
  const email = customerEmail(user);
  const { data, error } = await admin
    .from("halo_customers")
    .upsert(
      {
        clerk_id: user.id,
        email,
        full_name: customerName(user) || null,
        phone: user.phoneNumbers[0]?.phoneNumber ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "clerk_id" },
    )
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Impossibile sincronizzare il profilo");
  }

  await admin.from("halo_consents").upsert(
    {
      customer_id: data.id,
      source: "account_sync",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "customer_id", ignoreDuplicates: true },
  );

  return data as {
    id: string;
    clerk_id: string;
    email: string;
    phone: string | null;
    full_name: string | null;
  };
}
