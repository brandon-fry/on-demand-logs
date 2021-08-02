var express = require('express');
var router = express.Router();
const fs = require('fs/promises');

router.get('/logs/:filename', async function (req, res) {
    let filename;

    try {
        filename = decodeURIComponent(req.params.filename);
    } catch (err) {
        res.status(400).send({ code: err.code, message: err.message });
    }

    try {
        const fileContents = await fs.readFile(`/var/log/${filename}`, "utf8");
        // TODO: parse file and return Events array
        res.status(200).send(fileContents);
    } catch (err) {
        if (err.code === 'ENOENT') {
            res.status(404).send({ code: err.code, message: err.message });
        }
    }

})

module.exports = router