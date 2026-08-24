"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, CircleAlert, Eye, ImagePlus, Move, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { createCatalogTagAction, saveProductAction, type SaveProductState } from "@/app/admin/actions";
import { uploadAdminFile } from "@/lib/admin-upload";
import { PhotoCropper } from "@/components/photo-cropper";
import { CategoryPicker } from "@/components/category-picker";
import {
  fallbackCategories,
  formatPrice,
  getColorLook,
  isPricedOnSale,
  type Product,
  type StoreCategory,
} from "@/lib/products";
import { slugify } from "@/lib/slug";
import type { CatalogTag } from "@/lib/site";

type ColorDraft = {
  key: string;
  name: string;
  imageUrl: string;
  stocks: Record<string, number>;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-ink-line bg-ink/60 px-4 py-3 text-ivory outline-none transition-colors placeholder:text-ivory-dim/50 focus:border-halo/50";

function emptyStocks(sizes: string[], fill = 0) {
  return Object.fromEntries(sizes.map((size) => [size, fill]));
}

function draftsFromProduct(product?: Product): {
  sizes: string[];
  colors: ColorDraft[];
  cover: string;
} {
  if (!product) {
    const sizes = ["S", "M", "L"];
    return {
      sizes,
      colors: [{ key: "color-0", name: "", imageUrl: "", stocks: emptyStocks(sizes) }],
      cover: "",
    };
  }

  const sizes = product.sizes.filter(Boolean);
  const colorNames = product.colors.filter((name) => name && name !== "—");
  return {
    sizes: sizes.length ? sizes : ["M"],
    colors: (colorNames.length ? colorNames : [""]).map((name, index) => ({
      key: `color-${index}`,
      name,
      imageUrl: product.colorImages?.[name] ?? "",
      stocks: Object.fromEntries(
        (sizes.length ? sizes : ["M"]).map((size) => [
          size,
          product.variants?.find((variant) => variant.size === size && variant.color === name)
            ?.stock ?? 0,
        ]),
      ),
    })),
    cover: product.image || "",
  };
}

async function uploadFile(file: File) {
  return uploadAdminFile(file);
}

function WordButton({
  icon: Icon,
  label,
  tone = "ghost",
  ...props
}: {
  icon: typeof Plus;
  label: string;
  tone?: "ghost" | "solid" | "danger";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    ghost:
      "border-ink-line text-ivory hover:border-halo/60 hover:text-halo-bright",
    solid: "border-transparent bg-ivory text-ink hover:bg-halo-bright",
    danger: "border-ink-line text-ivory-dim hover:border-red-400/50 hover:text-red-300",
  };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]} ${props.className ?? ""}`}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

function PhotoButton({
  label,
  uploading,
  onFile,
}: {
  label: string;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink-line px-4 py-2 text-sm text-ivory transition-colors hover:border-halo/60 hover:text-halo-bright">
      <Upload className="h-4 w-4" aria-hidden />
      {uploading ? "Attendi" : label}
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

function PreviewShot({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-full items-center justify-center bg-ink-soft text-xs uppercase tracking-[0.18em] text-ivory-dim">
        Manca la foto
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-full w-full object-cover" />
  );
}

function LivePreview({
  name,
  subtitle,
  price,
  compareAt,
  badge,
  published,
  cover,
  colors,
  sizes,
  previewColor,
  onPreviewColor,
}: {
  name: string;
  subtitle: string;
  price: number;
  compareAt: number | "";
  badge: string;
  published: boolean;
  cover: string;
  colors: ColorDraft[];
  sizes: string[];
  previewColor: string;
  onPreviewColor: (color: string) => void;
}) {
  const namedColors = colors.filter((color) => color.name.trim());
  const active = namedColors.find((color) => color.name === previewColor) ?? namedColors[0];
  const photo = active?.imageUrl || cover;
  const look = getColorLook(active?.name ?? "");

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-line bg-ink-soft">
      <div className="relative aspect-[4/5]">
        <PreviewShot src={photo} alt={name || "Anteprima capo"} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        {badge && (
          <span className="absolute left-3 top-3 rounded-full border border-halo/40 bg-ink/70 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-halo-bright backdrop-blur">
            {badge}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-display text-3xl leading-none">{name || "Nuovo capo"}</p>
          <p className="mt-2 text-sm text-ivory-dim">{subtitle || "Sottotitolo"}</p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-halo-bright">
            {price ? formatPrice(price) : "€ —"}
          </span>
          {typeof compareAt === "number" && compareAt > price && (
            <span className="text-sm text-ivory-dim line-through">{formatPrice(compareAt)}</span>
          )}
        </div>
        {namedColors.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ivory-dim">Colore</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {namedColors.map((color) => {
                const selected = (active?.name ?? "") === color.name;
                return (
                  <button
                    key={color.key}
                    type="button"
                    onClick={() => onPreviewColor(color.name)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                      selected
                        ? "border-halo bg-halo/15 text-halo-bright"
                        : "border-ink-line text-ivory-dim"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-ivory/20"
                      style={{ backgroundColor: getColorLook(color.name).hex }}
                    />
                    {color.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {sizes.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-ivory-dim">Taglia</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {sizes.map((size) => (
                <span
                  key={size}
                  className="rounded-full border border-ink-line px-3 py-1 text-xs text-ivory-dim"
                >
                  {size}
                </span>
              ))}
            </div>
          </div>
        )}
        <p className="text-xs text-ivory-dim">
          {published ? "Visibile in vetrina" : "Nascosto dalla vetrina"}
          {active?.name && look.hex ? ` · ${active.name}` : ""}
        </p>
      </div>
    </div>
  );
}

export function ProductEditor({
  product,
  productId,
  saved = false,
  categories: initialCategories,
  tags: initialTags = [],
}: {
  product?: Product;
  productId?: string;
  saved?: boolean;
  categories?: StoreCategory[];
  tags?: CatalogTag[];
}) {
  const router = useRouter();
  const [saveState, formAction, saving] = useActionState(saveProductAction, { error: "" } satisfies SaveProductState);
  const [justSaved, setJustSaved] = useState(saved);
  const initial = draftsFromProduct(product);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.id ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [subtitle, setSubtitle] = useState(product?.subtitle ?? "");
  const [category, setCategory] = useState(product?.category ?? "top");
  const [categoryList, setCategoryList] = useState<StoreCategory[]>(() => {
    const list = initialCategories?.length ? [...initialCategories] : [...fallbackCategories];
    if (product?.category && !list.some((row) => row.id === product.category)) {
      list.push({ id: product.category, label: product.category, hint: "" });
    }
    return list;
  });
  const selectedCategory = categoryList.find((row) => row.id === category);
  const [price, setPrice] = useState<number | "">(product?.price ?? "");
  const [compareAt, setCompareAt] = useState<number | "">(product?.compareAt ?? "");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [fabric, setFabric] = useState(product?.fabric ?? "");
  const [fit, setFit] = useState(product?.fit ?? "");
  const [care, setCare] = useState(product?.care ?? "");
  const [published, setPublished] = useState(product?.published !== false);
  const [isNewArrival, setIsNewArrival] = useState(Boolean(product?.isNewArrival));
  const [isBestseller, setIsBestseller] = useState(Boolean(product?.isBestseller));
  const [isOnSale, setIsOnSale] = useState(Boolean(product?.isOnSale));
  const [catalogTags, setCatalogTags] = useState<CatalogTag[]>(initialTags);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(product?.customTagIds ?? []);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [tagBusy, setTagBusy] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState(product?.searchKeywords ?? "");
  const [cover, setCover] = useState(initial.cover);
  const [sizes, setSizes] = useState(initial.sizes);
  const [newSize, setNewSize] = useState("");
  const [colors, setColors] = useState(initial.colors);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewColor, setPreviewColor] = useState(initial.colors[0]?.name ?? "");
  const [error, setError] = useState("");
  const [crop, setCrop] = useState<{
    src: string;
    slot: string;
    revoke: boolean;
    apply: (url: string) => void;
  } | null>(null);
  const shownError = saveState.error || error;

  useEffect(() => {
    if (!saved) return;
    setJustSaved(true);
    if (product?.uuid) {
      router.replace(`/admin/catalogo/${product.uuid}`, { scroll: false });
    }
    const timer = window.setTimeout(() => setJustSaved(false), 7000);
    return () => window.clearTimeout(timer);
  }, [saved, product?.uuid, router]);

  const extras = useMemo(() => {
    const used = new Set(
      [cover, ...colors.map((color) => color.imageUrl)].filter(Boolean),
    );
    return (product?.gallery ?? []).filter((url) => url && !used.has(url));
  }, [cover, colors, product?.gallery]);

  const variants = colors.flatMap((color) =>
    color.name.trim()
      ? sizes
          .filter(Boolean)
          .map((size) => ({
            size,
            color: color.name.trim(),
            stock: Number(color.stocks[size]) || 0,
          }))
      : [],
  );

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  const discounted = isPricedOnSale(
    typeof price === "number" ? price : 0,
    typeof compareAt === "number" ? compareAt : undefined,
  );

  useEffect(() => {
    if (discounted) setIsOnSale(true);
  }, [discounted]);

  useEffect(() => {
    if (!previewOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [previewOpen]);

  const updateColor = (key: string, patch: Partial<ColorDraft>) => {
    setColors((current) =>
      current.map((color) => (color.key === key ? { ...color, ...patch } : color)),
    );
  };

  const closeCrop = () => {
    if (crop?.revoke) URL.revokeObjectURL(crop.src);
    setCrop(null);
    setUploading(null);
  };

  const openCropForFile = (file: File, slot: string, apply: (url: string) => void) => {
    setError("");
    setCrop({
      src: URL.createObjectURL(file),
      slot,
      revoke: true,
      apply,
    });
  };

  const openCropForUrl = (src: string, slot: string, apply: (url: string) => void) => {
    setError("");
    setCrop({ src, slot, revoke: false, apply });
  };

  const handleCropped = async (file: File) => {
    if (!crop) return;
    setUploading(crop.slot);
    try {
      const url = await uploadFile(file);
      crop.apply(url);
      if (crop.revoke) URL.revokeObjectURL(crop.src);
      setCrop(null);
    } catch (caught) {
      throw caught instanceof Error ? caught : new Error("Caricamento non riuscito");
    } finally {
      setUploading(null);
    }
  };

  const addSize = () => {
    const next = newSize.trim();
    if (!next || sizes.includes(next)) return;
    setSizes((current) => [...current, next]);
    setColors((current) =>
      current.map((color) => ({ ...color, stocks: { ...color.stocks, [next]: 0 } })),
    );
    setNewSize("");
  };

  const removeSize = (size: string) => {
    setSizes((current) => current.filter((row) => row !== size));
    setColors((current) =>
      current.map((color) => {
        const stocks = { ...color.stocks };
        delete stocks[size];
        return { ...color, stocks };
      }),
    );
  };

  const preview = (
    <LivePreview
      name={name}
      subtitle={subtitle}
      price={typeof price === "number" ? price : 0}
      compareAt={compareAt}
      badge={badge}
      published={published}
      cover={cover}
      colors={colors}
      sizes={sizes}
      previewColor={previewColor}
      onPreviewColor={setPreviewColor}
    />
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18.5rem] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <form
        action={formAction}
        onSubmit={(event) => {
          setError("");
          if (!name.trim() || !slug.trim()) {
            event.preventDefault();
            setError("Servono nome e slug.");
            return;
          }
          if (!colors.some((color) => color.name.trim())) {
            event.preventDefault();
            setError("Aggiungi almeno un colore.");
            return;
          }
          if (!sizes.length) {
            event.preventDefault();
            setError("Aggiungi almeno una taglia.");
            return;
          }
        }}
        className="grid gap-10 pb-24 lg:pb-0"
      >
        <input type="hidden" name="id" value={product?.uuid ?? productId ?? ""} />
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="subtitle" value={subtitle} />
        <input type="hidden" name="category" value={category} />
        <input type="hidden" name="categoryLabel" value={selectedCategory?.label ?? ""} />
        <input type="hidden" name="categoryHint" value={selectedCategory?.hint ?? ""} />
        <input type="hidden" name="price" value={price === "" ? "0" : String(price)} />
        <input type="hidden" name="compareAt" value={compareAt === "" ? "" : String(compareAt)} />
        <input type="hidden" name="badge" value={badge} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="fabric" value={fabric} />
        <input type="hidden" name="fit" value={fit} />
        <input type="hidden" name="care" value={care} />
        {published ? <input type="hidden" name="published" value="on" /> : null}
        {isNewArrival ? <input type="hidden" name="isNewArrival" value="on" /> : null}
        {isBestseller ? <input type="hidden" name="isBestseller" value="on" /> : null}
        {isOnSale ||
        isPricedOnSale(
          typeof price === "number" ? price : 0,
          typeof compareAt === "number" ? compareAt : undefined,
        ) ? (
          <input type="hidden" name="isOnSale" value="on" />
        ) : null}
        <input type="hidden" name="customTagIds" value={JSON.stringify(selectedTagIds)} />
        <input type="hidden" name="searchKeywords" value={searchKeywords} />
        <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />
        <input
          type="hidden"
          name="imagesJson"
          value={JSON.stringify({
            cover,
            extras,
            colors: colors
              .filter((color) => color.name.trim())
              .map((color) => ({ name: color.name.trim(), url: color.imageUrl })),
          })}
        />

        <header>
          <p className="text-xs uppercase tracking-[0.34em] text-halo">
            {product ? "Modifica" : "Nuovo"}
          </p>
          <h2 className="mt-2 font-display text-4xl">
            {product ? product.name : "Inserisci un capo"}
          </h2>
          <p className="mt-3 max-w-xl text-sm text-ivory-dim">
            Prima la scheda, poi le taglie, poi un colore alla volta con la sua foto.
            A destra vedi come apparirà in vetrina.
          </p>
          {justSaved && (
            <p
              role="status"
              className="mt-5 flex items-start gap-3 rounded-2xl border border-halo/40 bg-halo/10 px-4 py-3 text-sm text-halo-bright"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {published
                ? "Capo salvato. È visibile in vetrina."
                : "Capo salvato. Resta nascosto dalla vetrina."}
            </p>
          )}
        </header>

        <section className="grid gap-4 rounded-2xl border border-ink-line bg-ink/40 p-5">
          <h3 className="font-display text-2xl">Scheda</h3>
          <label className="text-sm text-ivory-dim">
            Nome
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Aurora"
              required
              className={fieldClass}
            />
          </label>
          <label className="text-sm text-ivory-dim">
            Indirizzo in vetrina
            <input
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugify(event.target.value));
              }}
              placeholder="aurora"
              required
              className={fieldClass}
            />
          </label>
          <label className="text-sm text-ivory-dim">
            Sottotitolo
            <input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              placeholder="T-shirt in cotone pettinato"
              className={fieldClass}
            />
          </label>
          <label className="text-sm text-ivory-dim">
            Tipologia
            <CategoryPicker
              categories={categoryList}
              value={category}
              onChange={setCategory}
              onCategoriesChange={setCategoryList}
            />
          </label>
          <label className="text-sm text-ivory-dim">
            Etichetta in vetrina
            <input
              value={badge}
              onChange={(event) => setBadge(event.target.value)}
              placeholder="Nuovo arrivo, Best seller…"
              className={fieldClass}
            />
          </label>
          <label className="text-sm text-ivory-dim">
            Descrizione
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              className={fieldClass}
            />
          </label>
          <p className="rounded-xl border border-ink-line bg-ink/40 px-4 py-3 text-sm text-ivory-dim">
            Tessuto, vestibilità e cura: se un campo resta vuoto non compare nella scheda del capo in vetrina.
          </p>
          <label className="text-sm text-ivory-dim">
            Tessuto
            <input
              value={fabric}
              onChange={(event) => setFabric(event.target.value)}
              placeholder="Opzionale"
              className={fieldClass}
            />
          </label>
          <label className="text-sm text-ivory-dim">
            Vestibilità
            <input
              value={fit}
              onChange={(event) => setFit(event.target.value)}
              placeholder="Opzionale"
              className={fieldClass}
            />
          </label>
          <label className="text-sm text-ivory-dim">
            Cura
            <input
              value={care}
              onChange={(event) => setCare(event.target.value)}
              placeholder="Opzionale"
              className={fieldClass}
            />
          </label>
          <label className="flex items-center gap-3 text-sm text-ivory">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="accent-halo"
            />
            Mostra in vetrina
          </label>
          <label className="flex items-center gap-3 text-sm text-ivory">
            <input
              type="checkbox"
              checked={isNewArrival}
              onChange={(event) => setIsNewArrival(event.target.checked)}
              className="accent-halo"
            />
            Nuovo arrivo
          </label>
          <label className="flex items-center gap-3 text-sm text-ivory">
            <input
              type="checkbox"
              checked={isBestseller}
              onChange={(event) => setIsBestseller(event.target.checked)}
              className="accent-halo"
            />
            Best seller
          </label>
          <label className="flex items-center gap-3 text-sm text-ivory">
            <input
              type="checkbox"
              checked={discounted || isOnSale}
              disabled={discounted}
              onChange={(event) => setIsOnSale(event.target.checked)}
              className="accent-halo"
            />
            In saldo
          </label>
          {discounted ? (
            <p className="text-sm text-ivory-dim">
              Si attiva da solo perché il prezzo pieno è più alto di quello di vendita.
            </p>
          ) : null}

          <div className="grid gap-3 rounded-xl border border-ink-line bg-ink/40 p-4">
            <p className="font-display text-xl">Tag per la home</p>
            <p className="text-sm text-ivory-dim">
              Oltre a nuovi arrivi, best seller e saldi puoi creare tag tuoi, per esempio
              «Collezione estate», e poi usare quel tag in una sezione della home.
            </p>
            {catalogTags.length ? (
              <ul className="grid gap-2">
                {catalogTags.map((tag) => {
                  const checked = selectedTagIds.includes(tag.id);
                  return (
                    <li key={tag.id}>
                      <label className="flex items-center gap-3 text-sm text-ivory">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setSelectedTagIds((current) =>
                              event.target.checked
                                ? [...current, tag.id]
                                : current.filter((id) => id !== tag.id),
                            )
                          }
                          className="accent-halo"
                        />
                        {tag.label}
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-ivory-dim">Nessun tag extra. Creane uno sotto.</p>
            )}
            <div className="flex flex-wrap gap-2">
              <input
                value={newTagLabel}
                onChange={(event) => setNewTagLabel(event.target.value)}
                placeholder="Nome tag, es. Collezione estate"
                className={`${fieldClass} mt-0 min-w-[12rem] flex-1`}
              />
              <button
                type="button"
                disabled={tagBusy || !newTagLabel.trim()}
                onClick={async () => {
                  const label = newTagLabel.trim();
                  if (!label) return;
                  setTagBusy(true);
                  setError("");
                  try {
                    const tag = await createCatalogTagAction(label);
                    setCatalogTags((current) =>
                      current.some((row) => row.id === tag.id) ? current : [...current, tag],
                    );
                    setSelectedTagIds((current) =>
                      current.includes(tag.id) ? current : [...current, tag.id],
                    );
                    setNewTagLabel("");
                  } catch (caught) {
                    setError(caught instanceof Error ? caught.message : "Tag non creato");
                  } finally {
                    setTagBusy(false);
                  }
                }}
                className="rounded-full border border-ink-line px-4 py-2 text-sm text-ivory disabled:opacity-40"
              >
                {tagBusy ? "Creo…" : "Crea tag"}
              </button>
            </div>
          </div>

          <label className="text-sm text-ivory-dim">
            Parole chiave ricerca
            <input
              value={searchKeywords}
              onChange={(event) => setSearchKeywords(event.target.value)}
              placeholder="es. maglietta, cotone, estate, oversize"
              className={fieldClass}
            />
          </label>
        </section>

        <section className="grid gap-4 rounded-2xl border border-ink-line bg-ink/40 p-5">
          <h3 className="font-display text-2xl">Prezzo</h3>
          <p className="text-sm text-ivory-dim">
            Se il prezzo pieno è più alto di quello di vendita, il capo va da solo nei saldi.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-ivory-dim">
              Prezzo di vendita (€)
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value === "" ? "" : Number(event.target.value))
                }
                className={fieldClass}
              />
            </label>
            <label className="text-sm text-ivory-dim">
              Prezzo pieno, se in sconto (€)
              <input
                type="number"
                min="0"
                step="1"
                value={compareAt}
                onChange={(event) =>
                  setCompareAt(event.target.value === "" ? "" : Number(event.target.value))
                }
                className={fieldClass}
              />
            </label>
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-ink-line bg-ink/40 p-5">
          <div>
            <h3 className="font-display text-2xl">Foto di copertina</h3>
            <p className="mt-1 text-sm text-ivory-dim">
              È la foto della card in vetrina. Dopo il caricamento la sposti e la zoomi per centrarla.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative h-28 w-24 overflow-hidden rounded-xl border border-ink-line">
              <PreviewShot src={cover} alt="Copertina" />
            </div>
            <PhotoButton
              label={cover ? "Sostituisci" : "Carica"}
              uploading={uploading === "cover"}
              onFile={(file) => openCropForFile(file, "cover", setCover)}
            />
            {cover && (
              <WordButton
                icon={Move}
                label="Inquadra"
                onClick={() => openCropForUrl(cover, "cover", setCover)}
              />
            )}
            {cover && (
              <WordButton
                icon={Trash2}
                label="Rimuovi"
                tone="danger"
                onClick={() => setCover("")}
              />
            )}
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-ink-line bg-ink/40 p-5">
          <div>
            <h3 className="font-display text-2xl">Taglie</h3>
            <p className="mt-1 text-sm text-ivory-dim">
              Valgono per tutti i colori. I pezzi li imposti sul colore.
            </p>
          </div>
          <div className="space-y-2">
            {sizes.map((size, index) => (
              <div key={`size-${index}`} className="flex items-center gap-2">
                <input
                  value={size}
                  onChange={(event) => {
                    const next = event.target.value;
                    setSizes((current) =>
                      current.map((row, rowIndex) => (rowIndex === index ? next : row)),
                    );
                    setColors((current) =>
                      current.map((color) => {
                        const stocks = { ...color.stocks };
                        stocks[next] = stocks[size] ?? 0;
                        if (next !== size) delete stocks[size];
                        return { ...color, stocks };
                      }),
                    );
                  }}
                  className="w-32 rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm"
                />
                <WordButton
                  icon={Trash2}
                  label="Rimuovi"
                  tone="danger"
                  onClick={() => removeSize(size)}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={newSize}
              onChange={(event) => setNewSize(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addSize();
                }
              }}
              placeholder="XL, Taglia unica…"
              className="w-40 rounded-xl border border-ink-line bg-ink/60 px-3 py-2 text-sm"
            />
            <WordButton icon={Plus} label="Aggiungi" onClick={addSize} />
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl border border-ink-line bg-ink/40 p-5">
          <div>
            <h3 className="font-display text-2xl">Colori</h3>
            <p className="mt-1 text-sm text-ivory-dim">
              Ogni colore ha la sua foto, distinta dalla copertina. Se manca, in vetrina si usa la copertina.
            </p>
          </div>
          <div className="space-y-4">
            {colors.map((color, index) => (
              <div key={color.key} className="rounded-2xl border border-ink-line bg-ink/50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <label className="min-w-[12rem] flex-1 text-sm text-ivory-dim">
                    Colore {index + 1}
                    <input
                      value={color.name}
                      onChange={(event) => {
                        updateColor(color.key, { name: event.target.value });
                        if (previewColor === color.name || !previewColor) {
                          setPreviewColor(event.target.value);
                        }
                      }}
                      placeholder="Nero, Sabbia, Bianco ottico…"
                      className={fieldClass}
                    />
                  </label>
                  <WordButton
                    icon={Trash2}
                    label="Rimuovi"
                    tone="danger"
                    className="mt-7"
                    onClick={() => {
                      setColors((current) => current.filter((row) => row.key !== color.key));
                      if (previewColor === color.name) setPreviewColor("");
                    }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="relative h-24 w-20 overflow-hidden rounded-xl border border-ink-line">
                    <PreviewShot src={color.imageUrl} alt={color.name || "Colore"} />
                  </div>
                  <PhotoButton
                    label={color.imageUrl ? "Sostituisci" : "Carica"}
                    uploading={uploading === color.key}
                    onFile={(file) =>
                      openCropForFile(file, color.key, (url) => {
                        updateColor(color.key, { imageUrl: url });
                        setPreviewColor(color.name || previewColor);
                      })
                    }
                  />
                  {color.imageUrl && (
                    <WordButton
                      icon={Move}
                      label="Inquadra"
                      onClick={() =>
                        openCropForUrl(color.imageUrl, color.key, (url) => {
                          updateColor(color.key, { imageUrl: url });
                          setPreviewColor(color.name || previewColor);
                        })
                      }
                    />
                  )}
                  {color.imageUrl && (
                    <WordButton
                      icon={Trash2}
                      label="Rimuovi"
                      tone="danger"
                      onClick={() => updateColor(color.key, { imageUrl: "" })}
                    />
                  )}
                </div>

                {sizes.filter(Boolean).length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-ivory-dim">
                      Pezzi per taglia
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sizes.filter(Boolean).map((size) => (
                        <label
                          key={size}
                          className="flex items-center gap-2 rounded-full border border-ink-line px-3 py-1.5 text-sm"
                        >
                          <span className="text-ivory-dim">{size}</span>
                          <input
                            type="number"
                            min="0"
                            value={color.stocks[size] ?? 0}
                            onChange={(event) =>
                              updateColor(color.key, {
                                stocks: {
                                  ...color.stocks,
                                  [size]: Number(event.target.value) || 0,
                                },
                              })
                            }
                            className="w-14 bg-transparent text-center outline-none"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <WordButton
            icon={ImagePlus}
            label="Aggiungi"
            onClick={() =>
              setColors((current) => [
                ...current,
                {
                  key: `color-${current.length}-${Date.now()}`,
                  name: "",
                  imageUrl: "",
                  stocks: emptyStocks(sizes),
                },
              ])
            }
          />
        </section>

        {shownError && (
          <p
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {shownError}
          </p>
        )}

        <WordButton
          icon={Save}
          label={saving ? "Attendi" : "Salva"}
          tone="solid"
          type="submit"
          disabled={saving}
          className="justify-center py-3"
        />
      </form>

      <aside className="hidden lg:sticky lg:top-28 lg:block">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ivory-dim">Anteprima</p>
        {preview}
      </aside>

      {previewOpen ? null : (
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="fixed top-1/3 right-0 z-40 inline-flex items-center gap-2 rounded-l-full border border-r-0 border-ink-line bg-ink-soft px-3 py-3 text-sm text-ivory shadow-lg lg:hidden"
        >
          <Eye className="h-4 w-4" aria-hidden />
          Anteprima
        </button>
      )}

      <AnimatePresence>
        {previewOpen && (
          <div className="lg:hidden">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Chiudi"
              onClick={() => setPreviewOpen(false)}
              className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-[80] flex w-[min(22rem,calc(100vw-1.25rem))] flex-col border-l border-ink-line bg-ink"
            >
              <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
                <p className="text-sm text-ivory-dim">Anteprima</p>
                <WordButton icon={X} label="Chiudi" onClick={() => setPreviewOpen(false)} />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                {preview}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {crop && (
        <PhotoCropper
          src={crop.src}
          title="Inquadra la foto"
          onCancel={closeCrop}
          onApply={handleCropped}
        />
      )}
    </div>
  );
}
