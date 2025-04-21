import express from 'express';

const test = ""
const port = 3000

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

app.listen(port, () => {
    console.log(`Server listening at http://127.0.0.1:${port}`)
})

export default app;