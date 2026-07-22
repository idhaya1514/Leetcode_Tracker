require('dotenv').config();
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT * FROM "Staff"').then(res => { console.log(res.rows); process.exit(0); }).catch(console.error);
