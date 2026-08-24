import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <section className="flex min-h-[80vh] items-center justify-center px-5 py-28">
      <div className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.34em] text-halo">Account</p>
        <h1 className="mt-4 font-display text-5xl">Bentornato.</h1>
        <p className="mt-3 mb-8 text-ivory-dim">
          Accedi per confermare ritiro o spedizione e vedere gli ordini.
        </p>
        <SignIn appearance={clerkAppearance} />
      </div>
    </section>
  );
}
