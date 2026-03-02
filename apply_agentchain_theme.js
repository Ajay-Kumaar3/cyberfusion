const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
    { find: /#00ff00/gi, replace: '#00FF41' },
    { find: /#00ff88/gi, replace: '#00CC33' },
    { find: /#008800/gi, replace: '#7A8E7A' }, // Text labels
    { find: /#88ff88/gi, replace: '#00FF41' },
    { find: /#ccff00/gi, replace: '#A8EF00' },
    { find: /rgba\(0,255,0/g, replace: 'rgba(0,255,65' },
    { find: /rgba\(0, 255, 0/g, replace: 'rgba(0, 255, 65' },
    { find: /rgba\(0,255,136/g, replace: 'rgba(0,204,51' },
    { find: /rgba\(0, 255, 136/g, replace: 'rgba(0, 204, 51' },
    { find: /1px solid rgba\(255,255,255,0\.1\)/g, replace: '1px solid rgba(0, 255, 65, 0.15)' }, // Replace some white borders to green ones
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (filePath.match(/\.(js|jsx|css)$/)) {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;

            for (const { find, replace } of replacements) {
                if (content.match(find)) {
                    content = content.replace(find, replace);
                    updated = true;
                }
            }

            if (updated) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    }
}

processDirectory(srcDir);
console.log('AgentChain theme successfully applied.');
