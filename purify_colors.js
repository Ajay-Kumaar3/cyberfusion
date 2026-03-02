const fs = require('fs');
const path = require('path');

const filePaths = ['src/pages/Dashboard.jsx', 'src/components/AlertFeed.jsx'].map(p => path.resolve(__dirname, p));

const colorMap = {
    // Purple -> Green
    '#a259ff': '#00ff00',
    'rgba(162, 89, 255': 'rgba(0, 255, 0',

    // Red/Orange/Yellow -> White
    '#ff3366': '#ffffff',
    '#ffaa00': '#ffffff',
    '#ffdd00': '#ffffff',

    // Cyan -> Green
    '#00d4ff': '#00ff00',
    'rgba(0, 212, 255': 'rgba(0, 255, 0',

    // Other greens to pure green #00ff00
    '#00ff88': '#00ff00',
    '#cdffcd': '#ffffff',
    '#88ff88': '#ffffff'
};

for (const fullPath of filePaths) {
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        for (const [key, val] of Object.entries(colorMap)) {
            // Create a global case-insensitive regex for the key
            const regex = new RegExp(key.replace(/([()])/g, '\\$1'), 'gi');
            content = content.replace(regex, val);
        }

        // Also replace emojis
        content = content.replace(/🔴/g, '[x]');
        content = content.replace(/🟡/g, '[!]');
        content = content.replace(/✅/g, '[+]');
        content = content.replace(/⚡/g, '[+]');
        content = content.replace(/⚠/g, '[!]');

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Processed ${fullPath}`);
    }
}
console.log('Colors purified successfully!');
