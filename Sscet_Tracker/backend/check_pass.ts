import bcrypt from 'bcrypt';

async function testPassword() {
  const hash = '$2b$10$MwQ/q4.fqZStzE6Nb/IfzOdwdlKdatzKvwGOyhF9wh46kjcjXjvpe';
  const match = await bcrypt.compare('Test@123', hash);
  console.log('Password match:', match);
}

testPassword().catch(console.error);
