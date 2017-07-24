import bodyParser from 'body-parser';
import api from './api';

import path from 'path';
import mysql from 'mysql';

const config = require('../config.json');

const db = mysql.createConnection(config.mysql);
db.connect();

const express = require('express');
const app = express();

app.use(bodyParser.json({
    limit : config.bodyLimit
}));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api', api({db}));

app.use(express.static(path.join(__dirname, './public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + './public/index.html'));
});

app.listen(3000, function () {

    console.log('server started');
});