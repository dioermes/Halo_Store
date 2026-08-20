
insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'notturno',
  'Notturno',
  'Jeans neri a gamba dritta',
  'denim',
  10900,
  null,
  'Denim tinto in capo 12 oz, 99% cotone',
  'Dritto dal ginocchio',
  'Lavaggio a freddo per mantenere il nero',
  'Nero pieno tinto in capo, gamba dritta che cade pulita sulla scarpa. Il jeans che risolve la serata quando non hai voglia di pensarci.',
  null,
  true,
  6
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/jeans-neri.jpg', 'Notturno', 0
from public.halo_products where slug = 'notturno';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-denim.jpg', 'Notturno', 1
from public.halo_products where slug = 'notturno';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/jeans-indaco.jpg', 'Notturno', 2
from public.halo_products where slug = 'notturno';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giacca-denim.jpg', 'Notturno', 3
from public.halo_products where slug = 'notturno';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '28', 'Nero pieno', 'notturno-28-nero-pieno', 1, 2
from public.halo_products where slug = 'notturno';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '30', 'Nero pieno', 'notturno-30-nero-pieno', 1, 2
from public.halo_products where slug = 'notturno';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '32', 'Nero pieno', 'notturno-32-nero-pieno', 1, 2
from public.halo_products where slug = 'notturno';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '34', 'Nero pieno', 'notturno-34-nero-pieno', 1, 2
from public.halo_products where slug = 'notturno';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '36', 'Nero pieno', 'notturno-36-nero-pieno', 1, 2
from public.halo_products where slug = 'notturno';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'zenit',
  'Zenit',
  'Giacca in denim lavato',
  'denim',
  13900,
  null,
  '100% cotone denim 11 oz, lavaggio stone',
  'Corta in vita, spalla strutturata',
  'Lavaggio a 30 gradi separato',
  'Il trucker classico fatto bene: doppia tasca al petto, cintura regolabile sul fondo e un lavaggio stone che la fa sembrare già tua dal primo giorno.',
  null,
  true,
  7
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giacca-denim.jpg', 'Zenit', 0
from public.halo_products where slug = 'zenit';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-denim.jpg', 'Zenit', 1
from public.halo_products where slug = 'zenit';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/jeans-indaco.jpg', 'Zenit', 2
from public.halo_products where slug = 'zenit';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/camicia-denim.jpg', 'Zenit', 3
from public.halo_products where slug = 'zenit';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Blu medio', 'zenit-s-blu-medio', 1, 2
from public.halo_products where slug = 'zenit';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Blu medio', 'zenit-m-blu-medio', 1, 2
from public.halo_products where slug = 'zenit';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Blu medio', 'zenit-l-blu-medio', 1, 2
from public.halo_products where slug = 'zenit';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Blu medio', 'zenit-xl-blu-medio', 0, 2
from public.halo_products where slug = 'zenit';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'riva',
  'Riva',
  'Camicia in denim leggero',
  'denim',
  8900,
  null,
  '100% cotone chambray, 6 oz',
  'Regolare, taschini con patta',
  'Lavaggio a 30 gradi',
  'Chambray leggero che si porta aperto sopra una t-shirt o chiuso sotto un maglione. Uno di quei capi che finisci per mettere tre volte a settimana.',
  null,
  true,
  8
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/camicia-denim.jpg', 'Riva', 0
from public.halo_products where slug = 'riva';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-denim.jpg', 'Riva', 1
from public.halo_products where slug = 'riva';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/jeans-indaco.jpg', 'Riva', 2
from public.halo_products where slug = 'riva';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giacca-denim.jpg', 'Riva', 3
from public.halo_products where slug = 'riva';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Blu chiaro', 'riva-s-blu-chiaro', 1, 2
from public.halo_products where slug = 'riva';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Blu chiaro', 'riva-m-blu-chiaro', 1, 2
from public.halo_products where slug = 'riva';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Blu chiaro', 'riva-l-blu-chiaro', 1, 2
from public.halo_products where slug = 'riva';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Blu chiaro', 'riva-xl-blu-chiaro', 1, 2
from public.halo_products where slug = 'riva';

update public.halo_variants v
set stock = v.stock + 2
from public.halo_products p
where v.product_id = p.id and p.slug = 'riva'
  and v.id = (
    select v2.id from public.halo_variants v2
    where v2.product_id = p.id
    order by v2.size, v2.color
    limit 1
  );

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'eclissi',
  'Eclissi',
  'Giubbotto in pelle di agnello',
  'outerwear',
  32900,
  null,
  'Pelle di agnello nappa, fodera in cupro',
  'Aderente, zip asimmetrica',
  'Solo pulizia specializzata',
  'Nappa di agnello morbidissima, zip metallica pesante e fodera in cupro che scivola sopra il maglione. Il pezzo forte del negozio, ed è uno solo per taglia.',
  'Pezzo unico',
  true,
  9
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giubbotto-pelle.jpg', 'Eclissi', 0
from public.halo_products where slug = 'eclissi';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-pelle.jpg', 'Eclissi', 1
from public.halo_products where slug = 'eclissi';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giacca-pelle-cuoio.jpg', 'Eclissi', 2
from public.halo_products where slug = 'eclissi';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/bomber-cammello.jpg', 'Eclissi', 3
from public.halo_products where slug = 'eclissi';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Nero', 'eclissi-s-nero', 1, 2
from public.halo_products where slug = 'eclissi';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Nero', 'eclissi-m-nero', 0, 2
from public.halo_products where slug = 'eclissi';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Nero', 'eclissi-l-nero', 0, 2
from public.halo_products where slug = 'eclissi';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Nero', 'eclissi-xl-nero', 0, 2
from public.halo_products where slug = 'eclissi';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'duna',
  'Duna',
  'Bomber cammello imbottito',
  'outerwear',
  19900,
  null,
  'Esterno tecnico idrorepellente, imbottitura termica',
  'Regolare, bordi a costina',
  'Lavaggio a 30 gradi delicato',
  'Idrorepellente fuori, caldo dentro, leggero come una felpa. Un cammello che sta bene con il denim e con qualunque cosa tu abbia già nell''armadio.',
  'Nuovo arrivo',
  true,
  10
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/bomber-cammello.jpg', 'Duna', 0
from public.halo_products where slug = 'duna';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-pelle.jpg', 'Duna', 1
from public.halo_products where slug = 'duna';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giubbotto-pelle.jpg', 'Duna', 2
from public.halo_products where slug = 'duna';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giacca-pelle-cuoio.jpg', 'Duna', 3
from public.halo_products where slug = 'duna';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Cammello', 'duna-m-cammello', 1, 2
from public.halo_products where slug = 'duna';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Cammello', 'duna-l-cammello', 1, 2
from public.halo_products where slug = 'duna';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Cammello', 'duna-xl-cammello', 0, 2
from public.halo_products where slug = 'duna';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'ambra',
  'Ambra',
  'Giacca in pelle cuoio',
  'outerwear',
  34900,
  null,
  'Pelle bovina pieno fiore conciata al vegetale',
  'Regolare, collo a camicia',
  'Solo pulizia specializzata',
  'Conciata al vegetale, quindi cambia colore con il sole e con l''uso. Fra due anni sarà più bella di adesso, ed è esattamente il punto.',
  null,
  true,
  11
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giacca-pelle-cuoio.jpg', 'Ambra', 0
from public.halo_products where slug = 'ambra';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-pelle.jpg', 'Ambra', 1
from public.halo_products where slug = 'ambra';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giubbotto-pelle.jpg', 'Ambra', 2
from public.halo_products where slug = 'ambra';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/bomber-cammello.jpg', 'Ambra', 3
from public.halo_products where slug = 'ambra';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Cuoio', 'ambra-m-cuoio', 1, 2
from public.halo_products where slug = 'ambra';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Cuoio', 'ambra-l-cuoio', 1, 2
from public.halo_products where slug = 'ambra';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Cuoio', 'ambra-xl-cuoio', 0, 2
from public.halo_products where slug = 'ambra';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'alba',
  'Alba',
  'Cappotto doppiopetto in lana',
  'outerwear',
  28900,
  35900,
  '80% lana vergine, 20% cashmere',
  'Lungo al ginocchio, cintura in vita',
  'Solo pulizia specializzata',
  'Lana vergine con cashmere, doppiopetto e cintura per stringerlo quando serve. È il capo che fa girare la testa quando entri, senza urlare niente.',
  'In promozione',
  true,
  12
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/trench.jpg', 'Alba', 0
from public.halo_products where slug = 'alba';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-pelle.jpg', 'Alba', 1
from public.halo_products where slug = 'alba';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giubbotto-pelle.jpg', 'Alba', 2
from public.halo_products where slug = 'alba';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giacca-pelle-cuoio.jpg', 'Alba', 3
from public.halo_products where slug = 'alba';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '46', 'Beige avena', 'alba-46-beige-avena', 1, 2
from public.halo_products where slug = 'alba';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '48', 'Beige avena', 'alba-48-beige-avena', 1, 2
from public.halo_products where slug = 'alba';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '50', 'Beige avena', 'alba-50-beige-avena', 0, 2
from public.halo_products where slug = 'alba';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '52', 'Beige avena', 'alba-52-beige-avena', 0, 2
from public.halo_products where slug = 'alba';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '54', 'Beige avena', 'alba-54-beige-avena', 0, 2
from public.halo_products where slug = 'alba';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'meridiano',
  'Meridiano',
  'Cintura in cuoio con fibbia in ottone',
  'accessori',
  5900,
  null,
  'Cuoio pieno fiore 3,5 mm, fibbia in ottone massiccio',
  'Altezza 3,5 cm',
  'Nutrire con crema neutra due volte l''anno',
  'Cuoio spesso che si ammorbidisce sulla tua vita e fibbia in ottone che non diventa verde. Si accorcia in negozio mentre aspetti.',
  null,
  true,
  13
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/cintura-cuoio.jpg', 'Meridiano', 0
from public.halo_products where slug = 'meridiano';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-interno.jpg', 'Meridiano', 1
from public.halo_products where slug = 'meridiano';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/occhiali-sole.jpg', 'Meridiano', 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/berretto-lana.jpg', 'Meridiano', 3
from public.halo_products where slug = 'meridiano';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '90', 'Cuoio naturale', 'meridiano-90-cuoio-naturale', 1, 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '95', 'Cuoio naturale', 'meridiano-95-cuoio-naturale', 1, 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '100', 'Cuoio naturale', 'meridiano-100-cuoio-naturale', 1, 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '105', 'Cuoio naturale', 'meridiano-105-cuoio-naturale', 1, 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '110', 'Cuoio naturale', 'meridiano-110-cuoio-naturale', 1, 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '90', 'Testa di moro', 'meridiano-90-testa-di-moro', 1, 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '95', 'Testa di moro', 'meridiano-95-testa-di-moro', 1, 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '100', 'Testa di moro', 'meridiano-100-testa-di-moro', 1, 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '105', 'Testa di moro', 'meridiano-105-testa-di-moro', 0, 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '110', 'Testa di moro', 'meridiano-110-testa-di-moro', 0, 2
from public.halo_products where slug = 'meridiano';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'riflesso',
  'Riflesso',
  'Occhiali da sole in acetato',
  'accessori',
  8900,
  null,
  'Acetato italiano, lenti polarizzate categoria 3',
  'Calibro 52, ponte 20',
  'Custodia rigida inclusa',
  'Acetato italiano lavorato dal pieno e lenti polarizzate vere. Montatura squadrata che tiene bene sul viso ovale e su quello squadrato.',
  null,
  true,
  14
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/occhiali-sole.jpg', 'Riflesso', 0
from public.halo_products where slug = 'riflesso';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-interno.jpg', 'Riflesso', 1
from public.halo_products where slug = 'riflesso';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/cintura-cuoio.jpg', 'Riflesso', 2
from public.halo_products where slug = 'riflesso';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/berretto-lana.jpg', 'Riflesso', 3
from public.halo_products where slug = 'riflesso';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'Taglia unica', 'Nero lucido', 'riflesso-taglia-unica-nero-lucido', 1, 2
from public.halo_products where slug = 'riflesso';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'Taglia unica', 'Havana', 'riflesso-taglia-unica-havana', 1, 2
from public.halo_products where slug = 'riflesso';

update public.halo_variants v
set stock = v.stock + 3
from public.halo_products p
where v.product_id = p.id and p.slug = 'riflesso'
  and v.id = (
    select v2.id from public.halo_variants v2
    where v2.product_id = p.id
    order by v2.size, v2.color
    limit 1
  );

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'vetta',
  'Vetta',
  'Berretto in lana a coste',
  'accessori',
  3900,
  null,
  '100% lana merino extrafine',
  'Risvolto regolabile',
  'Lavaggio a mano in acqua fredda',
  'Merino extrafine che non prude sulla fronte e risvolto che regoli come vuoi. Piccolo prezzo, differenza enorme a gennaio.',
  null,
  true,
  15
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/berretto-lana.jpg', 'Vetta', 0
from public.halo_products where slug = 'vetta';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-interno.jpg', 'Vetta', 1
from public.halo_products where slug = 'vetta';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/cintura-cuoio.jpg', 'Vetta', 2
from public.halo_products where slug = 'vetta';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/occhiali-sole.jpg', 'Vetta', 3
from public.halo_products where slug = 'vetta';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'Taglia unica', 'Nero', 'vetta-taglia-unica-nero', 1, 2
from public.halo_products where slug = 'vetta';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'Taglia unica', 'Grigio', 'vetta-taglia-unica-grigio', 1, 2
from public.halo_products where slug = 'vetta';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'Taglia unica', 'Panna', 'vetta-taglia-unica-panna', 1, 2
from public.halo_products where slug = 'vetta';

update public.halo_variants v
set stock = v.stock + 6
from public.halo_products p
where v.product_id = p.id and p.slug = 'vetta'
  and v.id = (
    select v2.id from public.halo_variants v2
    where v2.product_id = p.id
    order by v2.size, v2.color
    limit 1
  );