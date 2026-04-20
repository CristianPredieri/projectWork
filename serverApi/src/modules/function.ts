export async function executeQuery (query: string, pool: import("mariadb").Pool) {
    const conn = await pool.getConnection()
    const rows = await conn.query(query)
    conn.release()
    return rows    
}