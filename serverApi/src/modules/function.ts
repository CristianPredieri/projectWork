// Funzione helper per eseguire query al database
// Ottiene una connessione dal pool, esegue la query e rilascia la connessione
export async function executeQuery(
  query: string,
  params: any[] = [],
  pool: import("mariadb").Pool
) {
  const conn = await pool.getConnection()
  const rows = await conn.query(query, params)
  conn.release()
  return rows
}