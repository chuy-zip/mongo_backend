import express from 'express';
import { findMovieByTitle, getUserByUsername, getAllRestaurants, getDishesByRestaurantName, getLastIdFromCollection } from './functions/chuy.js';
import cors from 'cors'

const test = ""
const port = 3000

const app = express();

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Base url test!' });
});

app.get('/api/movies/:title', async (req, res) => {

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

app.get('/api/test/getMaxId/:collection_name', async (req, res) => {

    const { collection_name } = req.params

    try {
        
        const max_id = await getLastIdFromCollection(collection_name)

        if(!max_id){
            return res.status(400).send(`No max id was found for collection: ${collection_name}`);
        } else {
            return res.status(200).json(max_id)
        }

    } catch (error) {
        res.status(500).send('Server error');
    }
    
})

app.get('/api/user/:username', async (req, res) => {

    const { username } = req.params
    
    try {
        const user = await getUserByUsername(username)

        if(!user) {
            return res.status(404).send('User not found')
        } else {
            res.status(200).json(user)
        }
    } catch (error) {
        res.status(500).send('Server error');
    }
})

app.get('/api/restaurants', async (req, res) => {

    try {
        const restaurants = await getAllRestaurants()

        if(!restaurants){
            return res.status(400).send('No restaurants were found')
        } else {
            return res.status(200).json(restaurants)
        }
                
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
    }
})

app.get('/api/restaurants/dishes/:restaurant_name', async (req, res) => {

    const { restaurant_name } =  req.params

    try {
        const restaurant_dishes = await getDishesByRestaurantName(restaurant_name)

        if(!restaurant_dishes){
            return res.status(400).send('No dishes were found for the restaurant')
        } else {
            return res.status(200).json(restaurant_dishes)
        }
                
    } catch (error) {
        console.error(error)
        res.status(500).send('Server error')
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