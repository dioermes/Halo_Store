import { writeFileSync } from "node:fs";

export const CATEGORY_GALLERY = {
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

export const products = [
  {
    slug: "aurora",
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
    slug: "lume",
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
    slug: "meriggio",
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
    slug: "bruma",
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
    slug: "nembo",
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
    slug: "indaco",
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
    slug: "notturno",
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
    slug: "zenit",
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
    slug: "riva",
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
    slug: "eclissi",
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
    slug: "duna",
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
    slug: "ambra",
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
    slug: "alba",
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
    slug: "meridiano",
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
    slug: "riflesso",
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
    slug: "vetta",
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

function sqlStr(value) {
  if (value == null) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function gallery(product) {
  const extras = CATEGORY_GALLERY[product.category].filter((src) => src !== product.image);
  return [product.image, ...extras].slice(0, 4);
}

const statements = ["delete from public.halo_order_items;", "delete from public.halo_stock_holds;", "delete from public.halo_cart_items;", "delete from public.halo_stock_alerts;", "delete from public.halo_product_images;", "delete from public.halo_variants;", "delete from public.halo_products;"];

products.forEach((product, index) => {
  statements.push(`
insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  ${sqlStr(product.slug)},
  ${sqlStr(product.name)},
  ${sqlStr(product.subtitle)},
  ${sqlStr(product.category)},
  ${product.price * 100},
  ${product.compareAt ? product.compareAt * 100 : "null"},
  ${sqlStr(product.fabric)},
  ${sqlStr(product.fit)},
  ${sqlStr(product.care)},
  ${sqlStr(product.description)},
  ${product.badge ? sqlStr(product.badge) : "null"},
  true,
  ${index}
);`);

  gallery(product).forEach((url, imageIndex) => {
    statements.push(`
insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, ${sqlStr(url)}, ${sqlStr(product.name)}, ${imageIndex}
from public.halo_products where slug = ${sqlStr(product.slug)};`);
  });

  let remaining = product.stock;
  for (const color of product.colors) {
    for (const size of product.sizes) {
      const qty = remaining > 0 ? 1 : 0;
      if (qty) remaining -= 1;
      const sku = `${product.slug}-${size}-${color}`
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("'", "");
      statements.push(`
insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, ${sqlStr(size)}, ${sqlStr(color)}, ${sqlStr(sku)}, ${qty}, 2
from public.halo_products where slug = ${sqlStr(product.slug)};`);
    }
  }
  if (remaining > 0) {
    statements.push(`
update public.halo_variants v
set stock = v.stock + ${remaining}
from public.halo_products p
where v.product_id = p.id and p.slug = ${sqlStr(product.slug)}
  and v.id = (
    select v2.id from public.halo_variants v2
    where v2.product_id = p.id
    order by v2.size, v2.color
    limit 1
  );`);
  }
});

if (import.meta.url === `file://${process.argv[1].replaceAll("\\", "/")}` || process.argv[1]?.endsWith("generate-halo-seed.mjs")) {
  writeFileSync(new URL("../supabase/seed-halo.sql", import.meta.url), statements.join("\n"));
  console.log(`wrote ${statements.length} statements`);
}
