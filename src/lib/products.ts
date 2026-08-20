export type CategoryId = "top" | "denim" | "outerwear" | "accessori";

export type Product = {
  id: string;
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
  /** Etichetta breve mostrata sulla card, es. "Nuovo arrivo" */
  badge?: string;
  /** Pezzi realmente disponibili in negozio: alimenta il senso di urgenza */
  stock: number;
};

export type ColorLook = {
  hex: string;
  /** Filtro CSS per simulare la variante quando non c'e una foto dedicata */
  filter?: string;
};

export const categories: Array<{
  id: CategoryId | "tutti";
  label: string;
  hint: string;
}> = [
  { id: "tutti", label: "Tutto il negozio", hint: "16 capi" },
  { id: "top", label: "Top", hint: "T-shirt, camicie, maglieria" },
  { id: "denim", label: "Denim", hint: "Jeans e capispalla in tela" },
  { id: "outerwear", label: "Outerwear", hint: "Pelle, bomber, cappotti" },
  { id: "accessori", label: "Accessori", hint: "Il dettaglio che cambia tutto" },
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

const CATEGORY_GALLERY: Record<CategoryId, string[]> = {
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

export function getColorLook(name: string): ColorLook {
  return colorLooks[name] ?? { hex: "#c9a96a" };
}

/** Foto del capo: scatto principale + viste alternative, senza duplicati. */
export function getGallery(product: Product): string[] {
  const extras = (product.gallery ?? CATEGORY_GALLERY[product.category]).filter(
    (src) => src !== product.image,
  );
  return [product.image, ...extras].slice(0, 4);
}
