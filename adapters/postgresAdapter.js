// ========== adapters/postgresAdapter.js ==========
// Nota: usamos '@neondatabase/serverless' (no 'pg') porque en un entorno
// serverless no podemos mantener conexiones TCP persistentes; Neon habla
// por HTTP, que es exactamente lo que necesitan las funciones efímeras.

const { neon } = require('@neondatabase/serverless');

function createPostgresAdapter() {
  const sql = neon(process.env.DATABASE_URL);

  return {
    async findTasksByUserId(userId) {
      const rows = await sql`
        SELECT id, user_id AS "userId", title, status, created_at AS "createdAt"
        FROM tasks
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
      return rows;
    },

    async createTask(userId, title) {
      const rows = await sql`
        INSERT INTO tasks (user_id, title, status)
        VALUES (${userId}, ${title}, 'pending')
        RETURNING id, user_id AS "userId", title, status
      `;
      return rows[0];
    },

    async updateTaskStatus(id, status) {
      const rows = await sql`
        UPDATE tasks SET status = ${status} WHERE id = ${id}
        RETURNING id
      `;
      return rows.length > 0;
    },
  };
}

module.exports = { createPostgresAdapter };