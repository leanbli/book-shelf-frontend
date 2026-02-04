-- Создание таблицы users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы books
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100),
    year INTEGER,
    price NUMERIC(10, 2),
    quantity INTEGER DEFAULT 1,
    description TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Select * from books;
-- Добавьте тестовые данные
INSERT INTO users (username, email, password) 
VALUES ('admin', 'admin@example.com', 'admin123')
ON CONFLICT (username) DO NOTHING;

INSERT INTO books (title, author, year, price, user_id) VALUES
('Война и мир', 'Лев Толстой', 1869, 500.00, 1),
('1984', 'Джордж Оруэлл', 1949, 300.50, 1),
('Мастер и Маргарита', 'Михаил Булгаков', 1967, 450.00, 1);