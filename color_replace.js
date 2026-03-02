const fs = require('fs');
const path = require('path');

const colorMap = {
    // Brand
    '00ff88': '00ff00',
    '#00ff88': '#00ff00',
    'rgba(0, 255, 136': 'rgba(0, 255, 0',
    'rgba(0,255,136': 'rgba(0,255,0',
    '#00FF88': '#00ff00',

    // Cyan -> Light Green
    '00d4ff': '88ff88',
    '#00d4ff': '#88ff88',
    'rgba(0, 212, 255': 'rgba(136, 255, 136',
    'rgba(0,212,255': 'rgba(136,255,136',
    '#00D4FF': '#88ff88',

    // Amber -> Another Green shade
    'ffaa00': 'cdffcd',
    '#ffaa00': '#cdffcd',
    'rgba(255, 170, 0': 'rgba(205, 255, 205',
    'rgba(255,170,0': 'rgba(205,255,205',
    '#FFAA00': '#cdffcd',

    // Red -> White (b/c we need high contrast) or bright green
    'ff3366': 'ffffff',
    '#ff3366': '#ffffff',
    'rgba(255, 51, 102': 'rgba(255, 255, 255',
    'rgba(255,51,102': 'rgba(255,255,255',
    '#FF3366': '#ffffff',

    // Purple -> White/Green
    'a259ff': 'ffffff',
    '#a259ff': '#ffffff',
    'rgba(162, 89, 255': 'rgba(255, 255, 255',
    'rgba(162,89,255': 'rgba(255,255,255',
    '#A259FF': '#ffffff',

    // Yellow
    '#ffd60a': '#ffffff',

    // Dark Backgrounds -> Black
    '#020509': '#000000',
    'rgba(2, 5, 9': 'rgba(0, 0, 0',
    'rgba(2,5,9': 'rgba(0,0,0',

    // Card backgrounds
    'rgba(10, 15, 26': 'rgba(0, 12, 0',
    'rgba(10,15,26': 'rgba(0,12,0',

    'rgba(10, 15, 20': 'rgba(0, 10, 0',
    'rgba(10,15,20': 'rgba(0,10,0',

    // Text
    '#e8edf5': '#ffffff',
    '#5a7399': '#008800',
    '#a0aab8': '#00aa00'
};

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            for (const [key, val] of Object.entries(colorMap)) {
                content = content.split(key).join(val);
            }

            fs.writeFileSync(fullPath, content, 'utf8');
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Colors replaced successfully!');
