const mysql = require('mysql');
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Conexão com o MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'eleicoes_2026'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Conectado ao MySQL!');
});

// Servidor HTTP
http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Função para servir arquivos HTML
    const serveFile = (filePath) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Arquivo não encontrado');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    };

    // Rotas
    if (pathname === '/' || pathname === '/index.html') {
        serveFile(path.join(__dirname, '../frontend/index.html'));
    } else if (pathname === '/menu.html') {
        serveFile(path.join(__dirname, '../frontend/menu.html'));
    } else if (pathname === '/partidos.html') {
        serveFile(path.join(__dirname, '../frontend/partidos.html'));
    } else if (pathname === '/candidatos.html') {
        serveFile(path.join(__dirname, '../frontend/candidatos.html'));
    } else if (pathname === '/css/styles.css') { // Ajuste para o caminho correto
        fs.readFile(path.join(__dirname, '../frontend/css/styles.css'), (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Arquivo não encontrado');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            }
        });
    } else if (pathname === '/script.js') { // Rota para o script.js
        fs.readFile(path.join(__dirname, '../frontend/script.js'), (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Arquivo não encontrado');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(data);
            }
        });
    } else if (pathname === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { usuario, senha } = JSON.parse(body);
            connection.query(
                'SELECT * FROM usuarios WHERE usuario = ? AND senha = ?',
                [usuario, senha],
                (err, results) => {
                    if (err) throw err;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    if (results.length > 0) {
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.end(JSON.stringify({ success: false }));
                    }
                }
            );
        });
    } else if (pathname === '/cadastrar-partido' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { nome, sigla, numero_registro } = JSON.parse(body);
            connection.query(
                'INSERT INTO partidos (nome, sigla, numero_registro) VALUES (?, ?, ?)',
                [nome, sigla, numero_registro],
                (err) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            if (err.message.includes('sigla')) {
                                res.end(JSON.stringify({ success: false, error: 'A sigla informada já está em uso. Escolha outra.' }));
                            } else if (err.message.includes('numero_registro')) {
                                res.end(JSON.stringify({ success: false, error: 'O número de registro informado já está em uso. Escolha outro.' }));
                            } else {
                                res.end(JSON.stringify({ success: false, error: 'Erro ao cadastrar: dado duplicado.' }));
                            }
                        } else {
                            res.end(JSON.stringify({ success: false, error: 'Erro ao cadastrar: ' + err.message }));
                        }
                    } else {
                        res.end(JSON.stringify({ success: true }));
                    }
                }
            );
        });
    } else if (pathname === '/listar-partidos' && req.method === 'GET') {
        connection.query('SELECT * FROM partidos', (err, results) => {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    } else if (pathname === '/excluir-partido' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { id } = JSON.parse(body);
            connection.query(
                'DELETE FROM partidos WHERE id = ?',
                [id],
                (err) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    if (err) {
                        res.end(JSON.stringify({ success: false, error: 'Erro ao excluir: ' + err.message }));
                    } else {
                        res.end(JSON.stringify({ success: true }));
                    }
                }
            );
        });
    } else if (pathname === '/editar-partido' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { id, nome, sigla, numero_registro } = JSON.parse(body);
            connection.query(
                'UPDATE partidos SET nome = ?, sigla = ?, numero_registro = ? WHERE id = ?',
                [nome, sigla, numero_registro, id],
                (err) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            if (err.message.includes('sigla')) {
                                res.end(JSON.stringify({ success: false, error: 'A sigla informada já está em uso. Escolha outra.' }));
                            } else if (err.message.includes('numero_registro')) {
                                res.end(JSON.stringify({ success: false, error: 'O número de registro informado já está em uso. Escolha outro.' }));
                            } else {
                                res.end(JSON.stringify({ success: false, error: 'Erro ao atualizar: dado duplicado.' }));
                            }
                        } else {
                            res.end(JSON.stringify({ success: false, error: 'Erro ao atualizar: ' + err.message }));
                        }
                    } else {
                        res.end(JSON.stringify({ success: true }));
                    }
                }
            );
        });
    } else if (pathname === '/cadastrar-candidato' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const candidato = JSON.parse(body);
                connection.query(
                    'INSERT INTO candidatos (cpf, titulo_eleitor, nome, endereco, numero, bairro, cidade, uf, cep, renda_mensal, partido_id, numero_candidato) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        candidato.cpf,
                        candidato.titulo_eleitor,
                        candidato.nome,
                        candidato.endereco,
                        candidato.numero,
                        candidato.bairro,
                        candidato.cidade,
                        candidato.uf,
                        candidato.cep,
                        parseFloat(candidato.renda_mensal),
                        parseInt(candidato.partido_id),
                        parseInt(candidato.numero_candidato)
                    ],
                    (err) => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        if (err) {
                            if (err.code === 'ER_DUP_ENTRY') {
                                if (err.message.includes('cpf')) {
                                    res.end(JSON.stringify({ success: false, error: 'O CPF informado já está cadastrado. Use outro CPF.' }));
                                } else if (err.message.includes('titulo_eleitor')) {
                                    res.end(JSON.stringify({ success: false, error: 'O título de eleitor informado já está cadastrado. Use outro.' }));
                                } else if (err.message.includes('numero_candidato')) {
                                    res.end(JSON.stringify({ success: false, error: 'O número de candidato informado já está em uso. Escolha outro.' }));
                                } else {
                                    res.end(JSON.stringify({ success: false, error: 'Erro ao cadastrar: dado duplicado.' }));
                                }
                            } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                                res.end(JSON.stringify({ success: false, error: 'O partido informado não existe. Cadastre o partido primeiro.' }));
                            } else {
                                res.end(JSON.stringify({ success: false, error: 'Erro ao cadastrar: ' + err.message }));
                            }
                        } else {
                            res.end(JSON.stringify({ success: true }));
                        }
                    }
                );
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Erro ao processar a requisição: ' + error.message }));
            }
        });
    } else if (pathname === '/listar-candidatos' && req.method === 'GET') {
        connection.query('SELECT * FROM candidatos', (err, results) => {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    } else if (pathname === '/excluir-candidato' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { id } = JSON.parse(body);
            connection.query(
                'DELETE FROM candidatos WHERE id = ?',
                [id],
                (err) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    if (err) {
                        res.end(JSON.stringify({ success: false, error: 'Erro ao excluir: ' + err.message }));
                    } else {
                        res.end(JSON.stringify({ success: true }));
                    }
                }
            );
        });
    } else if (pathname === '/editar-candidato' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const candidato = JSON.parse(body);
            connection.query(
                'UPDATE candidatos SET cpf = ?, titulo_eleitor = ?, nome = ?, endereco = ?, numero = ?, bairro = ?, cidade = ?, uf = ?, cep = ?, renda_mensal = ?, partido_id = ?, numero_candidato = ? WHERE id = ?',
                [candidato.cpf, candidato.titulo_eleitor, candidato.nome, candidato.endereco, candidato.numero, candidato.bairro, candidato.cidade, candidato.uf, candidato.cep, candidato.renda_mensal, candidato.partido_id, candidato.numero_candidato, candidato.id],
                (err) => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            if (err.message.includes('cpf')) {
                                res.end(JSON.stringify({ success: false, error: 'O CPF informado já está cadastrado. Use outro CPF.' }));
                            } else if (err.message.includes('titulo_eleitor')) {
                                res.end(JSON.stringify({ success: false, error: 'O título de eleitor informado já está cadastrado. Use outro.' }));
                            } else if (err.message.includes('numero_candidato')) {
                                res.end(JSON.stringify({ success: false, error: 'O número de candidato informado já está em uso. Escolha outro.' }));
                            } else {
                                res.end(JSON.stringify({ success: false, error: 'Erro ao atualizar: dado duplicado.' }));
                            }
                        } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
                            res.end(JSON.stringify({ success: false, error: 'O partido informado não existe. Cadastre o partido primeiro.' }));
                        } else {
                            res.end(JSON.stringify({ success: false, error: 'Erro ao atualizar: ' + err.message }));
                        }
                    } else {
                        res.end(JSON.stringify({ success: true }));
                    }
                }
            );
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Rota não encontrada');
    }
}).listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});