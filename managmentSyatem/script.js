// Library Management System - Complete JavaScript Functionality

// Data storage using localStorage
class LibraryData {
    constructor() {
        this.books = JSON.parse(localStorage.getItem('books')) || [];
        this.members = JSON.parse(localStorage.getItem('members')) || [];
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    }

    saveData() {
        localStorage.setItem('books', JSON.stringify(this.books));
        localStorage.setItem('members', JSON.stringify(this.members));
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    // Book operations
    addBook(book) {
        book.id = Date.now();
        book.availableCopies = book.totalCopies;
        this.books.push(book);
        this.saveData();
    }

    updateBook(id, updatedBook) {
        const index = this.books.findIndex(book => book.id === id);
        if (index !== -1) {
            const currentBook = this.books[index];
            const difference = updatedBook.totalCopies - currentBook.totalCopies;
            updatedBook.availableCopies = currentBook.availableCopies + difference;
            
            this.books[index] = { ...currentBook, ...updatedBook };
            this.saveData();
        }
    }

    deleteBook(id) {
        const hasActiveTransactions = this.transactions.some(
            t => t.bookId === id && t.status === 'borrowed'
        );
        
        if (hasActiveTransactions) {
            alert('Cannot delete book with active borrowings!');
            return false;
        }
        
        this.books = this.books.filter(book => book.id !== id);
        this.saveData();
        return true;
    }

    getBookById(id) {
        return this.books.find(book => book.id === id);
    }

    // Member operations
    addMember(member) {
        member.id = Date.now();
        member.booksBorrowed = 0;
        this.members.push(member);
        this.saveData();
    }

    updateMember(id, updatedMember) {
        const index = this.members.findIndex(member => member.id === id);
        if (index !== -1) {
            this.members[index] = { ...this.members[index], ...updatedMember };
            this.saveData();
        }
    }

    deleteMember(id) {
        const hasActiveTransactions = this.transactions.some(
            t => t.memberId === id && t.status === 'borrowed'
        );
        
        if (hasActiveTransactions) {
            alert('Cannot delete member with active borrowings!');
            return false;
        }
        
        this.members = this.members.filter(member => member.id !== id);
        this.saveData();
        return true;
    }

    getMemberById(id) {
        return this.members.find(member => member.id === id);
    }

    // Transaction operations
    borrowBook(transaction) {
        const book = this.getBookById(transaction.bookId);
        const member = this.getMemberById(transaction.memberId);
        
        if (!book || !member) return false;
        
        if (book.availableCopies <= 0) {
            alert('No copies available for borrowing!');
            return false;
        }
        
        if (member.booksBorrowed >= 3) {
            alert('Member has reached maximum borrowing limit (3 books)!');
            return false;
        }

        transaction.id = Date.now();
        transaction.borrowDate = new Date().toISOString().split('T')[0];
        transaction.status = 'borrowed';
        
        book.availableCopies--;
        member.booksBorrowed++;
        
        this.transactions.push(transaction);
        this.saveData();
        return true;
    }

    returnBook(transactionId) {
        const transaction = this.transactions.find(t => t.id === transactionId);
        if (!transaction || transaction.status !== 'borrowed') return false;
        
        transaction.status = 'returned';
        transaction.returnDate = new Date().toISOString().split('T')[0];

        const book = this.getBookById(transaction.bookId);
        if (book) {
            book.availableCopies++;
        }

        const member = this.getMemberById(transaction.memberId);
        if (member) {
            member.booksBorrowed--;
        }

        this.saveData();
        return true;
    }

    getActiveTransactions() {
        return this.transactions.filter(t => t.status === 'borrowed');
    }
}

// Initialize library data
const library = new LibraryData();

// Navigation functionality
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.dataset.section;
            
            // Update active nav button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            // Refresh data for the active section
            refreshSection(targetSection);
        });
    });
}

// Section refresh functions
function refreshSection(section) {
    switch(section) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'books':
            displayBooks();
            break;
        case 'members':
            displayMembers();
            break;
        case 'transactions':
            displayTransactions();
            populateBorrowForm();
            populateReturnForm();
            break;
    }
}

// Dashboard updates
function updateDashboard() {
    const totalBooks = library.books.length;
    const totalMembers = library.members.length;
    const booksBorrowed = library.transactions.filter(t => t.status === 'borrowed').length;
    const availableBooks = library.books.reduce((sum, book) => sum + book.availableCopies, 0);

    document.getElementById('totalBooks').textContent = totalBooks;
    document.getElementById('totalMembers').textContent = totalMembers;
    document.getElementById('booksBorrowed').textContent = booksBorrowed;
    document.getElementById('availableBooks').textContent = availableBooks;
}

// Book management functions
function displayBooks() {
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = '';

    library.books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.genre}</td>
            <td>${book.availableCopies}</td>
            <td>${book.totalCopies}</td>
            <td>
                <button class="btn warning" onclick="editBook(${book.id})">Edit</button>
                <button class="btn danger" onclick="deleteBook(${book.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddBookForm() {
    document.getElementById('addBookForm').classList.remove('hidden');
    document.getElementById('editBookForm').classList.add('hidden');
}

function hideAddBookForm() {
    document.getElementById('addBookForm').classList.add('hidden');
    document.getElementById('bookForm').reset();
}

function showEditBookForm() {
    document.getElementById('editBookForm').classList.remove('hidden');
    document.getElementById('addBookForm').classList.add('hidden');
}

function hideEditBookForm() {
    document.getElementById('editBookForm').classList.add('hidden');
    document.getElementById('editBookFormElement').reset();
}

function editBook(id) {
    const book = library.getBookById(id);
    if (book) {
        document.getElementById('editBookId').value = book.id;
        document.getElementById('editBookTitle').value = book.title;
        document.getElementById('editBookAuthor').value = book.author;
        document.getElementById('editBookISBN').value = book.isbn;
        document.getElementById('editBookGenre').value = book.genre;
        document.getElementById('editBookCopies').value = book.totalCopies;
        showEditBookForm();
    }
}

function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        if (library.deleteBook(id)) {
            displayBooks();
            updateDashboard();
        }
    }
}

function searchBooks() {
    const searchTerm = document.getElementById('bookSearch').value.toLowerCase();
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = '';

    const filteredBooks = library.books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.isbn.toLowerCase().includes(searchTerm) ||
        book.genre.toLowerCase().includes(searchTerm)
    );

    filteredBooks.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.genre}</td>
            <td>${book.availableCopies}</td>
            <td>${book.totalCopies}</td>
            <td>
                <button class="btn warning" onclick="editBook(${book.id})">Edit</button>
                <button class="btn danger" onclick="deleteBook(${book.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Member management functions
function displayMembers() {
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = '';

    library.members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${member.booksBorrowed}</td>
            <td>
                <button class="btn warning" onclick="editMember(${member.id})">Edit</button>
                <button class="btn danger" onclick="deleteMember(${member.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddMemberForm() {
    document.getElementById('addMemberForm').classList.remove('hidden');
    document.getElementById('editMemberForm').classList.add('hidden');
}

function hideAddMemberForm() {
    document.getElementById('addMemberForm').classList.add('hidden');
    document.getElementById('memberForm').reset();
}

function showEditMemberForm() {
    document.getElementById('editMemberForm').classList.remove('hidden');
    document.getElementById('addMemberForm').classList.add('hidden');
}

function hideEditMemberForm() {
    document.getElementById('editMemberForm').classList.add('hidden');
    document.getElementById('editMemberFormElement').reset();
}

function editMember(id) {
    const member = library.getMemberById(id);
    if (member) {
        document.getElementById('editMemberId').value = member.id;
        document.getElementById('editMemberName').value = member.name;
        document.getElementById('editMemberEmail').value = member.email;
        document.getElementById('editMemberPhone').value = member.phone;
        showEditMemberForm();
    }
}

function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        if (library.deleteMember(id)) {
            displayMembers();
            updateDashboard();
        }
    }
}

function searchMembers() {
    const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = '';

    const filteredMembers = library.members.filter(member => 
        member.name.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm) ||
        member.phone.toLowerCase().includes(searchTerm)
    );

    filteredMembers.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.phone}</td>
            <td>${member.booksBorrowed}</td>
            <td>
                <button class="btn warning" onclick="editMember(${member.id})">Edit</button>
                <button class="btn danger" onclick="deleteMember(${member.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Transaction management functions
function displayTransactions() {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';

    library.transactions.forEach(transaction => {
        const member = library.getMemberById(transaction.memberId);
        const book = library.getBookById(transaction.bookId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member ? member.name : 'Unknown'}</td>
            <td>${book ? book.title : 'Unknown'}</td>
            <td>${transaction.borrowDate}</td>
            <td>${transaction.returnDate || '-'}</td>
            <td>
                <span class="status ${transaction.status}">${transaction.status}</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showBorrowForm() {
    document.getElementById('borrowForm').classList.remove('hidden');
    document.getElementById('returnForm').classList.add('hidden');
    populateBorrowForm();
}

function hideBorrowForm() {
    document.getElementById('borrowForm').classList.add('hidden');
    document.getElementById('borrowBookForm').reset();
}

function showReturnForm() {
    document.getElementById('returnForm').classList.remove('hidden');
    document.getElementById('borrowForm').classList.add('hidden');
    populateReturnForm();
}

function hideReturnForm() {
    document.getElementById('returnForm').classList.add('hidden');
    document.getElementById('returnBookForm').reset();
}

function populateBorrowForm() {
    const memberSelect = document.getElementById('borrowMember');
    const bookSelect = document.getElementById('borrowBook');
    
    memberSelect.innerHTML = '<option value="">Select Member</option>';
    bookSelect.innerHTML = '<option value="">Select Book</option>';
    
    library.members.forEach(member => {
        if (member.booksBorrowed < 3) {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.name} (${member.booksBorrowed}/3 books)`;
            memberSelect.appendChild(option);
        }
    });
    
    library.books.forEach(book => {
        if (book.availableCopies > 0) {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} (${book.availableCopies} available)`;
            bookSelect.appendChild(option);
        }
    });
}

function populateReturnForm() {
    const returnSelect = document.getElementById('returnTransaction');
    returnSelect.innerHTML = '<option value="">Select Active Transaction</option>';
    
    const activeTransactions = library.getActiveTransactions();
    
    activeTransactions.forEach(transaction => {
        const member = library.getMemberById(transaction.memberId);
        const book = library.getBookById(transaction.bookId);
        
        if (member && book) {
            const option = document.createElement('option');
            option.value = transaction.id;
            option.textContent = `${member.name} - ${book.title}`;
            returnSelect.appendChild(option);
        }
    });
}

// Initialize the application
function initApp() {
    initNavigation();
    updateDashboard();
    displayBooks();
    displayMembers();
    displayTransactions();
    populateBorrowForm();
    populateReturnForm();
    
    // Add form submission event listeners
    initFormHandlers();
    
    // Add CSS for status badges
    const style = document.createElement('style');
    style.textContent = `
        .status {
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        .status.borrowed {
            background-color: #ffc107;
            color: #212529;
        }
        .status.returned {
            background-color: #28a745;
            color: white;
        }
    `;
    document.head.appendChild(style);
}

// Form submission handlers
function initFormHandlers() {
    // Book form handler
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', handleAddBook);
    }

    // Edit book form handler
    const editBookForm = document.getElementById('editBookFormElement');
    if (editBookForm) {
        editBookForm.addEventListener('submit', handleEditBook);
    }

    // Member form handler
    const memberForm = document.getElementById('memberForm');
    if (memberForm) {
        memberForm.addEventListener('submit', handleAddMember);
    }

    // Edit member form handler
    const editMemberForm = document.getElementById('editMemberFormElement');
    if (editMemberForm) {
        editMemberForm.addEventListener('submit', handleEditMember);
    }

    // Borrow book form handler
    const borrowForm = document.getElementById('borrowBookForm');
    if (borrowForm) {
        borrowForm.addEventListener('submit', handleBorrowBook);
    }

    // Return book form handler
    const returnForm = document.getElementById('returnBookForm');
    if (returnForm) {
        returnForm.addEventListener('submit', handleReturnBook);
    }
}

// Book form handlers
function handleAddBook(e) {
    e.preventDefault();
    
    const book = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        isbn: document.getElementById('bookISBN').value.trim(),
        genre: document.getElementById('bookGenre').value.trim(),
        totalCopies: parseInt(document.getElementById('bookCopies').value)
    };

    if (!book.title || !book.author || !book.isbn || !book.genre || book.totalCopies <= 0) {
        alert('Please fill in all required fields correctly.');
        return;
    }

    library.addBook(book);
    displayBooks();
    updateDashboard();
    hideAddBookForm();
    
    // Show success message
    alert('Book added successfully!');
}

function handleEditBook(e) {
    e.preventDefault();
    
    const bookId = parseInt(document.getElementById('editBookId').value);
    const updatedBook = {
        title: document.getElementById('editBookTitle').value.trim(),
        author: document.getElementById('editBookAuthor').value.trim(),
        isbn: document.getElementById('editBookISBN').value.trim(),
        genre: document.getElementById('editBookGenre').value.trim(),
        totalCopies: parseInt(document.getElementById('editBookCopies').value)
    };

    if (!updatedBook.title || !updatedBook.author || !updatedBook.isbn || !updatedBook.genre || updatedBook.totalCopies <= 0) {
        alert('Please fill in all required fields correctly.');
        return;
    }

    library.updateBook(bookId, updatedBook);
    displayBooks();
    updateDashboard();
    hideEditBookForm();
    
    // Show success message
    alert('Book updated successfully!');
}

// Member form handlers
function handleAddMember(e) {
    e.preventDefault();
    
    const member = {
        name: document.getElementById('memberName').value.trim(),
        email: document.getElementById('memberEmail').value.trim(),
        phone: document.getElementById('memberPhone').value.trim()
    };

    if (!member.name || !member.email || !member.phone) {
        alert('Please fill in all required fields.');
        return;
    }

    if (!isValidEmail(member.email)) {
        alert('Please enter a valid email address.');
        return;
    }

    library.addMember(member);
    displayMembers();
    updateDashboard();
    hideAddMemberForm();
    
    // Show success message
    alert('Member registered successfully!');
}

function handleEditMember(e) {
    e.preventDefault();
    
    const memberId = parseInt(document.getElementById('editMemberId').value);
    const updatedMember = {
        name: document.getElementById('editMemberName').value.trim(),
        email: document.getElementById('editMemberEmail').value.trim(),
        phone: document.getElementById('editMemberPhone').value.trim()
    };

    if (!updatedMember.name || !updatedMember.email || !updatedMember.phone) {
        alert('Please fill in all required fields.');
        return;
    }

    if (!isValidEmail(updatedMember.email)) {
        alert('Please enter a valid email address.');
        return;
    }

    library.updateMember(memberId, updatedMember);
    displayMembers();
    updateDashboard();
    hideEditMemberForm();
    
    // Show success message
    alert('Member updated successfully!');
}

// Transaction form handlers
function handleBorrowBook(e) {
    e.preventDefault();
    
    const transaction = {
        memberId: parseInt(document.getElementById('borrowMember').value),
        bookId: parseInt(document.getElementById('borrowBook').value)
    };

    if (!transaction.memberId || !transaction.bookId) {
        alert('Please select both member and book.');
        return;
    }

    if (library.borrowBook(transaction)) {
        displayTransactions();
        displayBooks();
        displayMembers();
        updateDashboard();
        hideBorrowForm();
        alert('Book borrowed successfully!');
    }
}

function handleReturnBook(e) {
    e.preventDefault();
    
    const transactionId = parseInt(document.getElementById('returnTransaction').value);
    
    if (!transactionId) {
        alert('Please select a transaction.');
        return;
    }

    if (library.returnBook(transactionId)) {
        displayTransactions();
        displayBooks();
        displayMembers();
        updateDashboard();
        hideReturnForm();
        alert('Book returned successfully!');
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

document.addEventListener('DOMContentLoaded', initApp);
