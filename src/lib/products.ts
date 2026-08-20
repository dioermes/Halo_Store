export type CategoryId = string;

export type StoreCategory = {
  id: string;
  label: string;
  hint: string;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  sku?: string;
  stock: number;
  lowStockAt?: number;
};

export type Product = {
  id: string;
  /** UUID riga database, presente quando il catalogo arriva da Supabase */
  uuid?: string;
  name: string;
  subtitle: string;
  category: CategoryId;
  price: number;
  /** Prezzo pieno, presente solo sui capi in promozione */
  compareAt?: number;
  sizes: string[];
  colors: string[];
  fabric: string;
  fit: string;
  care: string;
  description: string;
  image: string;
  /** Altre viste del capo, usate nel viewer a schermo intero */
  gallery?: string[];
  /** Foto dedicata per ciascuna colorazione, se il titolare l'ha caricata */
  colorImages?: Record<string, string>;
  /** Etichetta breve mostrata sulla card, es. "Nuovo arrivo" */
  badge?: string;
  /** Pezzi realmente disponibili in negozio: alimenta il senso di urgenza */
  stock: number;
  variants?: ProductVariant[];
  published?: boolean;
};

export type ColorLook = {
  hex: string;
  /** Filtro CSS per simulare la variante quando non c'e una foto dedicata */
  filter?: string;
};

export const fallbackCategories: StoreCategory[] = [
  { id: "top", label: "Top", hint: "T-shirt, camicie, maglieria" },
  { id: "denim", label: "Denim", hint: "Jeans e capispalla in tela" },
  { id: "outerwear", label: "Outerwear", hint: "Pelle, bomber, cappotti" },
  { id: "accessori", label: "Accessori", hint: "Il dettaglio che cambia tutto" },
];

export const categories: StoreCategory[] = [
  { id: "tutti", label: "Tutto il negozio", hint: "Tutti i capi" },
  ...fallbackCategories,
];

/**
 * Catalogo dimostrativo: nomi, prezzi e descrizioni sono di esempio.
 * Per usare le foto reali del negozio basta sostituire il file in /public/catalogo
 * mantenendo lo stesso nome, oppure cambiare il campo `image`.
 */
export const products: Product[] = [
  {
    id: "aurora",
    name: "Aurora",
    subtitle: "T-shirt in cotone pettinato",
    category: "top",
    price: 45,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Bianco ottico", "Nero", "Sabbia"],
    fabric: "100% cotone pettinato, 190 g/mq",
    fit: "Vestibilità regolare, spalla appena scesa",
    care: "Lavaggio a 30 gradi, no asciugatrice",
    description:
      "La base di tutto. Cotone pettinato pesante che non si deforma dopo il primo lavaggio, collo a costina rinforzato e cuciture piatte. Quella che compri una volta e cerchi ogni mattina.",
    image: "/catalogo/tshirt-bianca.jpg",
    badge: "Best seller",
    stock: 6,
  },
  {
    id: "lume",
    name: "Lume",
    subtitle: "Camicia in popeline di cotone",
    category: "top",
    price: 79,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Bianco", "Azzurro polvere"],
    fabric: "100% popeline di cotone a filo doppio ritorto",
    fit: "Slim morbido, collo italiano",
    care: "Lavaggio a 30 gradi, stiratura a media temperatura",
    description:
      "Il popeline a filo ritorto tiene la piega tutto il giorno e resta fresco sulla pelle. Collo italiano che regge bene sia la cravatta sia il primo bottone aperto.",
    image: "/catalogo/camicia-bianca.jpg",
    stock: 4,
  },
  {
    id: "meriggio",
    name: "Meriggio",
    subtitle: "Polo in piquet di cotone",
    category: "top",
    price: 69,
    compareAt: 89,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Bianco", "Blu notte", "Verde salvia"],
    fabric: "100% cotone piquet, bottoni in madreperla",
    fit: "Regolare, fondo dritto",
    care: "Lavaggio a 30 gradi con capi simili",
    description:
      "Piquet compatto con costina ai bordi e tre bottoni in madreperla. Sta bene sotto una giacca leggera quanto sopra un paio di jeans.",
    image: "/catalogo/polo-bianca.jpg",
    badge: "In promozione",
    stock: 3,
  },
  {
    id: "bruma",
    name: "Bruma",
    subtitle: "Maglione a coste inglesi",
    category: "top",
    price: 95,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige naturale", "Grigio pietra"],
    fabric: "70% lana merino, 30% cotone",
    fit: "Comoda, maniche a raglan",
    care: "Lavaggio a mano o programma lana",
    description:
      "Coste inglesi larghe e lana merino mescolata al cotone, per tenere il caldo senza pizzicare. Il capo che il titolare tira fuori quando dici che hai freddo ma non vuoi un piumino.",
    image: "/catalogo/maglione-coste.jpg",
    badge: "Nuovo arrivo",
    stock: 5,
  },
  {
    id: "nembo",
    name: "Nembo",
    subtitle: "Felpa con cappuccio garzata",
    category: "top",
    price: 89,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Bianco panna", "Grigio melange"],
    fabric: "80% cotone, 20% poliestere, interno garzato 380 g/mq",
    fit: "Oversize contenuto",
    care: "Lavaggio a 30 gradi al rovescio",
    description:
      "Garzatura interna densa, cappuccio a doppio strato che sta su davvero e polsini elasticizzati che non cedono. Peso pieno, non la solita felpa da catena.",
    image: "/catalogo/felpa-cappuccio.jpg",
    stock: 7,
  },
  {
    id: "indaco",
    name: "Indaco",
    subtitle: "Jeans slim in denim selvedge",
    category: "denim",
    price: 119,
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["Indaco scuro"],
    fabric: "Denim selvedge 13,5 oz, 98% cotone 2% elastan",
    fit: "Slim, cavallo medio",
    care: "Lavaggio al rovescio, poco e a freddo",
    description:
      "Selvedge da 13,5 once con una punta di elastan, per non combattere quando ti siedi. Si consuma dove ti muovi tu: dopo sei mesi è un jeans che nessun altro ha.",
    image: "/catalogo/jeans-indaco.jpg",
    badge: "Best seller",
    stock: 4,
  },
  {
    id: "notturno",
    name: "Notturno",
    subtitle: "Jeans neri a gamba dritta",
    category: "denim",
    price: 109,
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Nero pieno"],
    fabric: "Denim tinto in capo 12 oz, 99% cotone",
    fit: "Dritto dal ginocchio",
    care: "Lavaggio a freddo per mantenere il nero",
    description:
      "Nero pieno tinto in capo, gamba dritta che cade pulita sulla scarpa. Il jeans che risolve la serata quando non hai voglia di pensarci.",
    image: "/catalogo/jeans-neri.jpg",
    stock: 5,
  },
  {
    id: "zenit",
    name: "Zenit",
    subtitle: "Giacca in denim lavato",
    category: "denim",
    price: 139,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blu medio"],
    fabric: "100% cotone denim 11 oz, lavaggio stone",
    fit: "Corta in vita, spalla strutturata",
    care: "Lavaggio a 30 gradi separato",
    description:
      "Il trucker classico fatto bene: doppia tasca al petto, cintura regolabile sul fondo e un lavaggio stone che la fa sembrare già tua dal primo giorno.",
    image: "/catalogo/giacca-denim.jpg",
    stock: 3,
  },
  {
    id: "riva",
    name: "Riva",
    subtitle: "Camicia in denim leggero",
    category: "denim",
    price: 89,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blu chiaro"],
    fabric: "100% cotone chambray, 6 oz",
    fit: "Regolare, taschini con patta",
    care: "Lavaggio a 30 gradi",
    description:
      "Chambray leggero che si porta aperto sopra una t-shirt o chiuso sotto un maglione. Uno di quei capi che finisci per mettere tre volte a settimana.",
    image: "/catalogo/camicia-denim.jpg",
    stock: 6,
  },
  {
    id: "eclissi",
    name: "Eclissi",
    subtitle: "Giubbotto in pelle di agnello",
    category: "outerwear",
    price: 329,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Nero"],
    fabric: "Pelle di agnello nappa, fodera in cupro",
    fit: "Aderente, zip asimmetrica",
    care: "Solo pulizia specializzata",
    description:
      "Nappa di agnello morbidissima, zip metallica pesante e fodera in cupro che scivola sopra il maglione. Il pezzo forte del negozio, ed è uno solo per taglia.",
    image: "/catalogo/giubbotto-pelle.jpg",
    badge: "Pezzo unico",
    stock: 1,
  },
  {
    id: "duna",
    name: "Duna",
    subtitle: "Bomber cammello imbottito",
    category: "outerwear",
    price: 199,
    sizes: ["M", "L", "XL"],
    colors: ["Cammello"],
    fabric: "Esterno tecnico idrorepellente, imbottitura termica",
    fit: "Regolare, bordi a costina",
    care: "Lavaggio a 30 gradi delicato",
    description:
      "Idrorepellente fuori, caldo dentro, leggero come una felpa. Un cammello che sta bene con il denim e con qualunque cosa tu abbia già nell'armadio.",
    image: "/catalogo/bomber-cammello.jpg",
    badge: "Nuovo arrivo",
    stock: 2,
  },
  {
    id: "ambra",
    name: "Ambra",
    subtitle: "Giacca in pelle cuoio",
    category: "outerwear",
    price: 349,
    sizes: ["M", "L", "XL"],
    colors: ["Cuoio"],
    fabric: "Pelle bovina pieno fiore conciata al vegetale",
    fit: "Regolare, collo a camicia",
    care: "Solo pulizia specializzata",
    description:
      "Conciata al vegetale, quindi cambia colore con il sole e con l'uso. Fra due anni sarà più bella di adesso, ed è esattamente il punto.",
    image: "/catalogo/giacca-pelle-cuoio.jpg",
    stock: 2,
  },
  {
    id: "alba",
    name: "Alba",
    subtitle: "Cappotto doppiopetto in lana",
    category: "outerwear",
    price: 289,
    compareAt: 359,
    sizes: ["46", "48", "50", "52", "54"],
    colors: ["Beige avena"],
    fabric: "80% lana vergine, 20% cashmere",
    fit: "Lungo al ginocchio, cintura in vita",
    care: "Solo pulizia specializzata",
    description:
      "Lana vergine con cashmere, doppiopetto e cintura per stringerlo quando serve. È il capo che fa girare la testa quando entri, senza urlare niente.",
    image: "/catalogo/trench.jpg",
    badge: "In promozione",
    stock: 2,
  },
  {
    id: "meridiano",
    name: "Meridiano",
    subtitle: "Cintura in cuoio con fibbia in ottone",
    category: "accessori",
    price: 59,
    sizes: ["90", "95", "100", "105", "110"],
    colors: ["Cuoio naturale", "Testa di moro"],
    fabric: "Cuoio pieno fiore 3,5 mm, fibbia in ottone massiccio",
    fit: "Altezza 3,5 cm",
    care: "Nutrire con crema neutra due volte l'anno",
    description:
      "Cuoio spesso che si ammorbidisce sulla tua vita e fibbia in ottone che non diventa verde. Si accorcia in negozio mentre aspetti.",
    image: "/catalogo/cintura-cuoio.jpg",
    stock: 8,
  },
  {
    id: "riflesso",
    name: "Riflesso",
    subtitle: "Occhiali da sole in acetato",
    category: "accessori",
    price: 89,
    sizes: ["Taglia unica"],
    colors: ["Nero lucido", "Havana"],
    fabric: "Acetato italiano, lenti polarizzate categoria 3",
    fit: "Calibro 52, ponte 20",
    care: "Custodia rigida inclusa",
    description:
      "Acetato italiano lavorato dal pieno e lenti polarizzate vere. Montatura squadrata che tiene bene sul viso ovale e su quello squadrato.",
    image: "/catalogo/occhiali-sole.jpg",
    stock: 5,
  },
  {
    id: "vetta",
    name: "Vetta",
    subtitle: "Berretto in lana a coste",
    category: "accessori",
    price: 39,
    sizes: ["Taglia unica"],
    colors: ["Nero", "Grigio", "Panna"],
    fabric: "100% lana merino extrafine",
    fit: "Risvolto regolabile",
    care: "Lavaggio a mano in acqua fredda",
    description:
      "Merino extrafine che non prude sulla fronte e risvolto che regoli come vuoi. Piccolo prezzo, differenza enorme a gennaio.",
    image: "/catalogo/berretto-lana.jpg",
    stock: 9,
  },
];

export const ambientImages = {
  interior: "/catalogo/amb-interno.jpg",
  rack: "/catalogo/amb-rack.jpg",
  leather: "/catalogo/amb-pelle.jpg",
  denim: "/catalogo/amb-denim.jpg",
} as const;

export function formatPrice(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function findVariant(product: Product, size: string, color: string) {
  return product.variants?.find(
    (variant) => variant.size === size && variant.color === color,
  );
}

export function variantAvailable(product: Product, size: string, color: string) {
  const variant = findVariant(product, size, color);
  if (variant) return variant.stock;
  return product.stock;
}

const CATEGORY_GALLERY: Record<string, string[]> = {
  top: [
    "/catalogo/amb-rack.jpg",
    "/catalogo/tshirt-bianca.jpg",
    "/catalogo/camicia-bianca.jpg",
    "/catalogo/polo-bianca.jpg",
  ],
  denim: [
    "/catalogo/amb-denim.jpg",
    "/catalogo/jeans-indaco.jpg",
    "/catalogo/giacca-denim.jpg",
    "/catalogo/camicia-denim.jpg",
  ],
  outerwear: [
    "/catalogo/amb-pelle.jpg",
    "/catalogo/giubbotto-pelle.jpg",
    "/catalogo/giacca-pelle-cuoio.jpg",
    "/catalogo/bomber-cammello.jpg",
  ],
  accessori: [
    "/catalogo/amb-interno.jpg",
    "/catalogo/cintura-cuoio.jpg",
    "/catalogo/occhiali-sole.jpg",
    "/catalogo/berretto-lana.jpg",
  ],
};

/** Palette e filtri per le varianti colore del catalogo dimostrativo. */
export const colorLooks: Record<string, ColorLook> = {
  "Bianco ottico": { hex: "#f4f1ea" },
  Bianco: { hex: "#f2efe8" },
  "Bianco panna": { hex: "#ebe4d4" },
  Panna: { hex: "#e8dfcc" },
  Sabbia: { hex: "#c4b08a", filter: "sepia(0.42) saturate(0.55) brightness(0.92)" },
  "Beige naturale": { hex: "#c9b89a", filter: "sepia(0.35) saturate(0.5) brightness(0.9)" },
  "Beige avena": { hex: "#d4c4a4" },
  Cammello: { hex: "#b9895a" },
  Cuoio: { hex: "#8a5a32" },
  "Cuoio naturale": { hex: "#a56b3c" },
  "Testa di moro": {
    hex: "#4a2e22",
    filter: "sepia(0.55) hue-rotate(-12deg) brightness(0.45) contrast(1.15)",
  },
  Havana: { hex: "#6b3f24", filter: "sepia(0.7) hue-rotate(-8deg) saturate(1.1) brightness(0.55)" },
  Nero: { hex: "#1a1a1a", filter: "brightness(0.28) contrast(1.2) grayscale(0.45)" },
  "Nero pieno": { hex: "#111111" },
  "Nero lucido": { hex: "#0d0d0d", filter: "brightness(0.32) contrast(1.25) grayscale(0.3)" },
  "Grigio pietra": { hex: "#8a8680", filter: "grayscale(0.85) brightness(0.78) contrast(1.05)" },
  "Grigio melange": { hex: "#9a9792", filter: "grayscale(0.8) brightness(0.82)" },
  Grigio: { hex: "#7d7d7d", filter: "grayscale(1) brightness(0.7)" },
  "Azzurro polvere": {
    hex: "#9bb7c9",
    filter: "sepia(0.2) hue-rotate(180deg) saturate(0.7) brightness(0.92)",
  },
  "Blu notte": {
    hex: "#1c2a44",
    filter: "hue-rotate(205deg) saturate(0.7) brightness(0.42) contrast(1.15)",
  },
  "Blu medio": { hex: "#3d5a7a" },
  "Blu chiaro": { hex: "#7fa0bd" },
  "Indaco scuro": { hex: "#2c3d5c" },
  "Verde salvia": {
    hex: "#7d8f74",
    filter: "sepia(0.25) hue-rotate(55deg) saturate(0.55) brightness(0.82)",
  },
};

/** Parole-chiave. In matching vince la più lunga, così "verde salvia" batte "verde". */
const COLOR_TOKENS: Array<{ key: string; hex: string; filter?: string }> = [
  { key: "carta da zucchero", hex: "#8eb8d4" },
  { key: "terra di siena", hex: "#a85a2a" },
  { key: "testa di moro", hex: "#4a2e22" },
  { key: "azzurro polvere", hex: "#9bb7c9" },
  { key: "bianco ottico", hex: "#f4f1ea" },
  { key: "bianco panna", hex: "#ebe4d4" },
  { key: "rosa antico", hex: "#c98a8a" },
  { key: "rosa cipria", hex: "#e8c4c0" },
  { key: "verde salvia", hex: "#7d8f74" },
  { key: "verde bosco", hex: "#2f4a32" },
  { key: "blu notte", hex: "#1c2a44" },
  { key: "acquamarina", hex: "#5fb8b0" },
  { key: "caffelatte", hex: "#c4a07a" },
  { key: "cioccolato", hex: "#5a3218" },
  { key: "melanzana", hex: "#4a2740" },
  { key: "terracotta", hex: "#c45c3a" },
  { key: "laterizio", hex: "#b54a32" },
  { key: "antracite", hex: "#3a3a3e" },
  { key: "champagne", hex: "#c9a96a" },
  { key: "pistacchio", hex: "#9bb86a" },
  { key: "eucalipto", hex: "#6a8f7a" },
  { key: "malachite", hex: "#1f6b4a" },
  { key: "smeraldo", hex: "#2e6b4a" },
  { key: "turchese", hex: "#2a9b9b" },
  { key: "petrolio", hex: "#1f4d55" },
  { key: "ottanio", hex: "#2a6b6b" },
  { key: "pervinca", hex: "#7a8ac8" },
  { key: "glicine", hex: "#b8a0d0" },
  { key: "lavanda", hex: "#a090c4" },
  { key: "ametista", hex: "#7a4a8a" },
  { key: "orchidea", hex: "#c070a8" },
  { key: "vinaccia", hex: "#6a243c" },
  { key: "borgogna", hex: "#6e1f32" },
  { key: "bordeaux", hex: "#6e1f32" },
  { key: "burgundy", hex: "#6e1f32" },
  { key: "scarlatto", hex: "#c41e2a" },
  { key: "vermiglio", hex: "#c43228" },
  { key: "carminio", hex: "#9b1c2c" },
  { key: "ciliegia", hex: "#9b1c2c" },
  { key: "papavero", hex: "#c4282e" },
  { key: "geranio", hex: "#d04048" },
  { key: "lampone", hex: "#c2365a" },
  { key: "fragola", hex: "#d03a48" },
  { key: "anguria", hex: "#d45a62" },
  { key: "albicocca", hex: "#e09a6a" },
  { key: "mandarino", hex: "#e87828" },
  { key: "arancione", hex: "#e07a2f" },
  { key: "caramello", hex: "#c4893c" },
  { key: "zafferano", hex: "#d49a1e" },
  { key: "mostarda", hex: "#c4a035" },
  { key: "cannella", hex: "#9a5a2a" },
  { key: "castagna", hex: "#6a3a1e" },
  { key: "nocciola", hex: "#8a5a32" },
  { key: "tabacco", hex: "#6b4424" },
  { key: "visone", hex: "#8a6e55" },
  { key: "cammello", hex: "#b9895a" },
  { key: "militare", hex: "#4a5a3a" },
  { key: "grafite", hex: "#4a4a4e" },
  { key: "platino", hex: "#c8c4bc" },
  { key: "bronzo", hex: "#8a5a28" },
  { key: "ottone", hex: "#c4a04a" },
  { key: "acciaio", hex: "#7a848c" },
  { key: "ardesia", hex: "#5a646c" },
  { key: "cemento", hex: "#8a8884" },
  { key: "confetto", hex: "#f0c8d4" },
  { key: "cipria", hex: "#e8c4c0" },
  { key: "salmone", hex: "#e09078" },
  { key: "corallo", hex: "#d07058" },
  { key: "ruggine", hex: "#a84828" },
  { key: "mattone", hex: "#b44a32" },
  { key: "paprika", hex: "#c43a1e" },
  { key: "senape", hex: "#c4a035" },
  { key: "giallo", hex: "#e0c040" },
  { key: "yellow", hex: "#e0c040" },
  { key: "limone", hex: "#e8d44a" },
  { key: "ambra", hex: "#d4922a" },
  { key: "amber", hex: "#d4922a" },
  { key: "miele", hex: "#d4a84a" },
  { key: "toffee", hex: "#b07a38" },
  { key: "cognac", hex: "#8a4a22" },
  { key: "brandy", hex: "#8a4a22" },
  { key: "whisky", hex: "#9a5a28" },
  { key: "caffe", hex: "#4a2e1c" },
  { key: "mocha", hex: "#6b3f2a" },
  { key: "mocca", hex: "#6b3f2a" },
  { key: "cacao", hex: "#6b3a22" },
  { key: "espresso", hex: "#2e1c12" },
  { key: "cuoio", hex: "#8a5a32" },
  { key: "daino", hex: "#c4a06a" },
  { key: "sella", hex: "#6b3f24" },
  { key: "havana", hex: "#6b3f24" },
  { key: "siena", hex: "#a85a2a" },
  { key: "ocra", hex: "#c48a2a" },
  { key: "curry", hex: "#c49a28" },
  { key: "mais", hex: "#e0c45a" },
  { key: "paglia", hex: "#dcc88a" },
  { key: "lino", hex: "#d4c4a4" },
  { key: "ecru", hex: "#d8cbb0" },
  { key: "avena", hex: "#d4c4a4" },
  { key: "mandorla", hex: "#e0c8a4" },
  { key: "vaniglia", hex: "#efe4c4" },
  { key: "burro", hex: "#efe6c8" },
  { key: "latte", hex: "#f0e6d6" },
  { key: "panna", hex: "#e8dfcc" },
  { key: "crema", hex: "#efe6d2" },
  { key: "avorio", hex: "#f2efe8" },
  { key: "gesso", hex: "#eceae4" },
  { key: "calce", hex: "#e8e4d4" },
  { key: "neve", hex: "#f5f3ef" },
  { key: "greige", hex: "#b8aea0" },
  { key: "talpa", hex: "#8a7a6a" },
  { key: "taupe", hex: "#8a7a6a" },
  { key: "fango", hex: "#7a6a54" },
  { key: "creta", hex: "#b49a78" },
  { key: "argilla", hex: "#b48a64" },
  { key: "pietra", hex: "#8a8680" },
  { key: "fumo", hex: "#6a6a6e" },
  { key: "piombo", hex: "#5c6064" },
  { key: "ferro", hex: "#5a5c60" },
  { key: "carbone", hex: "#2a2a2c" },
  { key: "ebano", hex: "#1a1614" },
  { key: "onice", hex: "#1c1c1e" },
  { key: "inchiostro", hex: "#1a1e28" },
  { key: "sabbia", hex: "#c4b08a" },
  { key: "deserto", hex: "#c4a878" },
  { key: "beige", hex: "#c9b89a" },
  { key: "crudo", hex: "#e4d8c4" },
  { key: "grezzo", hex: "#d8ccb4" },
  { key: "khaki", hex: "#9a8f5a" },
  { key: "safari", hex: "#b8a06a" },
  { key: "oliva", hex: "#6b7a3a" },
  { key: "olive", hex: "#6b7a3a" },
  { key: "salvia", hex: "#7d8f74" },
  { key: "muschio", hex: "#5a6b3a" },
  { key: "felce", hex: "#4a7a4a" },
  { key: "prato", hex: "#3a7a3a" },
  { key: "bosco", hex: "#2f4a32" },
  { key: "foresta", hex: "#2a4a32" },
  { key: "abete", hex: "#2a4a38" },
  { key: "pino", hex: "#2a4a38" },
  { key: "giada", hex: "#3a8a6a" },
  { key: "menta", hex: "#7eb89a" },
  { key: "lime", hex: "#b4d44a" },
  { key: "cactus", hex: "#4a7a4a" },
  { key: "army", hex: "#4a5a3a" },
  { key: "verde", hex: "#3f7a45" },
  { key: "green", hex: "#3f7a45" },
  { key: "laguna", hex: "#3a9aa8" },
  { key: "oceano", hex: "#2a5a78" },
  { key: "pavone", hex: "#1a6a7a" },
  { key: "denim", hex: "#3d5a7a" },
  { key: "jeans", hex: "#3d5a7a" },
  { key: "cobalto", hex: "#2a4a9a" },
  { key: "zaffiro", hex: "#244a8a" },
  { key: "royal", hex: "#2a3a8a" },
  { key: "marino", hex: "#1c2a44" },
  { key: "navy", hex: "#1c2a44" },
  { key: "avio", hex: "#4a6a8a" },
  { key: "china", hex: "#3a4a6a" },
  { key: "celeste", hex: "#8ec4e0" },
  { key: "azzurro", hex: "#6ea4c8" },
  { key: "cielo", hex: "#7eb4d4" },
  { key: "ghiaccio", hex: "#d4e0e8" },
  { key: "indaco", hex: "#3a4a7a" },
  { key: "blu", hex: "#2c4a7a" },
  { key: "blue", hex: "#2c4a7a" },
  { key: "porpora", hex: "#6a2458" },
  { key: "prugna", hex: "#5a2a4a" },
  { key: "granata", hex: "#7a2438" },
  { key: "rubino", hex: "#9b1c3c" },
  { key: "lilla", hex: "#b48ac8" },
  { key: "malva", hex: "#b080a0" },
  { key: "viola", hex: "#6a4a8a" },
  { key: "magenta", hex: "#b03070" },
  { key: "fucsia", hex: "#d04090" },
  { key: "blush", hex: "#e0a8a8" },
  { key: "nude", hex: "#e0c4b0" },
  { key: "pesca", hex: "#e8b090" },
  { key: "rosa", hex: "#d48aa0" },
  { key: "pink", hex: "#d48aa0" },
  { key: "rosso", hex: "#b42a2a" },
  { key: "red", hex: "#b42a2a" },
  { key: "zucca", hex: "#e07028" },
  { key: "arancio", hex: "#e07a2f" },
  { key: "orange", hex: "#e07a2f" },
  { key: "rame", hex: "#b86a3a" },
  { key: "ramato", hex: "#b86a3a" },
  { key: "oro", hex: "#c9a96a" },
  { key: "gold", hex: "#c9a96a" },
  { key: "argento", hex: "#b8b8bc" },
  { key: "silver", hex: "#b8b8bc" },
  { key: "perla", hex: "#e4ddd4" },
  { key: "grigio", hex: "#7d7d7d" },
  { key: "grey", hex: "#7d7d7d" },
  { key: "gray", hex: "#7d7d7d" },
  { key: "marrone", hex: "#6b3f24" },
  { key: "brown", hex: "#6b3f24" },
  { key: "bianco", hex: "#f4f1ea" },
  { key: "white", hex: "#f4f1ea" },
  { key: "nero", hex: "#1a1a1a" },
  { key: "black", hex: "#1a1a1a" },
].sort((a, b) => b.key.length - a.key.length);

function foldColorName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9#]+/g, " ")
    .trim();
}

function expandHex(hex: string) {
  const raw = hex.replace("#", "");
  if (raw.length === 3) {
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`;
  }
  return `#${raw}`;
}

function shadeHex(hex: string, amount: number) {
  const raw = expandHex(hex).slice(1);
  const mix = amount < 0 ? 0 : 255;
  const t = Math.abs(amount);
  const channel = (pair: string) => {
    const value = parseInt(pair, 16);
    return Math.round(value + (mix - value) * t)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(raw.slice(0, 2))}${channel(raw.slice(2, 4))}${channel(raw.slice(4, 6))}`;
}

function hasWord(haystack: string, needle: string) {
  return ` ${haystack} `.includes(` ${needle} `);
}

export function getColorLook(name: string): ColorLook {
  const raw = name.trim();
  if (!raw) return { hex: "#a2b29f" };

  const hexMatch = raw.match(/#([0-9a-f]{3}|[0-9a-f]{6})\b/i);
  if (hexMatch) return { hex: expandHex(hexMatch[0]) };

  const folded = foldColorName(raw);
  const exact = Object.entries(colorLooks).find(([key]) => foldColorName(key) === folded);
  if (exact) return exact[1];

  const token = COLOR_TOKENS.find((entry) => hasWord(folded, entry.key));
  if (!token) return { hex: "#a2b29f" };

  let hex = token.hex;
  if (/\b(scuro|scura|intenso|intensa|notte|night)\b/.test(folded) && !token.key.includes("notte")) {
    hex = shadeHex(hex, -0.28);
  } else if (/\b(chiaro|chiara|polvere|pastello|pallido|pallida)\b/.test(folded)) {
    hex = shadeHex(hex, 0.32);
  }
  return { hex, filter: token.filter };
}

/** Foto da mostrare per la colorazione scelta, altrimenti la copertina. */
export function productImageForColor(product: Product, color?: string) {
  if (color && product.colorImages?.[color]) return product.colorImages[color];
  return product.image;
}

/** Foto del capo: colorazione scelta in testa, poi copertina e viste alternative. */
export function getGallery(product: Product, color?: string): string[] {
  const preferred = productImageForColor(product, color);
  const extras = [
    product.image,
    ...(product.gallery ?? CATEGORY_GALLERY[product.category] ?? CATEGORY_GALLERY.top),
    ...Object.values(product.colorImages ?? {}),
  ].filter((src) => src && src !== preferred);
  return [preferred, ...new Set(extras)].slice(0, 6);
}
