DROP DATABASE IF EXISTS express_cc;

CREATE DATABASE express_cc;

USE express_cc;

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password BINARY(60),
    PRIMARY KEY (id)
);
