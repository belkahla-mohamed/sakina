-- Move the Sakina tables out of the isolated `sakina` schema into `public`.
--
-- Why: the Supabase dashboard (Table Editor, Database → Tables) only lists
-- `public` by default, so living in a side schema made the data invisible in
-- the UI. `public` is empty in this project, so nothing collides.
--
-- `ALTER ... SET SCHEMA` carries the table's indexes, constraints, RLS state
-- and grants along with it — data is untouched.
--
-- STATUS: already applied on 2026-10-10. Kept for reference / re-creation.
-- Do NOT re-run: `sakina` no longer exists.

begin;

alter table sakina.admin_sessions set schema public;
alter table sakina.admin_users    set schema public;
alter table sakina.categories     set schema public;
alter table sakina.order_items    set schema public;
alter table sakina.orders         set schema public;
alter table sakina.products       set schema public;
alter table sakina.reviews        set schema public;
alter table sakina.settings       set schema public;

commit;

-- The schema is now empty; drop it so nothing points at a dead namespace.
drop schema if exists sakina cascade;
