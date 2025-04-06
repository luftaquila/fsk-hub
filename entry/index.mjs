import fs from 'fs';
import path from 'path';
import express from 'express'
import pinoHttp from 'pino-http';
import { JSONFilePreset } from 'lowdb/node';

const db = await JSONFilePreset(path.join(path.resolve(), 'db.json'), {});
const web = path.join(path.resolve(), 'web');

const app = express();

app.use(express.json());
app.use(express.static(web));
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ stream: fs.createWriteStream('./app.log', { flags: 'a' }) }));

app.listen(5000);

// return all entries
app.get('/all', async (req, res) => {
  if (req.query.download !== undefined) {
    res.setHeader('Content-Disposition', 'attachment; filename="entry.json"');
    res.setHeader('Content-Type', 'application/json');

    await db.read();
    res.send(JSON.stringify(db.data, null, 2));
  } else {
    await db.read();
    res.json(db.data);
  }
});

// return specific entry by number
app.get('/team', async (req, res) => {
  if (req.query.num === undefined) {
    return res.status(400).send('Err: missing entry number');
  }

  await db.read();

  if (db.data[req.query.num] === undefined) {
    return res.status(400).send(`Err: entry ${req.query.num} not exists`);
  } else {
    return res.json(db.data[req.query.num]);
  }
});

// add new entry
app.post('/team', async (req, res) => {
  let num = Number(req.body.num);

  if (req.body.num === '' || Number.isNaN(num) || num < 0) {
    return res.status(400).send('Err: bad entry number');
  }

  if (req.body.univ === undefined || req.body.univ.trim() === '') {
    return res.status(400).send('Err: bad entry univ');
  }

  if (req.body.team === undefined || req.body.team.trim() === '') {
    return res.status(400).send('Err: bad entry team');
  }

  await db.read();

  if (db.data[num]) {
    return res.status(400).send(`Err: entry ${num} already exists`);
  }

  db.data[num] = {
    univ: req.body.univ.trim(),
    team: req.body.team.trim(),
  };

  await db.write();
  res.status(201).send();
});

// update entry
app.patch('/team', async (req, res) => {
  let num = Number(req.body.num);

  if (req.body.num === '' || Number.isNaN(num) || num < 0) {
    return res.status(400).send('Err: bad entry number');
  }

  if (req.body.univ === undefined || req.body.univ.trim() === '') {
    return res.status(400).send('Err: bad entry univ');
  }

  if (req.body.team === undefined || req.body.team.trim() === '') {
    return res.status(400).send('Err: bad entry team');
  }

  await db.read();

  if (req.body.num_changed === false) {
    if (db.data[num] === undefined) {
      return res.status(400).send(`Err: entry ${num} not exists`);
    }

    db.data[num] = {
      univ: req.body.univ.trim(),
      team: req.body.team.trim(),
    };
  } else {
    let prev = Number(req.body.prev);

    if (req.body.prev === '' || Number.isNaN(prev) || prev < 0) {
      return res.status(400).send('Err: bad prev entry number');
    }

    if (db.data[prev] === undefined) {
      return res.status(400).send(`Err: entry ${prev} not exists`);
    }

    if (db.data[num]) {
      return res.status(400).send(`Err: entry ${num} already exists`);
    }

    db.data[num] = db.data[prev];
    delete db.data[prev];
  }

  await db.write();
  res.status(200).send();
});

// remove entry
app.delete('/team', async (req, res) => {
  let num = Number(req.body.num);

  if (req.body.num === '' || Number.isNaN(num) || num < 0) {
    return res.status(400).send('Err: bad entry number');
  }

  await db.read();

  if (db.data[num] === undefined) {
    return res.status(400).send(`Err: entry ${num} not exists`);
  }

  delete db.data[num];
  await db.write();
  res.status(200).send();
});

// replace db
app.post('/upload', async (req, res) => {
  let data;

  try {
    data = JSON.parse(req.body.data);
  } catch (e) {
    return res.status(400).send(`Err: bad db format: ${e}`);
  }

  if (validate(data)) {
    db.data = data;
    await db.write();
  } else {
    return res.status(400).send('Err: bad db format');
  }

  res.status(200).send();
});

function validate(data) {
  if (data === undefined || data === null || typeof data !== 'object') {
    return false;
  }

  for (let key in data) {
    if (!/^\d+$/.test(key)) {
      return false;
    }

    const value = data[key];

    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const keys = Object.keys(value);

    if (keys.length !== 2 || !keys.includes('univ') || !keys.includes('team')) {
      return false;
    }
  }

  return true;
}
