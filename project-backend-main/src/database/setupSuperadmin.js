/**
 * Setup first superadmin user
 * Run: SUPERADMIN_EMAIL=email@example.com node src/database/setupSuperadmin.js
 * Or: node src/database/setupSuperadmin.js email@example.com
 *
 * The user must exist (sign up first) or will be created with default password.
 * Only superadmin can promote users to admin via PUT /admin/users/:uid/role
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const db = require('./index');

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || process.argv[2];

async function setupSuperadmin() {
  if (!SUPERADMIN_EMAIL) {
    console.error('Usage: SUPERADMIN_EMAIL=email@example.com node src/database/setupSuperadmin.js');
    console.error('Or: node src/database/setupSuperadmin.js email@example.com');
    process.exit(1);
  }

  const email = SUPERADMIN_EMAIL.toLowerCase();

  const result = await db.query(
    `UPDATE users SET role = 'superadmin', updated_at = CURRENT_TIMESTAMP 
     WHERE email = $1 RETURNING uid, email, role`,
    [email]
  );

  if (result.rows.length > 0) {
    console.log('Superadmin set successfully:', result.rows[0]);
  } else {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(process.env.SUPERADMIN_PASSWORD || 'superadmin123', 12);
    const insertResult = await db.query(
      `INSERT INTO users (uid, email, name, college, phone, password, role)
       VALUES (gen_random_uuid(), $1, 'Superadmin', 'Campus', '0000000000', $2, 'superadmin')
       RETURNING uid, email, role`,
      [email, hashedPassword]
    );
    if (insertResult.rows.length > 0) {
      console.log('Superadmin user created:', insertResult.rows[0]);
      console.log('Default password: superadmin123 (set SUPERADMIN_PASSWORD to override)');
    } else {
      console.error('Failed to create superadmin');
    }
  }
  process.exit(0);
}

setupSuperadmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
