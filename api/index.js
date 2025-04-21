import express from 'express';
import { findMovieByTitle } from './functions/chuy.js';
import cors from 'cors'

const test = ""
const port = 3000

const app = express();

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Base url test!' });
});

app.get('/movies/:title', async (req, res) => {

    const {title} = req.params  

    try {
        const movie = await findMovieByTitle(title)
        if (!movie) {
            return res.status(404).send('Movie not found');
        } else {
            res.status(200).json(movie)
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
})

app.get('/api', (req, res) => {
    res.json({ message: 'Hello from Express api with vercel!' });
});

app.get('/api/hi', (req, res) => {
    res.json({ message: 'Hi!' });
});

app.get('/api/actions', (req, res) => {
    res.json({ message: 'Action works!' });
});

app.listen(port, () => {
    console.log(`Server listening at http://127.0.0.1:${port}`)
})

export default app;