const fs = require('fs');
const path = require('path');

const readFirstLines = (filePath, maxLines) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) return reject(new Error(`Файл не найден`));
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n').filter(line => line.trim());
            resolve(lines.slice(0, maxLines));
        } catch (err) {
            reject(err);
        }
    });
};

const watchFile = (filePath, ws, onNewData) => {
    let cursor = fs.statSync(filePath).size;
    
    const watcher = fs.watch(filePath, (event) => {
        if (event === 'change') {
            const stats = fs.statSync(filePath);
            if (stats.size > cursor) {
                const stream = fs.createReadStream(filePath, { start: cursor, end: stats.size });
                stream.on('data', (chunk) => {
                    const lines = chunk.toString().split('\n').filter(l => l.trim());
                    lines.forEach(line => onNewData(line));
                });
                stream.on('end', () => { cursor = stats.size; });
            } else {
                cursor = stats.size;
            }
        }
    });
    return watcher;
};

module.exports = { readFirstLines, watchFile };