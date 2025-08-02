# Book Donation Management Application

A comprehensive web application for managing book donations with a modern, responsive interface and complete backend API.

## Features

### Frontend
- **Modern responsive web interface** using HTML5, CSS3, and JavaScript
- **Dashboard** with donation statistics and recent activities
- **Book donation form** with comprehensive fields for book and donor information
- **Inventory management** with search and filter capabilities
- **Donor management system** with profiles and donation history
- **Mobile-responsive design** that works on all devices

### Backend
- **Node.js/Express.js server** with RESTful API
- **Complete CRUD operations** for books and donors
- **Data validation and error handling**
- **JSON file-based storage** (easily upgradeable to database)
- **Search and filtering endpoints**
- **Statistics and reporting API**

### Key Features
1. **Book Donation Tracking**: Complete workflow from donation receipt to distribution
2. **Donor Management**: Track donor information and donation history
3. **Inventory Management**: Categorize and track book inventory status
4. **Search & Filter**: Find books by title, author, genre, or condition
5. **Statistics Dashboard**: Visual representation of donation metrics
6. **Status Tracking**: Track books through stages (received, processed, available, distributed)

## Technology Stack

- **Frontend**: HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript
- **Backend**: Node.js with Express.js
- **Data Storage**: JSON files (structured for easy database migration)
- **Package Management**: npm
- **Icons**: Font Awesome 6
- **Styling**: CSS Grid, Flexbox, CSS Variables

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bookd_claude4
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── styles.css     # Main stylesheet
│   ├── js/
│   │   └── app.js         # Frontend JavaScript
│   └── images/            # Static images
├── server/                # Backend files
│   ├── app.js            # Main server file
│   ├── routes/           # API routes (future expansion)
│   └── data/             # JSON data storage
│       ├── books.json    # Books data
│       └── donors.json   # Donors data
├── package.json          # Project dependencies
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get specific book
- `POST /api/books` - Create new book donation
- `PUT /api/books/:id` - Update book information
- `DELETE /api/books/:id` - Delete book

### Donors
- `GET /api/donors` - Get all donors
- `GET /api/donors/:id` - Get specific donor
- `POST /api/donors` - Create new donor
- `PUT /api/donors/:id` - Update donor information

### Search & Statistics
- `GET /api/search/books` - Search books with filters
- `GET /api/statistics` - Get donation statistics

## Usage

### Adding a Book Donation
1. Navigate to the "Donate Book" section
2. Fill in book information (title, author, ISBN, genre, condition)
3. Enter donor information (name, email, phone)
4. Select pickup/delivery preferences
5. Submit the donation

### Managing Inventory
1. Go to the "Inventory" section
2. Use search bar to find specific books
3. Apply filters for genre, status, or condition
4. Edit or delete books using action buttons

### Viewing Statistics
1. Visit the "Dashboard" section
2. View total books, donors, and status breakdowns
3. See recent donation activities
4. Review books by status and genre charts

### Managing Donors
1. Navigate to the "Donors" section
2. View donor cards with contact information
3. See donation statistics for each donor

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (when implemented)

### Data Storage
The application uses JSON files for data storage:
- `server/data/books.json` - Stores all book donation records
- `server/data/donors.json` - Stores all donor information

### Adding New Features
1. **Backend**: Add new routes in `server/app.js` or create separate route files
2. **Frontend**: Extend the `BookDonationApp` class in `public/js/app.js`
3. **Styling**: Add new CSS rules in `public/css/styles.css`

## Book Status Workflow
- **Received**: Book donation has been submitted
- **Processed**: Book has been reviewed and cataloged
- **Available**: Book is ready for distribution
- **Distributed**: Book has been given to a recipient

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements
- Database integration (PostgreSQL, MongoDB)
- User authentication and roles
- Email notifications
- Barcode scanning
- Advanced reporting and analytics
- Integration with library management systems
- Mobile app development

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is licensed under the ISC License.

## Support
For support or questions, please open an issue in the repository.
