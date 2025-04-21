import express from 'express';

const app = express();

app.use(express.json());


app.get('/', (req, res) => {
    res.json({ message: 'Base url test!' });
  });


app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Express api with vercel!' });
});

app.get('/api/hi', (req, res) => {
  res.json({ message: 'Hi!' });
});

export default app;