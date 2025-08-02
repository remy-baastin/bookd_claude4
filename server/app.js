const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Data file paths
const BOOKS_FILE = path.join(__dirname, 'data/books.json');
const DONORS_FILE = path.join(__dirname, 'data/donors.json');

// Initialize data files if they don't exist
function initializeDataFiles() {
    if (!fs.existsSync(BOOKS_FILE)) {
        fs.writeFileSync(BOOKS_FILE, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(DONORS_FILE)) {
        fs.writeFileSync(DONORS_FILE, JSON.stringify([], null, 2));
    }
}

// Helper functions for data management
function readData(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data:', error);
        return [];
    }
}

function writeData(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data:', error);
        return false;
    }
}

// API Routes

// Get all books
app.get('/api/books', (req, res) => {
    const books = readData(BOOKS_FILE);
    res.json(books);
});

// Get book by ID
app.get('/api/books/:id', (req, res) => {
    const books = readData(BOOKS_FILE);
    const book = books.find(b => b.id === req.params.id);
    if (!book) {
        return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
});

// Create new book donation
app.post('/api/books', (req, res) => {
    const books = readData(BOOKS_FILE);
    const newBook = {
        id: Date.now().toString(),
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        genre: req.body.genre,
        condition: req.body.condition,
        status: 'received',
        donorId: req.body.donorId,
        donationDate: req.body.donationDate || new Date().toISOString(),
        createdAt: new Date().toISOString()
    };

    // Validate required fields
    if (!newBook.title || !newBook.author) {
        return res.status(400).json({ error: 'Title and author are required' });
    }

    books.push(newBook);
    if (writeData(BOOKS_FILE, books)) {
        res.status(201).json(newBook);
    } else {
        res.status(500).json({ error: 'Failed to save book' });
    }
});

// Update book
app.put('/api/books/:id', (req, res) => {
    const books = readData(BOOKS_FILE);
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    books[bookIndex] = { ...books[bookIndex], ...req.body, id: req.params.id };
    
    if (writeData(BOOKS_FILE, books)) {
        res.json(books[bookIndex]);
    } else {
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// Delete book
app.delete('/api/books/:id', (req, res) => {
    const books = readData(BOOKS_FILE);
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Book not found' });
    }

    books.splice(bookIndex, 1);
    
    if (writeData(BOOKS_FILE, books)) {
        res.json({ message: 'Book deleted successfully' });
    } else {
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

// Get all donors
app.get('/api/donors', (req, res) => {
    const donors = readData(DONORS_FILE);
    res.json(donors);
});

// Get donor by ID
app.get('/api/donors/:id', (req, res) => {
    const donors = readData(DONORS_FILE);
    const donor = donors.find(d => d.id === req.params.id);
    if (!donor) {
        return res.status(404).json({ error: 'Donor not found' });
    }
    res.json(donor);
});

// Create new donor
app.post('/api/donors', (req, res) => {
    const donors = readData(DONORS_FILE);
    const newDonor = {
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        preferences: req.body.preferences || {},
        createdAt: new Date().toISOString()
    };

    // Validate required fields
    if (!newDonor.name || !newDonor.email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    donors.push(newDonor);
    if (writeData(DONORS_FILE, donors)) {
        res.status(201).json(newDonor);
    } else {
        res.status(500).json({ error: 'Failed to save donor' });
    }
});

// Update donor
app.put('/api/donors/:id', (req, res) => {
    const donors = readData(DONORS_FILE);
    const donorIndex = donors.findIndex(d => d.id === req.params.id);
    
    if (donorIndex === -1) {
        return res.status(404).json({ error: 'Donor not found' });
    }

    donors[donorIndex] = { ...donors[donorIndex], ...req.body, id: req.params.id };
    
    if (writeData(DONORS_FILE, donors)) {
        res.json(donors[donorIndex]);
    } else {
        res.status(500).json({ error: 'Failed to update donor' });
    }
});

// Get statistics
app.get('/api/statistics', (req, res) => {
    const books = readData(BOOKS_FILE);
    const donors = readData(DONORS_FILE);
    
    const stats = {
        totalBooks: books.length,
        totalDonors: donors.length,
        booksByStatus: books.reduce((acc, book) => {
            acc[book.status] = (acc[book.status] || 0) + 1;
            return acc;
        }, {}),
        booksByGenre: books.reduce((acc, book) => {
            acc[book.genre] = (acc[book.genre] || 0) + 1;
            return acc;
        }, {}),
        recentDonations: books
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
    };
    
    res.json(stats);
});

// Search books
app.get('/api/search/books', (req, res) => {
    const books = readData(BOOKS_FILE);
    const { query, genre, status, condition } = req.query;
    
    let filteredBooks = books;
    
    if (query) {
        const searchTerm = query.toLowerCase();
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            (book.isbn && book.isbn.toLowerCase().includes(searchTerm))
        );
    }
    
    if (genre) {
        filteredBooks = filteredBooks.filter(book => book.genre === genre);
    }
    
    if (status) {
        filteredBooks = filteredBooks.filter(book => book.status === status);
    }
    
    if (condition) {
        filteredBooks = filteredBooks.filter(book => book.condition === condition);
    }
    
    res.json(filteredBooks);
});

// Serve main HTML file for any non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize data files and start server
initializeDataFiles();

app.listen(PORT, () => {
    console.log(`Book Donation Management Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
});

module.exports = app;