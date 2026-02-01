// Bookshelf Frontend JavaScript
console.log("Script loaded successfully!");

const API_URL = "http://localhost:5000/api/books";

// ========== BASIC FUNCTIONS ==========

// Load all books from server
async function loadBooks() {
    try {
        console.log("Loading books from server...");
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const books = await response.json();
        console.log("Books loaded:", books);
        displayBooks(books);

    } catch (error) {
        console.error("Error loading books:", error);
        alert("Cannot load books. Check if server is running.");
    }
}

// Display books in table
function displayBooks(books) {
    const tableBody = document.getElementById('bookTableBody');
    tableBody.innerHTML = '';

    if (books.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No books found. Add first!</td></tr>';
        return;
    }

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author || '-'}</td>
            <td>${book.year || '-'}</td>
            <td>
                <button onclick="editBook(${book.id})" style="background: orange;">Edit</button>
                <button onclick="deleteBook(${book.id})" style="background: red; color: white;">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add new book
document.getElementById('bookForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null
    };

    if (!bookData.title) {
        alert("Book title is required!");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            alert("Book added successfully!");
            this.reset();
            loadBooks();
        } else {
            const error = await response.json();
            alert(`Error: ${error.error || 'Unknown error'}`);
        }

    } catch (error) {
        console.error("Error adding book:", error);
        alert("Error adding book. Check console.");
    }
});

// Delete book
async function deleteBook(id) {
    if (!confirm("Delete this book?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadBooks();
        }
    } catch (error) {
        console.error("Error deleting book:", error);
    }
}

// Edit book (simple version)
async function editBook(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        const book = await response.json();

        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author || '';
        document.getElementById('year').value = book.year || '';

        // Change button text
        const saveBtn = document.querySelector('#bookForm button[type="submit"]');
        saveBtn.textContent = 'Update';
        saveBtn.onclick = async function (e) {
            e.preventDefault();

            const updatedData = {
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null
            };

            const updateResponse = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (updateResponse.ok) {
                alert("Book updated!");
                document.getElementById('bookForm').reset();
                saveBtn.textContent = 'Save';
                loadBooks();
            }
        };

    } catch (error) {
        console.error("Error loading book for edit:", error);
    }
}

// Clear form button
document.getElementById('clearBtn').addEventListener('click', function () {
    document.getElementById('bookForm').reset();
    const saveBtn = document.querySelector('#bookForm button[type="submit"]');
    saveBtn.textContent = 'Save';
});

// Load books on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log("Page loaded, loading books...");
    loadBooks();

    // Test server connection
    fetch(API_URL)
        .then(r => console.log("Server connection:", r.ok ? "OK" : "FAILED"))
        .catch(e => console.log("Server not available"));
});