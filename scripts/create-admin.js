// Script to create the first admin user
// Usage: node scripts/create-admin.js [username] [email] [password]

const username = process.argv[2] || 'admin';
const email = process.argv[3] || 'admin@example.com';
const password = process.argv[4] || 'admin123';

console.log(`
To create an admin user, run:

npx wrangler d1 execute blog-db --command="
INSERT INTO users (username, email, password_hash, role) 
VALUES (
  '${username}', 
  '${email}', 
  'HASH_HERE', 
  'admin'
)"

Note: You need to hash the password first. 

For now, use the /api/auth/register endpoint (if you create one) or
manually hash the password using the auth system.

Recommended: Create a user through a secure setup process on first deployment.
`);

console.log('\nAlternatively, for local development:');
console.log(`
npx wrangler d1 execute blog-db --local --command="
INSERT INTO users (username, email, password_hash, role) 
VALUES (
  '${username}', 
  '${email}', 
  'temp_hash', 
  'admin'
)"
`);

console.log('\nThen update the password through the login system.');
