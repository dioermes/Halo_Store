import { SignUpPanel } from "@/components/clerk-auth-panel";

export default function SignUpPage() {
  return (
    <section className="flex min-h-[80vh] items-center justify-center px-5 py-28">
      <div className="w-full max-w-md">
        <p className="text-xs uppercase tracking-[0.34em] text-halo">Account</p>
        <h1 className="mt-4 font-display text-5xl">Crea il tuo spazio.</h1>
        <p className="mt-3 mb-8 text-ivory-dim">
          Serve per confermare il ritiro o la spedizione e seguire gli ordini.
          Le offerte arrivano solo se ti iscrivi alla newsletter, dal popup in vetrina.
        </p>
        <SignUpPanel />
      </div>
    </section>
  );
}
