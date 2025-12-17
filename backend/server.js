const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes');
const { verifyClient } = require('./src/auth');
const { readFirstLines, watchFile } = require('./src/logger');

const app = express();
const PORT = process.env.PORT || 3001;
const LOG_PATH = process.env.LOG_PATH || './access.log';
const PRODUCTION = process.env.PRODUCTION === 'true';
const ORIGIN = process.env.ORIGIN || 'http://localhost:3000';

app.use(cors())

app.use(express.json());
app.use('/api', authRoutes);

const server = http.createServer(app);

const wss = new WebSocket.Server({ 
    server,
    verifyClient: verifyClient 
});

wss.on('connection', async (ws, req) => {
    const user = req.user;
    if(!PRODUCTION){
        console.log(`✅ Соединение защищено для: ${user.email}`);
    }
    
    try {
        const history = await readFirstLines(LOG_PATH, 1000);
        history.forEach(line => ws.send(JSON.stringify({ type: 'history', raw: line })));

        const watcher = watchFile(LOG_PATH, ws, (line) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'live', raw: line }));
            }
        });

        ws.on('close', () => watcher.close());
    } catch (err) {
        ws.close();
    }
});

server.listen(PORT, () => {
    if(!PRODUCTION){
        console.log(`🚀 Сервер запущен:`);
        console.log(`   - HTTP API: http://localhost:${PORT}/api`);
        console.log(`   - WebSocket: ws://localhost:${PORT}`);
    }
});