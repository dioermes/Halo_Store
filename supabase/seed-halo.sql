delete from public.halo_order_items;
delete from public.halo_stock_holds;
delete from public.halo_cart_items;
delete from public.halo_stock_alerts;
delete from public.halo_product_images;
delete from public.halo_variants;
delete from public.halo_products;

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'aurora',
  'Aurora',
  'T-shirt in cotone pettinato',
  'top',
  4500,
  null,
  '100% cotone pettinato, 190 g/mq',
  'Vestibilità regolare, spalla appena scesa',
  'Lavaggio a 30 gradi, no asciugatrice',
  'La base di tutto. Cotone pettinato pesante che non si deforma dopo il primo lavaggio, collo a costina rinforzato e cuciture piatte. Quella che compri una volta e cerchi ogni mattina.',
  'Best seller',
  true,
  0
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/tshirt-bianca.jpg', 'Aurora', 0
from public.halo_products where slug = 'aurora';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-rack.jpg', 'Aurora', 1
from public.halo_products where slug = 'aurora';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/camicia-bianca.jpg', 'Aurora', 2
from public.halo_products where slug = 'aurora';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/polo-bianca.jpg', 'Aurora', 3
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Bianco ottico', 'aurora-s-bianco-ottico', 1, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Bianco ottico', 'aurora-m-bianco-ottico', 1, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Bianco ottico', 'aurora-l-bianco-ottico', 1, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Bianco ottico', 'aurora-xl-bianco-ottico', 1, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XXL', 'Bianco ottico', 'aurora-xxl-bianco-ottico', 1, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Nero', 'aurora-s-nero', 1, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Nero', 'aurora-m-nero', 0, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Nero', 'aurora-l-nero', 0, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Nero', 'aurora-xl-nero', 0, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XXL', 'Nero', 'aurora-xxl-nero', 0, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Sabbia', 'aurora-s-sabbia', 0, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Sabbia', 'aurora-m-sabbia', 0, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Sabbia', 'aurora-l-sabbia', 0, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Sabbia', 'aurora-xl-sabbia', 0, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XXL', 'Sabbia', 'aurora-xxl-sabbia', 0, 2
from public.halo_products where slug = 'aurora';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'lume',
  'Lume',
  'Camicia in popeline di cotone',
  'top',
  7900,
  null,
  '100% popeline di cotone a filo doppio ritorto',
  'Slim morbido, collo italiano',
  'Lavaggio a 30 gradi, stiratura a media temperatura',
  'Il popeline a filo ritorto tiene la piega tutto il giorno e resta fresco sulla pelle. Collo italiano che regge bene sia la cravatta sia il primo bottone aperto.',
  null,
  true,
  1
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/camicia-bianca.jpg', 'Lume', 0
from public.halo_products where slug = 'lume';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-rack.jpg', 'Lume', 1
from public.halo_products where slug = 'lume';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/tshirt-bianca.jpg', 'Lume', 2
from public.halo_products where slug = 'lume';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/polo-bianca.jpg', 'Lume', 3
from public.halo_products where slug = 'lume';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Bianco', 'lume-s-bianco', 1, 2
from public.halo_products where slug = 'lume';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Bianco', 'lume-m-bianco', 1, 2
from public.halo_products where slug = 'lume';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Bianco', 'lume-l-bianco', 1, 2
from public.halo_products where slug = 'lume';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Bianco', 'lume-xl-bianco', 1, 2
from public.halo_products where slug = 'lume';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XXL', 'Bianco', 'lume-xxl-bianco', 0, 2
from public.halo_products where slug = 'lume';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Azzurro polvere', 'lume-s-azzurro-polvere', 0, 2
from public.halo_products where slug = 'lume';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Azzurro polvere', 'lume-m-azzurro-polvere', 0, 2
from public.halo_products where slug = 'lume';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Azzurro polvere', 'lume-l-azzurro-polvere', 0, 2
from public.halo_products where slug = 'lume';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Azzurro polvere', 'lume-xl-azzurro-polvere', 0, 2
from public.halo_products where slug = 'lume';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XXL', 'Azzurro polvere', 'lume-xxl-azzurro-polvere', 0, 2
from public.halo_products where slug = 'lume';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'meriggio',
  'Meriggio',
  'Polo in piquet di cotone',
  'top',
  6900,
  8900,
  '100% cotone piquet, bottoni in madreperla',
  'Regolare, fondo dritto',
  'Lavaggio a 30 gradi con capi simili',
  'Piquet compatto con costina ai bordi e tre bottoni in madreperla. Sta bene sotto una giacca leggera quanto sopra un paio di jeans.',
  'In promozione',
  true,
  2
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/polo-bianca.jpg', 'Meriggio', 0
from public.halo_products where slug = 'meriggio';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-rack.jpg', 'Meriggio', 1
from public.halo_products where slug = 'meriggio';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/tshirt-bianca.jpg', 'Meriggio', 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/camicia-bianca.jpg', 'Meriggio', 3
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Bianco', 'meriggio-s-bianco', 1, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Bianco', 'meriggio-m-bianco', 1, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Bianco', 'meriggio-l-bianco', 1, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Bianco', 'meriggio-xl-bianco', 0, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Blu notte', 'meriggio-s-blu-notte', 0, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Blu notte', 'meriggio-m-blu-notte', 0, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Blu notte', 'meriggio-l-blu-notte', 0, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Blu notte', 'meriggio-xl-blu-notte', 0, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Verde salvia', 'meriggio-s-verde-salvia', 0, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Verde salvia', 'meriggio-m-verde-salvia', 0, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Verde salvia', 'meriggio-l-verde-salvia', 0, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Verde salvia', 'meriggio-xl-verde-salvia', 0, 2
from public.halo_products where slug = 'meriggio';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'bruma',
  'Bruma',
  'Maglione a coste inglesi',
  'top',
  9500,
  null,
  '70% lana merino, 30% cotone',
  'Comoda, maniche a raglan',
  'Lavaggio a mano o programma lana',
  'Coste inglesi larghe e lana merino mescolata al cotone, per tenere il caldo senza pizzicare. Il capo che il titolare tira fuori quando dici che hai freddo ma non vuoi un piumino.',
  'Nuovo arrivo',
  true,
  3
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/maglione-coste.jpg', 'Bruma', 0
from public.halo_products where slug = 'bruma';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-rack.jpg', 'Bruma', 1
from public.halo_products where slug = 'bruma';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/tshirt-bianca.jpg', 'Bruma', 2
from public.halo_products where slug = 'bruma';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/camicia-bianca.jpg', 'Bruma', 3
from public.halo_products where slug = 'bruma';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Beige naturale', 'bruma-s-beige-naturale', 1, 2
from public.halo_products where slug = 'bruma';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Beige naturale', 'bruma-m-beige-naturale', 1, 2
from public.halo_products where slug = 'bruma';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Beige naturale', 'bruma-l-beige-naturale', 1, 2
from public.halo_products where slug = 'bruma';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Beige naturale', 'bruma-xl-beige-naturale', 1, 2
from public.halo_products where slug = 'bruma';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Grigio pietra', 'bruma-s-grigio-pietra', 1, 2
from public.halo_products where slug = 'bruma';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Grigio pietra', 'bruma-m-grigio-pietra', 0, 2
from public.halo_products where slug = 'bruma';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Grigio pietra', 'bruma-l-grigio-pietra', 0, 2
from public.halo_products where slug = 'bruma';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Grigio pietra', 'bruma-xl-grigio-pietra', 0, 2
from public.halo_products where slug = 'bruma';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'nembo',
  'Nembo',
  'Felpa con cappuccio garzata',
  'top',
  8900,
  null,
  '80% cotone, 20% poliestere, interno garzato 380 g/mq',
  'Oversize contenuto',
  'Lavaggio a 30 gradi al rovescio',
  'Garzatura interna densa, cappuccio a doppio strato che sta su davvero e polsini elasticizzati che non cedono. Peso pieno, non la solita felpa da catena.',
  null,
  true,
  4
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/felpa-cappuccio.jpg', 'Nembo', 0
from public.halo_products where slug = 'nembo';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-rack.jpg', 'Nembo', 1
from public.halo_products where slug = 'nembo';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/tshirt-bianca.jpg', 'Nembo', 2
from public.halo_products where slug = 'nembo';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/camicia-bianca.jpg', 'Nembo', 3
from public.halo_products where slug = 'nembo';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Bianco panna', 'nembo-s-bianco-panna', 1, 2
from public.halo_products where slug = 'nembo';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Bianco panna', 'nembo-m-bianco-panna', 1, 2
from public.halo_products where slug = 'nembo';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Bianco panna', 'nembo-l-bianco-panna', 1, 2
from public.halo_products where slug = 'nembo';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Bianco panna', 'nembo-xl-bianco-panna', 1, 2
from public.halo_products where slug = 'nembo';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XXL', 'Bianco panna', 'nembo-xxl-bianco-panna', 1, 2
from public.halo_products where slug = 'nembo';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'S', 'Grigio melange', 'nembo-s-grigio-melange', 1, 2
from public.halo_products where slug = 'nembo';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'M', 'Grigio melange', 'nembo-m-grigio-melange', 1, 2
from public.halo_products where slug = 'nembo';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'L', 'Grigio melange', 'nembo-l-grigio-melange', 0, 2
from public.halo_products where slug = 'nembo';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XL', 'Grigio melange', 'nembo-xl-grigio-melange', 0, 2
from public.halo_products where slug = 'nembo';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, 'XXL', 'Grigio melange', 'nembo-xxl-grigio-melange', 0, 2
from public.halo_products where slug = 'nembo';

insert into public.halo_products (
  slug, name, subtitle, category, price_cents, compare_at_cents, fabric, fit, care, description, badge, published, sort_order
) values (
  'indaco',
  'Indaco',
  'Jeans slim in denim selvedge',
  'denim',
  11900,
  null,
  'Denim selvedge 13,5 oz, 98% cotone 2% elastan',
  'Slim, cavallo medio',
  'Lavaggio al rovescio, poco e a freddo',
  'Selvedge da 13,5 once con una punta di elastan, per non combattere quando ti siedi. Si consuma dove ti muovi tu: dopo sei mesi è un jeans che nessun altro ha.',
  'Best seller',
  true,
  5
);

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/jeans-indaco.jpg', 'Indaco', 0
from public.halo_products where slug = 'indaco';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/amb-denim.jpg', 'Indaco', 1
from public.halo_products where slug = 'indaco';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/giacca-denim.jpg', 'Indaco', 2
from public.halo_products where slug = 'indaco';

insert into public.halo_product_images (product_id, url, alt, sort_order)
select id, '/catalogo/camicia-denim.jpg', 'Indaco', 3
from public.halo_products where slug = 'indaco';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '28', 'Indaco scuro', 'indaco-28-indaco-scuro', 1, 2
from public.halo_products where slug = 'indaco';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '30', 'Indaco scuro', 'indaco-30-indaco-scuro', 1, 2
from public.halo_products where slug = 'indaco';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '32', 'Indaco scuro', 'indaco-32-indaco-scuro', 1, 2
from public.halo_products where slug = 'indaco';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '34', 'Indaco scuro', 'indaco-34-indaco-scuro', 1, 2
from public.halo_products where slug = 'indaco';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '36', 'Indaco scuro', 'indaco-36-indaco-scuro', 0, 2
from public.halo_products where slug = 'indaco';

insert into public.halo_variants (product_id, size, color, sku, stock, low_stock_at)
select id, '38', 'Indaco scuro', 'indaco-38-indaco-scuro', 0, 2
from public.halo_products where slug = 'indaco';

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