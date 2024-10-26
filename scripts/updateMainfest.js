const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
manifest.version = process.env.npm_package_version;
console.log('manifest.version', manifest.version);
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
