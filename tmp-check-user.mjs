import prisma from './server/prisma.js';

const rows = await prisma.$queryRawUnsafe(
  'SELECT id, institutionId, full_name, email, password_hash, role, isSuspended, isLocked, mustChangePassword, created_at, updated_at, email_verified, failed_login_attempts, locked_until, last_login_at, refresh_token_version FROM User WHERE email = ? LIMIT 1',
  'superadmin@greenfield.edu'
);

console.log(JSON.stringify(rows, null, 2));

await prisma.$disconnect();
