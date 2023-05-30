const mysql = require('mysql');
const http = require('http');
const fs = require('fs');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'dbTest',
    charset: 'utf8_general_ci'
});

connection.connect((err) => {
    if (err) throw err.message;
    console.log('connect success');
    const sqlCreateTableProducts = 'create table if not exists products (id int auto_increment primary key, name varchar(30) not null, price int not null)';
    connection.query(sqlCreateTableProducts, (err) => {
        if (err) throw err.message;
        console.log('create table success');
    });
});

const server = http.createServer(async (req, res) => {
    try {
        if (req.url === "/product/create" && req.method === 'POST') {
            const buffers = [];
            for await (const chunk of req) {
                buffers.push(chunk);
            };
            const data = Buffer.concat(buffers).toString();
            const products = JSON.parse(data);
            const price = parseInt(products.price);
            const sqlCreate = `insert into products (name, price) values ("${products.name}", "${price}")`;
            connection.query(sqlCreate, (err) => {
                if (err) throw err.message;
                res.end(JSON.stringify(products));
                console.log(`insert products ("${products.name}", "${price}") complete`);
            });

        } else if (req.url === "/product/create" && req.method === 'GET') {
            fs.readFile('./show.html', 'utf8', (err, data) => {
                if (err) throw err.message;
                const sqlSelectProducts = `select * from products`;
                connection.query(sqlSelectProducts, (err, result) => {
                    if (err) throw err.message;
                    let dataSql = JSON.stringify(result);
                    res.writeHead(200, { "Content-Type": "text/html" });
                    data = data.replace("{products}", dataSql);
                    res.write(data);
                    res.end();
                });
            });
        }
    } catch (err) {
        return res.end(err.message);
    }
});

server.listen(8080, 'localhost', () => {
    console.log('server running at localhost:8080 ');
});