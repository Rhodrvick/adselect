const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('[*] Compiling TypeScript source files...');
    try {
        execSync('npx tsc', { stdio: 'inherit' });
    } catch (err) {
        console.error('[-] TypeScript compilation failed:', err);
        process.exit(1);
    }
}

require('./dist/server.js');