const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mariadb = require('mariadb');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'stanko',
  password: 'stanko98',
  database: 'kalendar_zakazivanje',
  connectionLimit: 5
});

// Testiraj konekciju sa bazom
pool.getConnection()
  .then(conn => {
    console.log("Connected to MariaDB!");
    conn.release();
  })
  .catch(err => {
    console.log("Not connected due to error: " + err);
  });

  app.post('/api/schedule', async (req, res) => {
    const { date, time, description } = req.body;
    if (!date || !time || !description) {
      return res.status(400).send('Date, time, and description are required');
    }
    
    try {
      const conn = await pool.getConnection();
      const result = await conn.query('INSERT INTO schedule (date, time, description) VALUES (?, ?, ?)', [date, time, description]);
      conn.release();
      res.status(201).send({ id: result.insertId, date, time, description });
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
  app.get('/api/schedule', async (req, res) => {
    try {
      const conn = await pool.getConnection();
      const schedules = await conn.query('SELECT * FROM schedule');
      conn.release();
      res.status(200).send(schedules);
    } catch (err) {
      res.status(500).send(err);
    }
  });
  
  
  app.delete('/api/schedule/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM schedule WHERE id = ?', [id]);
      conn.release();
      res.status(204).send();
    } catch (err) {
      res.status(500).send(err);
    }
  });
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
