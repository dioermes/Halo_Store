"use client";

import { useEffect, useState } from "react";
import { ClerkFailed, ClerkLoaded, ClerkLoading, SignIn, SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { storeConfig } from "@/lib/store-config";

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
          L&apos;accesso sta impiegando più del solito. Riprova tra un attimo oppure
          scrivici a{" "}
          <a href={storeConfig.support.emailHref} className="text-ivory underline underline-offset-4">
            {storeConfig.support.email}
          </a>
          .
        </p>
      ) : null}
    </div>
  );
}

function ClerkFail() {
  return (
    <p className="rounded-2xl border border-ink-line p-5 text-sm leading-relaxed text-ivory-dim">
      L&apos;accesso non si è aperto. Riprova tra poco oppure scrivici a{" "}
      <a href={storeConfig.support.emailHref} className="text-ivory underline underline-offset-4">
        {storeConfig.support.email}
      </a>
      .
    </p>
  );
}

export function SignInPanel() {
  return (
    <div className="min-h-80">
      <ClerkLoading>
        <ClerkHint />
      </ClerkLoading>
      <ClerkFailed>
        <ClerkFail />
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
        <ClerkFail />
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
