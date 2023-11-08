const express = require('express');
const router = express.Router();

const exec = require('../src/exec')
const getDataFromXml = require('../src/converter')

function route(dbhelper) {

    const  doMessageWork  = exec(dbhelper);
 
    router.get('/ping', async (req, res) => {
        res.send({ result: 'pong' });
    });

    router.post(`/saveAESresults`, async (req, resp) => {

        const data = await getDataFromXml(req.body);
        const ams = await doMessageWork(data);
        console.log(JSON.stringify(ams, null, '\t'));

        resp.status(ams.succes ? 200 : 500 ).send(ams.succes ? 'Ok' : ams.message);

    });

    return router;
}

module.exports = route;