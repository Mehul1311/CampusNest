/**
 * Setup admin user (role: admin)
 * Run: ADMIN_EMAIL=email@example.com node src/database/setupAdmin.js
 * Or: node src/database/setupAdmin.js email@example.com [password]
 *
 * For superadmin, use: node src/database/setupSuperadmin.js email@example.com
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('./index');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.argv[2];
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.argv[3];

async function setupAdmin() {
  if (!ADMIN_EMAIL) {
    console.error('Usage: node setupAdmin.js <email> [password]');
    console.error('Or set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD || 'admin123', 12);

  const result = await db.query(
    `UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP 
     WHERE email = $1 RETURNING uid, email, role`,
    [ADMIN_EMAIL.toLowerCase()]
  );

  if (result.rows.length > 0) {
    console.log('Admin set successfully:', result.rows[0]);
  } else {
    const insertResult = await db.query(
      `INSERT INTO users (uid, email, name, college, phone, password, role)
       VALUES (gen_random_uuid(), $1, 'Admin', 'Campus', '0000000000', $2, 'admin')
       RETURNING uid, email, role`,
      [ADMIN_EMAIL.toLowerCase(), hashedPassword]
    );
    if (insertResult.rows.length > 0) {
      console.log('Admin user created:', insertResult.rows[0]);
    } else {
      console.error('Failed to create admin');
    }
  }
  process.exit(0);
}

setupAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
