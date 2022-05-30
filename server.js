require('dotenv').config();

const path = require('path');
const express = require('express');
const { Client } = require("@notionhq/client");

// TODO: setup logging

const notion = new Client({ auth: process.env.NOTION_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

const app = express();

app.use(express.static(path.join(__dirname, 'dist')));
app.set('port', process.env.PORT || 8080);

// TODO: cache this call?
app.get('/data.json', async (_req, res) => {
    try {
        const originalData = await notion.databases.query({
            database_id: databaseId,
            // TODO: add log level parameter
        });

        const parsedData = originalData.results.map((row) => {
            const name = row.properties["Nome"].title.map((p) => p.plain_text).join('');
            const location = row.properties["Local"].select.name;
            const interests = row.properties["Tenho interesse em"].multi_select.map((p) => p.name);
            const knowledges = row.properties["Tenho conhecimento em"].multi_select.map((p) => p.name);
            const skills = row.properties["Tenho habilidade em"].multi_select.map((p) => p.name);

            return {'name': name, 'location': location, 'interests': interests, 'knowledges': knowledges, 'skills': skills}
        })

        res.status(200).send(parsedData);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

const server = app.listen(app.get('port'), function() {
  console.log('listening on port', server.address().port);
});

