import fs from 'fs';
import express from 'express'
import pinoHttp from 'pino-http';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ stream: fs.createWriteStream('./app.log', { flags: 'a' }) }));

app.listen(5000);

app.get('/', (req, res) => {
  req.log.info({ custom: 'test' }, 'response');
  res.send('Hello World');
});

