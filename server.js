import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const CONFIG_PATH = path.join(__dirname, 'database', 'config.json');

app.use(express.json());
app.use(express.static(__dirname));

// Load config
app.get('/api/config', (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load config' });
    }
});

// Save config
app.post('/api/config', (req, res) => {
    try {
        const config = req.body;
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        res.json({ success: true, message: 'Config saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save config', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
