/* =====================================================================
   PERF LAB — CONFIGURATION
   ---------------------------------------------------------------------
   Laisse vide  -> MODE LOCAL : tout marche, données stockées sur l'appareil.
   Remplis      -> MODE CLOUD : compte + sync entre tous tes appareils.

   Où trouver ces valeurs : dashboard Supabase de ton projet →
   Project Settings → API → "Project URL" et "anon public" key.
   (La clé "anon" est publique et sûre à mettre ici : la sécurité vient
    des règles RLS définies dans schema.sql.)
   ===================================================================== */
window.CONFIG = {
  SUPABASE_URL: "",      // ex: "https://xxxxxxxx.supabase.co"
  SUPABASE_ANON_KEY: "", // ex: "eyJhbGciOi..."

  // Programmation (module « Ta semaine ») : Supabase pour ce module seulement.
  // Les bibliothèques et le sélecteur Moss / Souad restent en mode LOCAL.
  CYCLE_SUPABASE_URL: "https://jrffuxbzuzcejgmslfvz.supabase.co",
  CYCLE_SUPABASE_ANON_KEY: "sb_publishable_lSYUp9lEvPZGxDP3vY9hbQ_ZH4lsxWR" // clé « publishable » (remplace la clé anon)
};
