-- ============================================================
-- Sakina — catalog seed (categories + products) for the `sakina` schema
-- Run AFTER data/schema.sql. Idempotent (upserts on conflict).
-- Generated from data/catalog.json.
-- ============================================================

insert into public.categories (slug, name_fr, name_ar, tagline_fr, tagline_ar, color, text, icon, featured) values
  ('jouets-eveil', 'Jouets & éveil', 'ألعاب وتأهيل', 'Bois, puzzles, cubes et jeux d''éveil pour 0–6 ans.', 'ألعاب خشبية وألغاز وأنشطة تأهيلية من 0 إلى 6 سنوات.', '#FF6B9D', 'light', 'puzzle', true),
  ('livres-coloriage', 'Livres & coloriage', 'كتب وتلوين', 'Histoires, coloriages et premiers livres bilingues.', 'قصص وألوان وكتب أولى ثنائية اللغة.', '#A78BFA', 'light', 'book', false),
  ('ecole-papeterie', 'École & papeterie', 'مدرسة وقرطاسية', 'Sac, trousse et fournitures pour la rentrée.', 'حقائب وأقلام ومستلزمات للسنة الدراسية.', '#2EC4B6', 'light', 'backpack', false),
  ('coffrets-packs', 'Coffrets & packs', 'أطقم وحزم', 'Des prêts-à-offrir, emballés et prêts à partir.', 'أطقم جاهزة للإهداء، مغلفة وجاهزة.', '#FFD166', 'dark', 'gift', false),
  ('vetements-bebe', 'Vêtements bébé', 'ملابس الأطفال', 'Coton douce, tailles 0–3 ans, lavable en machine.', 'قطن ناعم، مقاسات 0–3 سنوات، قابل للغسل.', '#E8457F', 'light', 'tshirt', false)
on conflict (slug) do update set
  name_fr = excluded.name_fr, name_ar = excluded.name_ar,
  tagline_fr = excluded.tagline_fr, tagline_ar = excluded.tagline_ar,
  color = excluded.color, text = excluded.text, icon = excluded.icon,
  featured = excluded.featured;

insert into public.products
  (slug, name_fr, name_ar, category, price, old_price, badge, rating, reviews, stock, is_new, is_bestseller, desc_fr, desc_ar, image)
values
  ('puzzle-en-bois-36-pieces', 'Puzzle en bois 36 pièces', 'أحجية خشبية 36 قطعة', 'jouets-eveil', 129, 159, 'promo', 4.8, 41, 24, false, true, 'Puzzle en bois certifié pour les petites mains : couleurs vives, pièces épaisses et faciles à saisir.', 'أحجية خشبية معتمدة لأيدٍ صغيرة: ألوان زاهية وقطع سميكة وسهلة الإمساك.', '/img/products/puzzle-en-bois-36-pieces.svg'),
  ('cube-deveil-6-activites', 'Cube d''éveil 6 activités', 'مكعب تأهيلي 6 أنشطة', 'jouets-eveil', 89, NULL, NULL, 4.7, 33, 40, false, true, 'Six activités en un seul cube : rotatives, fils à perler et sons doux. Stimule la motricité fine.', 'ستة أنشطة في مكعب واحد: دوائر متحركة وخيوط وأصوات ناعمة، لتنمية المهارات الحركية.', '/img/products/cube-deveil-6-activites.svg'),
  ('peluche-ours-bebe', 'Peluche ours bébé', 'دمية دب ناعمة', 'jouets-eveil', 149, NULL, NULL, 5, 58, 30, false, true, 'Ours tout doux en peluche hypoallergénique, lavable à 30°. Le premier doudou de bébé.', 'دب ناعم من خامة غير مسببة للحساسية، يُغسل على 30 درجة. أول رفيق للطفل.', '/img/products/peluche-ours-bebe.svg'),
  ('tapis-deveil-musical', 'Tapis d''éveil musical', 'سجادة تأهيلية موسيقية', 'jouets-eveil', 249, 299, 'promo', 4.6, 27, 15, false, false, 'Tapis moelleux avec arches, miroir et 20 mélodies. Parfait dès les premiers mois.', 'سجادة ناعمة مع أقواس ومرآة و20 لحنًا. مثالية من الأشهر الأولى.', '/img/products/tapis-deveil-musical.svg'),
  ('blocs-construction-50-pieces', 'Blocs de construction 50 pièces', 'مكعبات بناء 50 قطعة', 'jouets-eveil', 179, NULL, 'nouveau', 4.5, 12, 22, true, false, '50 gros blocs de construction compatibles, livrés dans un sac de rangement.', '50 مكعب بناء كبير متوافق، مع كيس تخزين.', '/img/products/blocs-construction-50-pieces.svg'),
  ('cheval-a-bascule-bois', 'Cheval à bascule en bois', 'حصان متأرجح خشبي', 'jouets-eveil', 349, NULL, NULL, 4.9, 19, 8, false, false, 'Le classique indémodable, en bois massif, avec poignées et siège confortable.', 'الحصان الكلاسيكي الخالد من الخشب الصلب، بمقبضين ومقعد مريح.', '/img/products/cheval-a-bascule-bois.svg'),
  ('livre-activites-3-6-ans', 'Livre d''activités 3-6 ans', 'كتاب أنشطة 3-6 سنوات', 'livres-coloriage', 59, NULL, NULL, 4.7, 36, 50, false, true, 'Labyrinthes, calculs doux et coloriage : 96 pages d''activités pour apprendre en jouant.', 'متاهات وألوان وتمارين بسيطة: 96 صفحة من الأنشطة تعلّم أثناء اللعب.', '/img/products/livre-activites-3-6-ans.svg'),
  ('encyclopedie-enfants', 'Encyclopédie illustrée des enfants', 'الموسوعة المصورة للأطفال', 'livres-coloriage', 119, NULL, 'nouveau', 4.8, 14, 20, true, false, 'Animaux, planètes et corps humain expliqués simplement, avec 400 illustrations.', 'الحيوانات والكواكب والجسم البشري بشرح مبسّط مع 400 رسمة.', '/img/products/encyclopedie-enfants.svg'),
  ('cahier-coloriage-animaux', 'Cahier de coloriage animaux', 'كراسة تلوين الحيوانات', 'livres-coloriage', 35, NULL, NULL, 4.4, 52, 60, false, false, '40 pages d''animaux à colorier, papier épais qui n''absorbe pas les feutres.', '40 صفحة من الحيوانات المراد تلوينها، ورق سميك لا يمتص الحبر.', '/img/products/cahier-coloriage-animaux.svg'),
  ('histoires-du-soir-lot-3', 'Histoires du soir (lot de 3)', 'قصص قبل النوم (طقم 3)', 'livres-coloriage', 99, 120, 'promo', 4.9, 45, 25, false, true, 'Trois histoires courtes à lire avant de dormir, avec voix douce et fins heureuses.', 'ثلاث قصص قصيرة تُقرأ قبل النوم، بلغة ناعمة ونهايات سعيدة.', '/img/products/histoires-du-soir-lot-3.svg'),
  ('premier-apprentissage-ar-fr', 'Livre premier apprentissage AR/FR', 'كتاب التعلّم الأول عربي/فرنسي', 'livres-coloriage', 79, NULL, NULL, 4.6, 21, 30, false, false, 'Alphabet et premiers mots en français et en arabe, côte à côte, pour apprendre en deux langues.', 'الحروف والأولى كلمات بالفرنسية والعربية جنبًا إلى جنب، لتعلّم لغتين معًا.', '/img/products/premier-apprentissage-ar-fr.svg'),
  ('sac-a-dos-scolaire', 'Sac à dos scolaire', 'حقيبة ظهر مدرسية', 'ecole-papeterie', 149, NULL, NULL, 4.7, 63, 35, false, true, 'Sac léger à dos respirant, compartiment ordinateur et réfléchissants pour la sécurité.', 'حقيبة خفيفة بظهر مهوّى وجيوب منظمة وعاكسات للأمان.', '/img/products/sac-a-dos-scolaire.svg'),
  ('trousse-double-zip', 'Trousse double zip', 'قلم مزدوج السحاب', 'ecole-papeterie', 49, NULL, NULL, 4.5, 28, 45, false, false, 'Deux compartiments pour séparer crayons et gommes. Tissu imperméable.', 'جيوبان لفصل الأقلام عن الممحاة، من قماش مقاوم للماء.', '/img/products/trousse-double-zip.svg'),
  ('kit-couleur-24-crayons', 'Kit de couleur 24 crayons', 'طقم ألوان 24 قلمًا', 'ecole-papeterie', 39, NULL, NULL, 4.6, 31, 55, false, false, '24 crayons de couleur tendres, non toxiques, avec boîte rigide.', '24 قلم ألوان ناعم وغير سام، مع علبة صلبة.', '/img/products/kit-couleur-24-crayons.svg'),
  ('cahiers-grand-format-lot-5', 'Cahiers grand format (lot 5)', 'كراسات كبيرة (طقم 5)', 'ecole-papeterie', 45, NULL, NULL, 4.3, 18, 40, false, false, 'Cinq cahiers à lignes, couverture rigide, papier 80g qui ne traverse pas.', 'خمسة كراسات مسطرة، أغلفة صلبة، ورق 80غ لا ينسرخ.', '/img/products/cahiers-grand-format-lot-5.svg'),
  ('gommage-taille-crayon', 'Gomme + taille-crayon', 'ممحاة + مقلمة', 'ecole-papeterie', 15, NULL, 'epuise', 4.2, 9, 0, false, false, 'Le duo indispensable pour l''école. Gomme douce et taille-crayon sécurisé.', 'الثنائي الأساسي للمدرسة: ممحاة ناعمة ومقلمة آمنة.', '/img/products/gommage-taille-crayon.svg'),
  ('pack-naissance-bienvenue-bebe', 'Pack naissance « Bienvenue bébé »', 'حزمة الولادة «مرحبًا بك»', 'coffrets-packs', 399, 469, 'promo', 4.9, 22, 12, false, true, 'Body, lange, doudou et chaussettes réunis dans un coffret prêt à offrir.', 'ملابس ولحفة ودمية وجوارب في علبة جاهزة للإهداء.', '/img/products/pack-naissance-bienvenue-bebe.svg'),
  ('coffret-anniversaire-enfant', 'Coffret anniversaire enfant', 'علبة عيد ميلاد الطفل', 'coffrets-packs', 259, NULL, 'nouveau', 4.7, 8, 18, true, false, 'Chapeau, guirlande, bougies et bonbons : la fête en une seule boîte.', 'قبعة وورود معلقة وشموع وحلوى: الحفلة في علبة واحدة.', '/img/products/coffret-anniversaire-enfant.svg'),
  ('pack-rentree-scolaire', 'Pack rentrée scolaire complet', 'حزمة العودة إلى المدرسة', 'coffrets-packs', 299, 340, 'promo', 4.8, 37, 16, false, true, 'Sac à dos, trousse, crayons et cahiers : tout ce qu''il faut pour la rentrée.', 'حقيبة وقلم وألوان وكراسات: كل ما يلزم للعودة إلى المدرسة.', '/img/products/pack-rentree-scolaire.svg'),
  ('body-coton-bio-lot-3', 'Body coton bio (lot de 3)', 'ملابس قطنية عضوية (طقم 3)', 'vetements-bebe', 139, NULL, NULL, 4.8, 47, 32, false, true, 'Trois bodies en coton bio, encolure élargie, certifiés sans produits chimiques.', 'ثلاث ملابس من القطن العضوي، فتحة رأس واسعة، معتمدة خالية من المواد الكيميائية.', '/img/products/body-coton-bio-lot-3.svg'),
  ('pyjama-garcon-2-ans', 'Pyjama garçon 2 ans', 'بيجامام ولد سنتان', 'vetements-bebe', 89, NULL, 'nouveau', 4.6, 11, 20, true, false, 'Pyjama en molleton doux, taille élastique confortable pour la nuit.', 'بيجاما من القماش الناعم وحزام مطري مريح لليل.', '/img/products/pyjama-garcon-2-ans.svg'),
  ('robe-fille-fleurie', 'Robe fille fleurie', 'فستان فتاة مزهر', 'vetements-bebe', 119, NULL, NULL, 4.7, 24, 18, false, false, 'Robe légère à fleurs, doublure douce et fermeture dos facile.', 'فستان خفيف مزهر بطبقة داخلية ناعمة وإغلاق سهل من الخلف.', '/img/products/robe-fille-fleurie.svg'),
  ('chaussettes-bebe-lot-5', 'Chaussettes bébé (lot 5)', 'جوارب طفل (طقم 5)', 'vetements-bebe', 39, 49, 'promo', 4.5, 39, 50, false, false, 'Cinq paires de chaussettes anti-dérapantes, coton doux, tous les jours.', 'خمسة أزواج من الجوارب المانعة للانزلاق، قطن ناعم للاستعمال اليومي.', '/img/products/chaussettes-bebe-lot-5.svg'),
  ('casquette-enfant', 'Casquette enfant', 'قبعة طفل', 'vetements-bebe', 45, NULL, NULL, 4.4, 15, 26, false, false, 'Casquette réglable, tissu respirant, parfaite pour le soleil du jardin.', 'قبعة قابلة للضبط، قماش مهوّى، مثالية لشمس الحديقة.', '/img/products/casquette-enfant.svg')
on conflict (slug) do update set
  name_fr = excluded.name_fr, name_ar = excluded.name_ar,
  category = excluded.category, price = excluded.price,
  old_price = excluded.old_price, badge = excluded.badge,
  rating = excluded.rating, reviews = excluded.reviews,
  stock = excluded.stock, is_new = excluded.is_new,
  is_bestseller = excluded.is_bestseller,
  desc_fr = excluded.desc_fr, desc_ar = excluded.desc_ar,
  image = excluded.image;
