const app = require('./server');
const port = 3000;

app.get('/', function (request, response) {
    response.sendFile(`${__dirname}/index.html`);
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
})