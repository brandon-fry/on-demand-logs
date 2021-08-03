const express = require('express');
const router = express.Router();
const { parseLog } = require('../logUtil');

router.get('/logs/:filename', async function (req, res) {
    // count is optional
    let count;
    if (req.query.count != null) {
        count = parseInt(req.query.count);
        if (Number.isNaN(count) || count < 0) {
            return res.status(400).json({ code: 'EINVAL', message: 'count must be a positive integer' });
        }
    }

    // filter is optional
    let filter;
    if (req.query.filter != null) {
        try {
            filter = decodeURIComponent(req.query.filter);
        } catch (err) {
            return res.status(400).json({ code: err.code, message: err.message });
        }
    }

    // filename is required on the path
    let filename;
    try {
        filename = decodeURIComponent(req.params.filename);
    } catch (err) {
        return res.status(400).json({ code: err.code, message: err.message });
    }

    try {
        const events = await parseLog(`/var/log/${filename}`, count, filter);
        return res.status(200).json({ events: events });
    } catch (err) {
        if (err.code === 'ENOENT') {
            return res.status(404).json({ code: err.code, message: err.message });
        } else {
            return res.status(500).json({ code: err.code, message: err.message });
        }
    }

})

module.exports = router