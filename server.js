const express = require('express');
const app = express();
const path = require('path');
// const proxy = require('http-proxy-middleware');
const routes = require('./routes');
const PORT = 4080;

const dir = path.join(__dirname, 'public');
// CORS solution
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(dir));
// app.use(proxy('/api/*',
//     { target: 'http://localhost:4050' },
//     { secure: false}
// ));

// Add routes, both API and view
app.use(routes);

app.listen(PORT, ()=> console.log(` Now listening on port ${PORT}`));