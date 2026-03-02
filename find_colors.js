const fs = require('fs');
const path = require('path');

const foundHex = new Set();
const foundRgba = new Set();

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.svg')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            const hexMatches = content.match(/#[a-fA-F0-9]{3,8}\b/g);
            if (hexMatches) {
                hexMatches.forEach(c => foundHex.add(c.toLowerCase()));
            }

            const rgbaMatches = content.match(/rgba?\([^)]+\)/g);
            if (rgbaMatches) {
                rgbaMatches.forEach(c => foundRgba.add(c.toLowerCase()));
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Hex:', Array.from(foundHex).join(', '));
console.log('Rgba:', Array.from(foundRgba).join(' | '));
