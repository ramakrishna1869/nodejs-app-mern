// index.js
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectToDatabase } from './mongoC.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let db;
try {
  db = await connectToDatabase();
} catch (err) {
  console.error("Exiting: could not connect to MongoDB. Fix credentials/IP and restart.");
  process.exit(1);
}

app.get('/', (req, res) => {
  res.send('Hello World, from express');
});

app.post('/addUser', async (req, res) => {
  try {
    const collection = db.collection('users');
    const newDocument = { ...req.body, date: new Date() };
    const result = await collection.insertOne(newDocument);
    res.status(201).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Insert failed' });
  }
});

app.get('/getUsers', async (req, res) => {
  try {
    const collection = db.collection('users');
    const results = await collection.find({}).toArray();
    res.status(200).send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Query failed' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening at port: ${port}`);
});
