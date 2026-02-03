// leanbli - Сидорова Варвара 03.02
// Исправлено: работа с новым форматом API
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

        const data = await response.json();
        console.log("API response:", data);

        // 📌 ИСПРАВЛЕНИЕ: API возвращает {books: [...], count: ...}
        // Извлекаем массив книг из ответа
        const books = data.books || data;
        console.log("Books extracted:", books);

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

    if (!books || books.length === 0) {
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
                <button onclick="editBook(${book.id})" style="background: orange; margin-right: 5px;">Edit</button>
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
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
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
            const result = await response.json();
            alert(`✅ ${result.message || 'Book added successfully!'}`);
            this.reset();
            loadBooks();
        } else {
            const error = await response.json();
            alert(`❌ Error: ${error.error || 'Unknown error'}`);
        }

    } catch (error) {
        console.error("Error adding book:", error);
        alert("Error adding book. Check console.");
    }
});

// Delete book - НУЖНО СОЗДАТЬ ЭНДПОИНТ DELETE НА БЭКЕНДЕ
async function deleteBook(id) {
    if (!confirm(`Delete book #${id}?`)) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("✅ Book deleted!");
            loadBooks();
        } else {
            const error = await response.json();
            alert(`❌ Error: ${error.error || 'Cannot delete book'}`);
        }
    } catch (error) {
        console.error("Error deleting book:", error);
        alert("❌ Network error");
    }
}

// Edit book
async function editBook(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error(`Failed to load book: ${response.status}`);
        }

        const book = await response.json();

        // 📌 ИСПРАВЛЕНИЕ: book может быть объектом или вложен в data
        const bookData = book.book || book;

        document.getElementById('title').value = bookData.title;
        document.getElementById('author').value = bookData.author || '';
        document.getElementById('year').value = bookData.year || '';

        // Change button text and behavior
        const form = document.getElementById('bookForm');
        const submitBtn = document.querySelector('#bookForm button[type="submit"]');

        submitBtn.textContent = 'Update';
        submitBtn.dataset.editingId = id;

        // Temporarily replace form handler
        const originalSubmit = form.onsubmit;

        form.onsubmit = async function (e) {
            e.preventDefault();

            const updatedData = {
                title: document.getElementById('title').value.trim(),
                author: document.getElementById('author').value.trim(),
                year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null
            };

            try {
                const updateResponse = await fetch(`${API_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (updateResponse.ok) {
                    alert("✅ Book updated!");
                    form.reset();
                    submitBtn.textContent = 'Save';
                    form.onsubmit = originalSubmit;
                    delete submitBtn.dataset.editingId;
                    loadBooks();
                } else {
                    const error = await updateResponse.json();
                    alert(`❌ Error: ${error.error || 'Update failed'}`);
                }

            } catch (error) {
                console.error("Update error:", error);
                alert("❌ Network error during update");
            }
        };

    } catch (error) {
        console.error("Error loading book for edit:", error);
        alert("❌ Cannot load book for editing");
    }
}

// Clear form button
document.getElementById('clearBtn').addEventListener('click', function () {
    document.getElementById('bookForm').reset();
    const submitBtn = document.querySelector('#bookForm button[type="submit"]');
    submitBtn.textContent = 'Save';

    // Reset edit mode if active
    if (submitBtn.dataset.editingId) {
        delete submitBtn.dataset.editingId;
        // Restore original submit handler
        document.getElementById('bookForm').onsubmit = async function (e) {
            e.preventDefault();

            const bookData = {
                title: document.getElementById('title').value.trim(),
                author: document.getElementById('author').value.trim(),
                year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null
            };

            if (!bookData.title) {
                alert("Book title is required!");
                return;
            }

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookData)
                });

                if (response.ok) {
                    alert("✅ Book added!");
                    this.reset();
                    loadBooks();
                } else {
                    const error = await response.json();
                    alert(`❌ Error: ${error.error}`);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("❌ Network error");
            }
        };
    }
});

// Load books on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log("Page loaded, loading books...");
    loadBooks();

    // Test server connection
    fetch(API_URL)
        .then(r => {
            console.log("Server connection:", r.ok ? "✅ OK" : "❌ FAILED");
            return r.json();
        })
        .then(data => console.log("Server response format:", data))
        .catch(e => console.log("❌ Server not available:", e));
});
