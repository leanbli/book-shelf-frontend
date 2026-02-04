// leanbli - Сидорова Варвара 03.02
// Комментарий Ксении Акрапович(Машталер)
console.log("Script loaded successfully!");

const API_URL = "http://localhost:5000/api/books";
let editingBookId = null;

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

async function loadBooks() {
    try {
        console.log("Загрузка книг из базы данных...");
        
        document.getElementById('bookTableBody').innerHTML = `
            <tr><td colspan="8" style="text-align: center; padding: 20px;">Загрузка данных...</td></tr>
        `;
        
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        console.log("Ответ от API:", data);

        const books = data.books || data;
        console.log(`Загружено книг: ${books.length}`);
        
        document.getElementById('booksCount').textContent = `Найдено книг: ${books.length}`;
        
        displayBooks(books);

    } catch (error) {
        console.error("Ошибка загрузки книг:", error);
        document.getElementById('bookTableBody').innerHTML = `
            <tr><td colspan="8" style="text-align: center; padding: 20px; color: red;">
                ❌ Ошибка загрузки данных. Проверьте:<br>
                1. Запущен ли Flask сервер (localhost:5000)<br>
                2. Инициализирована ли база данных (/api/init-db)
            </td></tr>
        `;
    }
}

// Отображение книг в таблице
function displayBooks(books) {
    const tableBody = document.getElementById('bookTableBody');
    tableBody.innerHTML = '';

    if (!books || books.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 20px;">
                    📚 База данных пуста. Добавьте первую книгу!
                </td>
            </tr>
        `;
        return;
    }

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td><strong>${book.title}</strong></td>
            <td>${book.author || '-'}</td>
            <td>${book.year || '-'}</td>
            <td>${book.price ? `${book.price} ₽` : '-'}</td>
            <td>${book.quantity || 1}</td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${book.description || 'Нет описания'}
            </td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editBook(${book.id})">✏️ Редактировать</button>
                    <button class="delete-btn" onclick="deleteBook(${book.id})">🗑️ Удалить</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Добавление новой книги
document.getElementById('bookForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const bookData = {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        year: document.getElementById('year').value ? parseInt(document.getElementById('year').value) : null,
        price: document.getElementById('price').value ? parseFloat(document.getElementById('price').value) : null,
        quantity: document.getElementById('quantity').value ? parseInt(document.getElementById('quantity').value) : 1,
        description: document.getElementById('description').value.trim()
    };

    if (!bookData.title) {
        alert("Название книги обязательно!");
        return;
    }

    try {
        let response;
        let method;
        let url = API_URL;
        
        if (editingBookId) {
            method = 'PUT';
            url = `${API_URL}/${editingBookId}`;
        } else {
            method = 'POST';
        }

        response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });

        if (response.ok) {
            const result = await response.json();
            alert(`✅ ${result.message || (editingBookId ? 'Книга обновлена!' : 'Книга добавлена!')}`);
            
            this.reset();
            
            cancelEditMode();
            
            loadBooks();
        } else {
            const error = await response.json();
            alert(`❌ Ошибка: ${error.error || 'Неизвестная ошибка'}`);
        }

    } catch (error) {
        console.error("Ошибка при сохранении книги:", error);
        alert("Сетевая ошибка. Проверьте консоль.");
    }
});

// Удаление книги
async function deleteBook(id) {
    if (!confirm(`Удалить книгу #${id}? Это действие нельзя отменить.`)) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("✅ Книга удалена!");
            loadBooks();
        } else {
            const error = await response.json();
            alert(`❌ Ошибка: ${error.error || 'Не удалось удалить книгу'}`);
        }
    } catch (error) {
        console.error("Ошибка удаления книги:", error);
        alert("❌ Сетевая ошибка при удалении");
    }
}

// Редактирование книги
async function editBook(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) {
            throw new Error(`Ошибка загрузки книги: ${response.status}`);
        }

        const book = await response.json();
        console.log("Книга для редактирования:", book);

        document.getElementById('title').value = book.title;
        document.getElementById('author').value = book.author || '';
        document.getElementById('year').value = book.year || '';
        document.getElementById('price').value = book.price || '';
        document.getElementById('quantity').value = book.quantity || 1;
        document.getElementById('description').value = book.description || '';

        editingBookId = id;
        document.getElementById('submitBtn').textContent = 'Обновить книгу';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        
        document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        console.error("Ошибка загрузки книги для редактирования:", error);
        alert("❌ Не удалось загрузить книгу для редактирования");
    }
}

function cancelEditMode() {
    editingBookId = null;
    document.getElementById('submitBtn').textContent = 'Сохранить книгу';
    document.getElementById('cancelEditBtn').style.display = 'none';
    document.getElementById('bookForm').reset();
}

document.getElementById('clearBtn').addEventListener('click', function () {
    if (confirm("Очистить все поля формы?")) {
        document.getElementById('bookForm').reset();
        cancelEditMode();
    }
});

document.getElementById('cancelEditBtn').addEventListener('click', function () {
    cancelEditMode();
    alert("Режим редактирования отменен");
});

document.getElementById('refreshBtn').addEventListener('click', function () {
    loadBooks();
});

document.addEventListener('DOMContentLoaded', function () {
    console.log("Страница загружена, загружаем книги...");
    loadBooks();

    fetch('http://localhost:5000/')
        .then(r => {
            console.log("Подключение к серверу:", r.ok ? "✅ Успешно" : "❌ Не удалось");
        })
        .catch(e => {
            console.log("❌ Сервер недоступен:", e);
            alert("⚠️ Flask сервер недоступен на localhost:5000\n\nЗапустите командой: python app.py");
        });
});
