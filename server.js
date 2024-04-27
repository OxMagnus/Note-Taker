const fs = require('fs');
const path = require('path');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const dbFilePath = path.join(__dirname, 'db', 'db.json');

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Read data from db.json
function readDataFromFile() {
    try {
        const data = fs.readFileSync(dbFilePath);
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data from file:', error);
        return [];
    }
}

// Write data to db.json
function writeDataToFile(data) {
    try {
        fs.writeFileSync(dbFilePath, JSON.stringify(data));
    } catch (error) {
        console.error('Error writing data to file:', error);
    }
}

// API Routes

// GET /api/notes - Return all saved notes as JSON
app.get('/api/notes', (req, res) => {
    try {
        const dbData = readDataFromFile();
        res.json(dbData);
    } catch (error) {
        console.error('Error getting notes:', error);
        res.status(500).send('Internal Server Error');
    }
});

// POST /api/notes - Add a new note and return it
app.post('/api/notes', (req, res) => {
    try {
        const newNote = req.body;
        newNote.id = uuidv4();

        const db = readDataFromFile();
        db.push(newNote);

        writeDataToFile(db);
        res.json(newNote);
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).send('Internal Server Error');
    }
});

// DELETE /api/notes/:id - Remove a note by ID
app.delete('/api/notes/:id', (req, res) => {
    try {
        const id = req.params.id;
        const db = readDataFromFile();
        const newDb = db.filter((note) => note.id !== id);
        
        writeDataToFile(newDb);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).send('Internal Server Error');
    }
});

// HTML Routes

// Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Notes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// Wildcard Route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});
