-- Database: bookshelf

-- DROP DATABASE IF EXISTS bookshelf;

CREATE DATABASE bookshelf
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Russian_Russia.1251'
    LC_CTYPE = 'Russian_Russia.1251'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

Create table users(
id_user serial primary key,
first_name varchar (20),
last_name varchar (20),
login varchar (20),
"password" varchar (30));

Create table nomenclature(
id_book serial primary key,
name_book varchar(20),
autor varchar (60),
release_year int,
id_creator int,
constraint fk_creator foreign key (id_creator) references users (id_user) on delete set null);
