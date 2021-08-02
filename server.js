const logsRouter = require('./routes/logs');
const express = require('express');

const app = express();
app.use('/', logsRouter);

module.exports = app;