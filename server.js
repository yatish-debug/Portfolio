const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Path to data files
const DATA_DIR = path.join(__dirname, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Helper to read JSON safely
const readJson = (filename) => {
    try {
        const filePath = path.join(DATA_DIR, filename);
        if (!fs.existsSync(filePath)) return [];
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${filename}:`, err);
        return [];
    }
};

// Helper to write JSON
const writeJson = (filename, data) => {
    try {
        const filePath = path.join(DATA_DIR, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`Error writing ${filename}:`, err);
        return false;
    }
};

// API: Get All Public Data
app.get('/api/data', (req, res) => {
    const experience = readJson('experience.json');
    const education = readJson('education.json');
    const certifications = readJson('certifications.json');
    const projects = readJson('projects.json');
    const skills = readJson('skills.json');
    
    res.json({
        experience,
        education,
        certifications,
        projects,
        skills
    });
});

// API: Visitor Analytics
app.post('/api/analytics/visit', (req, res) => {
    const analytics = readJson('analytics.json');
    if (!analytics.totalVisitors) analytics.totalVisitors = 0;
    analytics.totalVisitors += 1;
    writeJson('analytics.json', analytics);
    res.json({ success: true, totalVisitors: analytics.totalVisitors });
});

app.get('/api/analytics', (req, res) => {
    res.json(readJson('analytics.json'));
});

// API: Submit Contact Form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const messages = readJson('messages.json');
    const newMessage = {
        id: Date.now().toString(),
        name,
        email,
        message,
        date: new Date().toISOString(),
        status: 'pending' // pending, approved, denied
    };

    messages.push(newMessage);
    writeJson('messages.json', messages);

    res.status(200).json({ success: true, message: 'Message sent successfully!' });
});

// Admin API Routes

// Get all messages
app.get('/api/admin/messages', (req, res) => {
    res.json(readJson('messages.json'));
});

// Update message status
app.post('/api/admin/messages/status', (req, res) => {
    const { id, status } = req.body;
    let messages = readJson('messages.json');
    const msgIndex = messages.findIndex(m => m.id === id);
    if (msgIndex !== -1) {
        messages[msgIndex].status = status;
        writeJson('messages.json', messages);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Message not found' });
    }
});

// Generic Add Item
app.post('/api/admin/:section/add', (req, res) => {
    const section = req.params.section;
    const validSections = ['experience', 'education', 'certifications', 'projects', 'skills'];
    if (!validSections.includes(section)) return res.status(400).json({ error: 'Invalid section' });

    let data = readJson(`${section}.json`);
    const newItem = { id: Date.now().toString(), ...req.body };
    data.push(newItem);
    writeJson(`${section}.json`, data);
    res.json({ success: true, item: newItem });
});

// Generic Delete Item
app.post('/api/admin/:section/delete', (req, res) => {
    const section = req.params.section;
    const { id } = req.body;
    const validSections = ['experience', 'education', 'certifications', 'projects', 'skills'];
    if (!validSections.includes(section)) return res.status(400).json({ error: 'Invalid section' });

    let data = readJson(`${section}.json`);
    data = data.filter(item => item.id !== id);
    writeJson(`${section}.json`, data);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Portfolio Server running at http://localhost:${PORT}`);
});
