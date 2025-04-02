import mysql from "mysql2/promise"

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  port: parseInt(process.env.DB_PORT || '3308'),
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "german_game",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Helper function to execute queries
export const db = {
  query: async (sql: string, params?: any[]) => {
    try {
      const [rows] = await pool.execute(sql, params)
      return rows
    } catch (error) {
      console.error("Database error:", error)
      throw error
    }
  },
}

