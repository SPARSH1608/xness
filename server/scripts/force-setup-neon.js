const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function setupSchema() {
    console.log('--- Neon Schema Force-Setup ---');

    if (!process.env.DATABASE_URL) {
        console.error('❌ Error: DATABASE_URL is not defined in .env');
        process.exit(1);
    }

    // Check multiple possible paths/filenames
    const possibleFiles = [
        path.join(__dirname, 'neon-schema.sql'),
        path.join(__dirname, 'neon.schema.sql'),
        path.join(__dirname, 'scripts', 'neon-schema.sql'),
        path.join(__dirname, '..', 'scripts', 'neon-schema.sql')
    ];

    let sqlPath = null;
    for (const f of possibleFiles) {
        if (fs.existsSync(f)) {
            sqlPath = f;
            break;
        }
    }

    if (!sqlPath) {
        console.error('❌ Error: Could not find neon-schema.sql');
        console.log('Looking in:', possibleFiles);
        process.exit(1);
    }

    console.log('Using SQL file:', sqlPath);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
        await pool.query(sql);
        console.log('✅ Successfully created all candlestick views (trades_1min, etc.)');
    } catch (err) {
        console.error('❌ Error creating views:', err.message);
        if (err.message.includes('relation "trades" does not exist')) {
            console.log('💡 TIP: It looks like the "trades" table is missing. Run "npx prisma db push" first.');
        }
    } finally {
        await pool.end();
    }
}

setupSchema();
