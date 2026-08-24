"use client";

import { useEffect, useState } from "react";
import { ClerkFailed, ClerkLoaded, ClerkLoading, SignIn, SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

function ClerkHint() {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setStuck(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-ink-line p-5 text-sm leading-relaxed text-ivory-dim">
      <p>Apro l&apos;accesso…</p>
      {stuck ? (
        <p className="mt-3">
          Se resta così, in Clerk apri l&apos;istanza <strong className="text-ivory">Production</strong>{" "}
          → Configure → Domains e aggiungi l&apos;URL esatto del sito (con o senza www). Su Vercel le
          chiavi devono essere <code className="text-ivory">pk_live_</code> e{" "}
          <code className="text-ivory">sk_live_</code>, poi un nuovo deploy.
        </p>
      ) : null}
    </div>
  );
}

export function SignInPanel() {
  return (
    <div className="min-h-80">
      <ClerkLoading>
        <ClerkHint />
      </ClerkLoading>
      <ClerkFailed>
        <p className="rounded-2xl border border-ink-line p-5 text-sm leading-relaxed text-ivory-dim">
          Clerk non si avvia su questo dominio. Istanza Production → Domains: stesso host del sito.
          Vercel: chiavi live, poi redeploy.
        </p>
      </ClerkFailed>
      <ClerkLoaded>
        <SignIn
          appearance={clerkAppearance}
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/account"
          fallback={<ClerkHint />}
        />
      </ClerkLoaded>
    </div>
  );
}

export function SignUpPanel() {
  return (
    <div className="min-h-80">
      <ClerkLoading>
        <ClerkHint />
      </ClerkLoading>
      <ClerkFailed>
        <p className="rounded-2xl border border-ink-line p-5 text-sm leading-relaxed text-ivory-dim">
          Clerk non si avvia su questo dominio. Istanza Production → Domains: stesso host del sito.
          Vercel: chiavi live, poi redeploy.
        </p>
      </ClerkFailed>
      <ClerkLoaded>
        <SignUp
          appearance={clerkAppearance}
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/account"
          fallback={<ClerkHint />}
        />
      </ClerkLoaded>
    </div>
  );
}
