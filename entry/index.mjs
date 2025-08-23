import fs from 'fs';
import express from 'express'
import pinoHttp from 'pino-http';
import Database from 'better-sqlite3';

// init db
const db = new Database('./data/entry.db');

db.exec(`CREATE TABLE IF NOT EXISTS entry (
  num INTEGER PRIMARY KEY,
  univ TEXT NOT NULL,
  team TEXT NOT NULL,
  enroll TEXT DEFAULT '[]'
);`);

process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

const app = express();
app.use(express.json());
app.use(express.static('./web'));
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  if (req.headers.authorization) {
    req.headers.authuser = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('utf-8').split(':')[0];
  }
  next();
});
app.use(pinoHttp({ stream: fs.createWriteStream('./data/entry.log', { flags: 'a' }) }));

app.listen(5000);

// return all entries
app.get('/all', (req, res) => {
  try {
    let data = {};

    for (const row of db.prepare("SELECT * FROM entry").all()) {
      data[row.num] = { univ: row.univ, team: row.team, enroll: JSON.parse(row.enroll) };
    }

    if (req.query.download !== undefined) {
      res.setHeader('Content-Disposition', 'attachment; filename="entry.json"');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(data, null, 2));
    } else {
      res.json(data);
    }
  } catch (e) {
    return res.status(500).send(`DB 오류: ${e}`);
  }
});

// return specific entry by number
app.get('/team/:num', (req, res) => {
  const num = Number(req.params.num);

  if (req.params.num === '' || Number.isNaN(num) || num < 0) {
    return res.status(400).send('올바르지 않은 엔트리 번호입니다.');
  }

  try {
    const row = db.prepare("SELECT * FROM entry WHERE num = ?").get(num);

    if (!row) {
      return res.status(400).send(`존재하지 않는 엔트리 번호입니다.`);
    }

    res.json(row);
  } catch (e) {
    return res.status(500).send(`DB 오류: ${e}`);
  }
});

// add new entry
app.post('/team', (req, res) => {
  const num = Number(req.body.num);

  if (req.body.num === '' || Number.isNaN(num) || num < 0) {
    return res.status(400).send('올바르지 않은 엔트리 번호입니다.');
  }

  if (req.body.univ === undefined || req.body.univ.trim() === '') {
    return res.status(400).send('올바르지 않은 학교명입니다.');
  }

  if (req.body.team === undefined || req.body.team.trim() === '') {
    return res.status(400).send('올바르지 않은 팀명입니다.');
  }

  try {
    db.prepare("INSERT INTO entry (num, univ, team, enroll) VALUES (?, ?, ?, '[]')").run(num, req.body.univ.trim(), req.body.team.trim());
    res.status(201).send();
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      return res.status(400).send('이미 존재하는 엔트리 번호입니다.');
    } else {
      return res.status(500).send(`DB 오류: ${e}`);
    }
  }
});

// update entry
app.patch('/team', (req, res) => {
  const num = Number(req.body.num);

  if (req.body.num === '' || Number.isNaN(num) || num < 0) {
    return res.status(400).send('올바르지 않은 엔트리 번호입니다.');
  }

  if (req.body.univ === undefined || req.body.univ.trim() === '') {
    return res.status(400).send('올바르지 않은 학교명입니다.');
  }

  if (req.body.team === undefined || req.body.team.trim() === '') {
    return res.status(400).send('올바르지 않은 팀명입니다.');
  }

  if (req.body.num_changed) {
    const prev = Number(req.body.prev);

    try {
      const ret = db.prepare("UPDATE entry SET num = ? WHERE num = ?").run(num, prev);

      if (!ret.changes) {
        return res.status(400).send('존재하지 않는 엔트리 번호입니다.');
      }
    } catch (e) {
      if (e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        return res.status(400).send('이미 존재하는 엔트리 번호입니다.');
      } else {
        return res.status(500).send(`DB 오류: ${e}`);
      }
    }
  } else {
    try {
      const ret = db.prepare("UPDATE entry SET univ = ?, team = ? WHERE num = ?")
        .run(req.body.univ.trim(), req.body.team.trim(), num);

      if (!ret.changes) {
        return res.status(400).send('존재하지 않는 엔트리 번호입니다.');
      }

      res.status(200).send();
    } catch (e) {
      return res.status(500).send(`DB 오류: ${e}`);
    }
  }
});

// remove entry
app.delete('/team', (req, res) => {
  const num = Number(req.body.num);

  if (req.body.num === '' || Number.isNaN(num) || num < 0) {
    return res.status(400).send('올바르지 않은 엔트리 번호입니다.');
  }

  try {
    const ret = db.prepare("DELETE FROM entry WHERE num = ?").run(num);

    if (!ret.changes) {
      return res.status(400).send(`존재하지 않는 엔트리 번호입니다.`);
    }

    res.status(200).send();
  } catch (e) {
    return res.status(500).send(`DB 오류: ${e}`);
  }
});

app.post('/enroll', (req, res) => {
  const num = Number(req.body.num);

  if (req.body.num === '' || Number.isNaN(num) || num < 0) {
    return res.status(400).send('올바르지 않은 엔트리 번호입니다.');
  }

  try {
    const row = db.prepare("SELECT enroll FROM entry WHERE num = ?").get(num);

    if (!row) {
      return res.status(400).send('존재하지 않는 엔트리 번호입니다.');
    }
    
    if (JSON.parse(row.enroll).some(date => date.startsWith(new Date().toISOString().slice(0, 10)))) {
      return res.status(400).send('이미 오늘 등록된 엔트리입니다.');
    }

    db.prepare(`UPDATE entry SET enroll = json_insert(enroll, '$[#]', ?) WHERE num = ?`).run(new Date().toISOString(), num);
    res.status(200).send();
  } catch (e) {
    return res.status(500).send(`DB 오류: ${e}`);
  }
});

// replace db
app.post('/upload', (req, res) => {
  let data;

  try {
    data = JSON.parse(req.body.data);
  } catch (e) {
    return res.status(400).send(`JSON 파일을 읽을 수 없습니다: ${e}`);
  }

  if (!validate(data)) {
    return res.status(400).send('올바르지 않은 JSON 형식입니다.');
  }

  try {
    db.transaction(() => {
      db.prepare("DELETE FROM entry").run();

      const query = db.prepare("INSERT INTO entry (num, univ, team, enroll) VALUES (?, ?, ?, '[]')");

      for (const [k, v] of Object.entries(data)) {
        query.run(Number(k), v.univ, v.team);
      }
    })();
  } catch (e) {
    return res.status(500).send(`DB 오류: ${e}`);
  }

  res.status(200).send();
});

function validate(data) {
  if (data === undefined || data === null || typeof data !== 'object') {
    return false;
  }

  for (const key in data) {
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
