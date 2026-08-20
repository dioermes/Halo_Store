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
