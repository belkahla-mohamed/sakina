-- Sakina — schema + seed (generated from data/catalog.json)
-- Run in the Supabase SQL editor. Safe to re-run (upserts).

create table if not exists public.categories (
  slug text primary key,
  name_fr text not null,
  name_ar text not null,
  tagline_fr text,
  tagline_ar text,
  color text not null default '#FF6B9D',
  text text not null default 'light',
  icon text not null default 'gift',
  featured boolean not null default false
);

create table if not exists public.products (
  slug text primary key,
  name_fr text not null,
  name_ar text not null,
  category text not null references public.categories(slug) on delete cascade,
  price numeric(10,2) not null,
  old_price numeric(10,2),
  badge text check (badge in ('nouveau','promo','epuise')),
  rating numeric(2,1) not null default 5.0,
  reviews int not null default 0,
  stock int not null default 0,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  desc_fr text,
  desc_ar text,
  image text,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_bestseller_idx on public.products (is_bestseller desc);

alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "anon read categories" on public.categories;
create policy "anon read categories" on public.categories for select to anon using (true);

drop policy if exists "anon read products" on public.products;
create policy "anon read products" on public.products for select to anon using (true);

insert into public.categories (slug, name_fr, name_ar, tagline_fr, tagline_ar, color, text, icon, featured) values
  ('maison-deco', 'Maison & décoration', 'المنزل والديكور', 'Lumière, textiles, rangement et petits objets pour un intérieur qui vous ressemble.', 'إضاءة ومنسوجات وتخزين وقطع صغيرة لبيت يشبهك.', '#f4f0e6', 'dark', 'lamp', true),
  ('mode-accessoires', 'Mode & accessoires', 'الأزياء والإكسسوارات', 'Sacs, casquettes, lunettes et accessoires du quotidien.', 'حقائب وقبعات ونظارات شمسية وإكسسوارات يومية.', '#f4f0e6', 'dark', 'handbag', false),
  ('beaute-soins', 'Beauté & soins', 'الجمال والعناية', 'Soins, parfums et petits rituels sélectionnés pour le quotidien.', 'عناية وعطور وطقوس يومية مختارة بعناية.', '#f4f0e6', 'dark', 'sparkle', false),
  ('tech-accessoires', 'Accessoires tech', 'إكسسوارات تقنية', 'Écouteurs, chargeurs, coques et gadgets vraiment utiles.', 'سماعات وشواحن وأغلفة وأدوات تقنية مفيدة حقًا.', '#f4f0e6', 'dark', 'device', false),
  ('bureau-papeterie', 'Bureau & papeterie', 'المكتب والقرطاسية', 'Carnets, stylos et rangement pour bosser et étudier proprement.', 'دفاتر وأقلام وتنظيم للعمل والدراسة بأناقة.', '#f4f0e6', 'dark', 'pen', false)
on conflict (slug) do update set
  name_fr = excluded.name_fr, name_ar = excluded.name_ar,
  tagline_fr = excluded.tagline_fr, tagline_ar = excluded.tagline_ar,
  color = excluded.color, text = excluded.text, icon = excluded.icon,
  featured = excluded.featured;

insert into public.products
  (slug, name_fr, name_ar, category, price, old_price, badge, rating, reviews, stock, is_new, is_bestseller, desc_fr, desc_ar, image)
values
  ('lampe-champignon-led', 'Lampe champignon LED', 'مصباح فطر LED', 'maison-deco', 149, NULL, 'nouveau', 4.8, 36, 40, true, false, 'Une lumière douce et chaude, rechargeable en USB. Trois intensités pour la table de chevet ou le salon.', 'إضاءة ناعمة ودافئة، قابلة للشحن عبر USB. ثلاث درجات للطاولة أو لغرفة الجلوس.', '/img/products/lampe-champignon-led.jpg'),
  ('plaid-chenille-150x200', 'Plaid chenille 150×200', 'بطانية شينيل 150×200', 'maison-deco', 189, 249, 'promo', 4.9, 58, 30, false, true, '150×200 cm de chenille dense et douce, lavable en machine. Le plaid qu''on ne quitte plus dès les premiers froids.', 'بطانية شينيل كثيفة وناعمة 150×200 سم، قابلة للغسل. البطانية التي لا تفارقك مع أول برد.', '/img/products/plaid-chenille-150x200.jpg'),
  ('diffuseur-arome-bois', 'Diffuseur d''arôme en bois', 'موزّع عطر خشبي', 'maison-deco', 89, NULL, NULL, 4.6, 24, 50, false, false, 'Bâtonnets en rotin et base en bois clair. Parfum d''ambiance doux, tient plusieurs semaines.', 'عصي قصب وقاعدة خشبية فاتحة. عطر ناعم يدوم أسابيع.', '/img/products/diffuseur-arome-bois.jpg'),
  ('miroir-rond-maxi', 'Miroir rond maxi', 'مرآة دائرية كبيرة', 'maison-deco', 219, NULL, NULL, 4.7, 18, 20, false, false, '60 cm de diamètre, cadre métal fin. Se pose au mur ou se pose debout sur une console.', 'قطر 60 سم بإطار معدني رفيع. يُعلق على الحائط أو يوضع على طاولة.', '/img/products/miroir-rond-maxi.jpg'),
  ('cache-pot-terracotta', 'Cache-pot terracotta (lot de 3)', 'أصص تيراكوتا (طقم 3)', 'maison-deco', 79, NULL, NULL, 4.5, 15, 60, false, false, 'Trois tailles déclinées, terre cuite mate. Pour les plantes vertes du salon ou de la cuisine.', 'ثلاثة مقاسات من الطين المطفي. للنباتات الخضراء في غرفة الجلوس أو المطبخ.', '/img/products/cache-pot-terracotta.jpg'),
  ('panier-rangement-tresse', 'Panier de rangement tressé', 'سلة تخزين مضفّرة', 'maison-deco', 129, NULL, NULL, 4.6, 21, 35, false, false, 'Vannerie naturelle, anses solides, doublure intérieure. Pour le linge, les jouets ou les coussins.', 'خيزران طبيعي بمقابض متينة وبطانة داخلية. للملابس أو الوسائد أو الأغراض.', '/img/products/panier-rangement-tresse.jpg'),
  ('sac-tote-coton-epais', 'Sac tote coton épais', 'حقيبة قماش قطن سميك', 'mode-accessoires', 89, NULL, NULL, 4.7, 42, 60, false, true, 'Coton 300 g/m², coutures renforcées, poche intérieure. Tiens le marché, la plage et le bureau.', 'قطن 300 غرام، خياطة معززة، جيب داخلي. يناسب السوق والشاطئ والمكتب.', '/img/products/sac-tote-coton-epais.jpg'),
  ('casquette-brodee-classic', 'Casquette brodée classique', 'قبعة كلاسيكية مطرزة', 'mode-accessoires', 79, NULL, NULL, 4.5, 28, 70, false, false, 'Six panneaux, visière préformée, broderie ton sur ton. Taille réglable.', 'ستة ألواح وحاجب مسبق التشكيل وتطريز بنفس اللون. مقاس قابل للتعديل.', '/img/products/casquette-brodee-classic.jpg'),
  ('ceinture-cuir-simple', 'Ceinture cuir simple', 'حزام جلد بسيط', 'mode-accessoires', 119, NULL, NULL, 4.6, 19, 40, false, false, 'Cuir pleine fleur, boucle métal mat, largeur 3,5 cm. Le classique qui va avec tout.', 'جلد طبيعي وإبزيم معدني مطفي وعرض 3.5 سم. الكلاسيكي الذي يليق بكل شيء.', '/img/products/ceinture-cuir-simple.jpg'),
  ('lunettes-soleil-uv400', 'Lunettes de soleil UV400', 'نظارة شمسية UV400', 'mode-accessoires', 99, 139, 'promo', 4.4, 33, 55, false, false, 'Verres polarisés, protection UV400, étui rigide inclus. Trois coloris de monture.', 'عدسات مستقطبة وحماية UV400 وعلبة صلبة مرفقة. ثلاثة ألوان للإطار.', '/img/products/lunettes-soleil-uv400.jpg'),
  ('foulard-soie-matte', 'Foulard soie mat', 'وشاح حرير مطفي', 'mode-accessoires', 109, NULL, 'nouveau', 4.8, 12, 25, true, false, 'Carré 90×90 cm, soie mat sans brillance. Se porte au cou, aux cheveux ou à la poche.', 'مربع 90×90 سم من الحرير المطفي بدون لمعان. يُلبس حول العنق أو الشعر أو الجيب.', '/img/products/foulard-soie-matte.jpg'),
  ('huile-argan-nuit', 'Huile d''argan de nuit', 'زيت الأركان الليلي', 'beaute-soins', 129, NULL, NULL, 4.9, 61, 45, false, true, 'Argan pressé à froid, flacon ambré 50 ml. Quelques goutes le soir : peau nourrie au réveil.', 'أركان معصور على البارد بزجاجة عنبرية 50 مل. بضع قطرات مساءً: بشرة مغذية عند الاستيقاظ.', '/img/products/huile-argan-nuit.jpg'),
  ('parfum-musc-blanc-50ml', 'Parfum musc blanc 50 ml', 'عطر المسك الأبيض 50 مل', 'beaute-soins', 159, NULL, NULL, 4.7, 37, 30, false, false, 'Musc blanc, notes florales légères, sillage discret. Tient la journée sans écraser.', 'مسك أبيض بنفحات زهرية خفيفة وأثر هادئ. يدوم طوال اليوم دون ثقل.', '/img/products/parfum-musc-blanc-50ml.jpg'),
  ('brosse-visage-electrique', 'Brosse visage électrique', 'فرشاة وجه كهربائية', 'beaute-soins', 179, 229, 'promo', 4.5, 22, 25, false, false, 'Sonic doux, deux vitesses, chargeable USB. Brossettes de rechange incluses.', 'اهتزاز ناعم بسرعتين وشحن USB. رؤوس بديلة مرفقة.', '/img/products/brosse-visage-electrique.jpg'),
  ('coffret-soins-mains', 'Coffret soins des mains', 'طقم العناية بالأيدي', 'beaute-soins', 99, NULL, 'nouveau', 4.6, 17, 40, true, false, 'Crème main riche, huile ongles et gant doux. Le trio qui sauve les mains en hiver.', 'كريم يدين غني وزيت للأظافر وقفاز ناعم. الثلاثي الذي ينقذ الأيدي في الشتاء.', '/img/products/coffret-soins-mains.jpg'),
  ('masque-argile-verte', 'Masque à l''argile verte', 'ماسك الطين الأخضر', 'beaute-soins', 59, NULL, NULL, 4.4, 26, 80, false, false, 'Argile pure, pot 100 ml. À laisser 10 minutes, deux fois par semaine.', 'طين نقي عبوة 100 مل. يُترك 10 دقائق مرتين في الأسبوع.', '/img/products/masque-argile-verte.jpg'),
  ('ecouteurs-bt-anc', 'Écouteurs Bluetooth ANC', 'سماعات لاسلكية بعزل الضجيج', 'tech-accessoires', 299, 399, 'promo', 4.8, 74, 35, false, true, 'Réduction de bruit active, 30 h d''autonomie avec le boîtier, charge rapide USB-C.', 'عزل ضجيج نشط وبطارية 30 ساعة مع العلبة وشحن سريع USB-C.', '/img/products/ecouteurs-bt-anc.jpg'),
  ('powerbank-10000mah', 'Powerbank 10 000 mAh', 'بطارية متنقلة 10000 mAh', 'tech-accessoires', 199, NULL, NULL, 4.6, 41, 40, false, false, 'Deux sorties USB-C, affichage LED, recharge complète en 3 h. Tient dans une poche.', 'مخرجان USB-C وشاشة LED وشحن كامل في 3 ساعات. يدخل في الجيب.', '/img/products/powerbank-10000mah.jpg'),
  ('coque-silicone-universelle', 'Coque silicone universelle', 'غطاء سيليكون متعدد الاستخدام', 'tech-accessoires', 39, NULL, NULL, 4.3, 55, 120, false, false, 'Silicone souple anti-choc, bords surélevés. Se nettoie en un coup d''eau.', 'سيليكون مرن مقاوم للصدمات وحواف مرتفعة. يُنظف بسهولة.', '/img/products/coque-silicone-universelle.jpg'),
  ('support-portable-alu', 'Support portable en alu', 'حامل لابتوب من الألومنيوم', 'tech-accessoires', 129, NULL, 'nouveau', 4.7, 20, 30, true, false, 'Aluminium pliable, réglage en hauteur, ventilé. Pour éviter d''avoir le portable sur les genoux.', 'ألومنيوم قابل للطي وارتفاع قابل للتعديل وتهوية جيدة. للحمل على المنضدة بدل الركبة.', '/img/products/support-portable-alu.jpg'),
  ('carnet-couverture-lin-a5', 'Carnet A5 couverture lin', 'دفتر بغلاف كتّان A5', 'bureau-papeterie', 59, NULL, NULL, 4.6, 34, 90, false, false, '192 pages lignées, papier 100 g qui ne boit pas l''encre, couverture tissu lin.', '192 صفحة مسطرة وورق 100 غرام لا يمتص الحبر وغلاف من الكتان.', '/img/products/carnet-couverture-lin-a5.jpg'),
  ('stylo-plume-metal', 'Stylo plume métal', 'قلم حبر معدني', 'bureau-papeterie', 89, NULL, 'nouveau', 4.8, 16, 35, true, false, 'Corps métal brossé, plume medium, cartouche standard. Écrit sans appuyer.', 'جسم معدني مصقول ونبلة متوسطة وخرطوشة قياسية. يكتب بدون ضغط.', '/img/products/stylo-plume-metal.jpg'),
  ('agenda-2027-broche', 'Agenda 2027 broché', 'أجندة 2027 مجلدة', 'bureau-papeterie', 79, 99, 'promo', 4.5, 13, 50, false, false, 'Semaine par double page, notes en marge, marque-page ruban. Format A5.', 'أسبوع في صفحتين وهامش للملاحظات وفاصل شريطي. مقاس A5.', '/img/products/agenda-2027-broche.jpg'),
  ('set-rangement-bureau', 'Set de rangement bureau', 'طقم تنظيم المكتب', 'bureau-papeterie', 119, NULL, NULL, 4.6, 22, 45, false, false, 'Pot à stylos, plateau et boîte à épingles assortis. Finition bois clair.', 'كوب أقلام وصينية وعلبة دبابيس متناسقة. بلون خشب فاتح.', '/img/products/set-rangement-bureau.jpg')
on conflict (slug) do update set
  name_fr = excluded.name_fr, name_ar = excluded.name_ar,
  category = excluded.category, price = excluded.price,
  old_price = excluded.old_price, badge = excluded.badge,
  rating = excluded.rating, reviews = excluded.reviews,
  stock = excluded.stock, is_new = excluded.is_new,
  is_bestseller = excluded.is_bestseller,
  desc_fr = excluded.desc_fr, desc_ar = excluded.desc_ar,
  image = excluded.image;
