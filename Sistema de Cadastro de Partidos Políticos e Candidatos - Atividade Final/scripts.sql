CREATE DATABASE eleicoes_2026;
USE eleicoes_2026;

-- Tabela de Usuários (para login)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL,
    senha VARCHAR(50) NOT NULL
);

-- Tabela de Partidos
CREATE TABLE partidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(10) NOT NULL,
    numero_registro INT NOT NULL UNIQUE
);

-- Tabela de Candidatos
CREATE TABLE candidatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    titulo_eleitor VARCHAR(12) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    renda_mensal DECIMAL(10, 2) NOT NULL,
    partido_id INT,
    numero_candidato INT NOT NULL UNIQUE,
    FOREIGN KEY (partido_id) REFERENCES partidos(id)
);

-- Inserir um usuário padrão para login
INSERT INTO usuarios (usuario, senha) VALUES ('thalita', '12345');