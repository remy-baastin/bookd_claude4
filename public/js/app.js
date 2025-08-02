// Book Donation Management Application
class BookDonationApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.books = [];
        this.donors = [];
        this.statistics = {};
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupNavigation();
        await this.loadData();
        this.renderDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('.nav-link').dataset.section;
                this.navigateToSection(section);
            });
        });

        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        hamburger?.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Donation form
        const donationForm = document.getElementById('donation-form');
        donationForm?.addEventListener('submit', (e) => this.handleDonationSubmit(e));

        // Cancel donation
        const cancelDonation = document.getElementById('cancel-donation');
        cancelDonation?.addEventListener('click', () => this.resetDonationForm());

        // Search and filters
        const searchInput = document.getElementById('search-input');
        searchInput?.addEventListener('input', () => this.filterBooks());

        const filters = ['genre-filter', 'status-filter', 'condition-filter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            filter?.addEventListener('change', () => this.filterBooks());
        });

        // Edit book modal
        const editBookModal = document.getElementById('edit-book-modal');
        const closeEditBook = document.getElementById('close-edit-book');
        const cancelEditBook = document.getElementById('cancel-edit-book');
        const editBookForm = document.getElementById('edit-book-form');

        closeEditBook?.addEventListener('click', () => this.closeEditBookModal());
        cancelEditBook?.addEventListener('click', () => this.closeEditBookModal());
        editBookForm?.addEventListener('submit', (e) => this.handleEditBookSubmit(e));

        // Close modal when clicking outside
        editBookModal?.addEventListener('click', (e) => {
            if (e.target === editBookModal) {
                this.closeEditBookModal();
            }
        });

        // Set default donation date to today
        const donationDateInput = document.getElementById('donation-date');
        if (donationDateInput) {
            donationDateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    setupNavigation() {
        // Close mobile menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const hamburger = document.querySelector('.hamburger');
                const navMenu = document.querySelector('.nav-menu');
                hamburger?.classList.remove('active');
                navMenu?.classList.remove('active');
            });
        });
    }

    navigateToSection(section) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');

        // Show/hide sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section)?.classList.add('active');

        this.currentSection = section;

        // Load section-specific data
        switch (section) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'inventory':
                this.renderInventory();
                break;
            case 'donors':
                this.renderDonors();
                break;
        }
    }

    async loadData() {
        try {
            // Load books
            const booksResponse = await fetch('/api/books');
            this.books = await booksResponse.json();

            // Load donors
            const donorsResponse = await fetch('/api/donors');
            this.donors = await donorsResponse.json();

            // Load statistics
            const statsResponse = await fetch('/api/statistics');
            this.statistics = await statsResponse.json();

        } catch (error) {
            console.error('Error loading data:', error);
            this.showMessage('Error loading data', 'error');
        }
    }

    async renderDashboard() {
        // Update statistics
        document.getElementById('total-books').textContent = this.statistics.totalBooks || 0;
        document.getElementById('total-donors').textContent = this.statistics.totalDonors || 0;
        document.getElementById('available-books').textContent = this.statistics.booksByStatus?.available || 0;
        document.getElementById('distributed-books').textContent = this.statistics.booksByStatus?.distributed || 0;

        // Render recent activities
        this.renderRecentActivities();

        // Render charts
        this.renderCharts();
    }

    renderRecentActivities() {
        const container = document.getElementById('recent-activities');
        if (!container) return;

        if (!this.statistics.recentDonations || this.statistics.recentDonations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No Recent Donations</h3>
                    <p>Recent donation activities will appear here.</p>
                </div>
            `;
            return;
        }

        const activitiesHTML = this.statistics.recentDonations.map(book => {
            const donationDate = new Date(book.createdAt).toLocaleDateString();
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <div class="activity-content">
                        <h4>${book.title} by ${book.author}</h4>
                        <p>Donated on ${donationDate} • Status: ${book.status}</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = activitiesHTML;
    }

    renderCharts() {
        // Simple text-based charts for now
        const statusChart = document.getElementById('status-chart');
        const genreChart = document.getElementById('genre-chart');

        if (statusChart && this.statistics.booksByStatus) {
            const statusData = Object.entries(this.statistics.booksByStatus)
                .map(([status, count]) => `${status}: ${count}`)
                .join('<br>');
            statusChart.innerHTML = statusData || 'No data available';
        }

        if (genreChart && this.statistics.booksByGenre) {
            const genreData = Object.entries(this.statistics.booksByGenre)
                .map(([genre, count]) => `${genre}: ${count}`)
                .join('<br>');
            genreChart.innerHTML = genreData || 'No data available';
        }
    }

    async handleDonationSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const donorData = {
            name: formData.get('donorName'),
            email: formData.get('donorEmail'),
            phone: formData.get('donorPhone'),
            preferences: {
                pickup: formData.get('pickupPreference'),
                instructions: formData.get('specialInstructions')
            }
        };

        const bookData = {
            title: formData.get('title'),
            author: formData.get('author'),
            isbn: formData.get('isbn'),
            genre: formData.get('genre'),
            condition: formData.get('condition'),
            donationDate: formData.get('donationDate')
        };

        try {
            // First, create or find donor
            let donor = this.donors.find(d => d.email === donorData.email);
            if (!donor) {
                const donorResponse = await fetch('/api/donors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(donorData)
                });
                donor = await donorResponse.json();
            }

            // Then create book donation
            bookData.donorId = donor.id;
            const bookResponse = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });

            if (bookResponse.ok) {
                this.showMessage('Book donation submitted successfully!', 'success');
                this.resetDonationForm();
                await this.loadData();
                this.renderDashboard();
            } else {
                throw new Error('Failed to submit donation');
            }
        } catch (error) {
            console.error('Error submitting donation:', error);
            this.showMessage('Error submitting donation. Please try again.', 'error');
        }
    }

    resetDonationForm() {
        const form = document.getElementById('donation-form');
        form?.reset();
        
        // Reset date to today
        const donationDateInput = document.getElementById('donation-date');
        if (donationDateInput) {
            donationDateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    async renderInventory() {
        await this.loadData(); // Refresh data
        this.filterBooks();
    }

    async filterBooks() {
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
        const genreFilter = document.getElementById('genre-filter')?.value || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';
        const conditionFilter = document.getElementById('condition-filter')?.value || '';

        let filteredBooks = this.books;

        // Apply filters
        if (searchTerm) {
            filteredBooks = filteredBooks.filter(book =>
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                (book.isbn && book.isbn.toLowerCase().includes(searchTerm))
            );
        }

        if (genreFilter) {
            filteredBooks = filteredBooks.filter(book => book.genre === genreFilter);
        }

        if (statusFilter) {
            filteredBooks = filteredBooks.filter(book => book.status === statusFilter);
        }

        if (conditionFilter) {
            filteredBooks = filteredBooks.filter(book => book.condition === conditionFilter);
        }

        this.renderBooksTable(filteredBooks);
    }

    renderBooksTable(books) {
        const tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;

        if (books.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fas fa-search"></i>
                            <h3>No Books Found</h3>
                            <p>Try adjusting your search criteria or add new books.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        const booksHTML = books.map(book => {
            const donationDate = new Date(book.donationDate || book.createdAt).toLocaleDateString();
            return `
                <tr>
                    <td><strong>${book.title}</strong></td>
                    <td>${book.author}</td>
                    <td>${book.genre || 'N/A'}</td>
                    <td>${book.condition || 'N/A'}</td>
                    <td><span class="status-badge status-${book.status}">${book.status}</span></td>
                    <td>${donationDate}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="app.editBook('${book.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="app.deleteBook('${book.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = booksHTML;
    }

    async editBook(bookId) {
        const book = this.books.find(b => b.id === bookId);
        if (!book) return;

        // Populate edit form
        document.getElementById('edit-book-id').value = book.id;
        document.getElementById('edit-book-title').value = book.title;
        document.getElementById('edit-book-author').value = book.author;
        document.getElementById('edit-book-genre').value = book.genre || '';
        document.getElementById('edit-book-condition').value = book.condition || '';
        document.getElementById('edit-book-status').value = book.status;

        // Show modal
        document.getElementById('edit-book-modal').style.display = 'block';
    }

    closeEditBookModal() {
        document.getElementById('edit-book-modal').style.display = 'none';
    }

    async handleEditBookSubmit(e) {
        e.preventDefault();
        
        const bookId = document.getElementById('edit-book-id').value;
        const updatedBook = {
            title: document.getElementById('edit-book-title').value,
            author: document.getElementById('edit-book-author').value,
            genre: document.getElementById('edit-book-genre').value,
            condition: document.getElementById('edit-book-condition').value,
            status: document.getElementById('edit-book-status').value
        };

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBook)
            });

            if (response.ok) {
                this.showMessage('Book updated successfully!', 'success');
                this.closeEditBookModal();
                await this.loadData();
                this.filterBooks();
                this.renderDashboard();
            } else {
                throw new Error('Failed to update book');
            }
        } catch (error) {
            console.error('Error updating book:', error);
            this.showMessage('Error updating book. Please try again.', 'error');
        }
    }

    async deleteBook(bookId) {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('Book deleted successfully!', 'success');
                await this.loadData();
                this.filterBooks();
                this.renderDashboard();
            } else {
                throw new Error('Failed to delete book');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            this.showMessage('Error deleting book. Please try again.', 'error');
        }
    }

    async renderDonors() {
        await this.loadData(); // Refresh data
        
        const container = document.getElementById('donors-grid');
        if (!container) return;

        if (this.donors.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Donors Yet</h3>
                    <p>Donor information will appear here after book donations are submitted.</p>
                </div>
            `;
            return;
        }

        const donorsHTML = this.donors.map(donor => {
            const donorBooks = this.books.filter(book => book.donorId === donor.id);
            const joinDate = new Date(donor.createdAt).toLocaleDateString();
            const initials = donor.name.split(' ').map(n => n[0]).join('').toUpperCase();

            return `
                <div class="donor-card">
                    <div class="donor-header">
                        <div class="donor-avatar">${initials}</div>
                        <div class="donor-info">
                            <h3>${donor.name}</h3>
                            <p>${donor.email}</p>
                            ${donor.phone ? `<p>${donor.phone}</p>` : ''}
                        </div>
                    </div>
                    <div class="donor-stats">
                        <div class="donor-stat">
                            <h4>${donorBooks.length}</h4>
                            <p>Books Donated</p>
                        </div>
                        <div class="donor-stat">
                            <h4>${joinDate}</h4>
                            <p>Member Since</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = donorsHTML;
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        if (!container) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;

        container.appendChild(messageEl);

        // Trigger animation
        setTimeout(() => messageEl.classList.add('show'), 100);

        // Remove message after 5 seconds
        setTimeout(() => {
            messageEl.classList.remove('show');
            setTimeout(() => messageEl.remove(), 300);
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BookDonationApp();
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookDonationApp;
}