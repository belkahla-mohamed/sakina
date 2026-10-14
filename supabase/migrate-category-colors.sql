-- Restyle category cards to the calm warm palette.
--
-- Why: the storefront redesign dropped the saturated candy colors
-- (pink / teal / purple / yellow) for a single sand surface (#f4f0e6)
-- with dark ink text, plus one brick feature card for the most-visited
-- category. Without this, the live DB keeps the old bright colors and
-- the sand + white-text combination renders unreadable.
--
-- Safe to re-run: plain upserts keyed on slug.

update public.categories set color = '#f4f0e6', text = 'dark' where slug = 'jouets-eveil';
update public.categories set color = '#f4f0e6', text = 'dark' where slug = 'livres-coloriage';
update public.categories set color = '#f4f0e6', text = 'dark' where slug = 'ecole-papeterie';
update public.categories set color = '#f4f0e6', text = 'dark' where slug = 'coffrets-packs';
update public.categories set color = '#f4f0e6', text = 'dark' where slug = 'vetements-bebe';
