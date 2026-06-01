/**
 * Em redes com proxy/antivírus (Windows), o Node pode falhar ao validar o certificado do Supabase.
 * Defina SUPABASE_INSECURE_SSL=1 no .env.local APENAS para desenvolvimento local.
 * Nunca ative em produção.
 */
if (process.env.NODE_ENV === "development" && process.env.SUPABASE_INSECURE_SSL === "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
