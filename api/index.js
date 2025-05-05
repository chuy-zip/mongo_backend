import express from 'express';
import { findMovieByTitle, getUserByUsername, getAllRestaurants, getDishesByRestaurantName, getLastIdFromCollection, createUser, createRestaurant, placeUserOrderByID, getUserOrders, createRestaurantReview, getRestaurantsReviewsByID } from './functions/chuy.js';
import { addDishesToRestaurant, clearReviewsContent, createOrderReview, deleteReview, editUserReview, getUserReviews, getUserReviewsWithRestaurantNames, updateUserInfo } from './functions/euni.js';
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
            return res.status(400).send(`No max id was found for collection: ${collection_name}. Max_id is ${max_id}`);
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

app.post('/api/user', async (req, res) => {
    const user_data = req.body;

    // Validate required fields
    if (!user_data.user_name || !user_data.password || user_data.admin === undefined) {
        return res.status(400).send('Missing required fields: user_name, password, admin');
    }

    // Validate admin is 0 or 1
    if (user_data.admin !== 0 && user_data.admin !== 1) {
        return res.status(400).send('admin must be 0 (non-admin) or 1 (admin)');
    }

    // Validate address is an array (if provided)
    if (user_data.address && !Array.isArray(user_data.address)) {
        return res.status(400).send('address must be an array');
    }

    try {
        const user = await createUser(user_data);
        if (!user) {
            return res.status(500).send('User creation failed');
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Server error');
    }
});

app.post('/api/user/order', async (req, res) => {
    const order_data = req.body;

    if(!order_data.user_id || !order_data.order){
        return res.status(400).send('Missing required fields: user_id, order')
    }

    try {
        const order_placed = await placeUserOrderByID(order_data.user_id, order_data.order)

        if(!order_placed){
            return res.status(400).send('Order could not be placed for the user')
        }

        return res.status(200).send(order_placed)
    } catch (error) {
        console.error('Error placing user order:', error);
        res.status(500).send('Server error');
    }
})

app.get('/api/user/orders/:user_id', async (req, res) => {
    const { user_id } = req.params;

    if(!user_id){
        return res.status(400).send('Missing required parameter: user_id')
    }

    try {
        const user_orders = await getUserOrders(user_id)

        if(!user_orders){
            return res.status(400).send('Could not get user orders')
        }

        return res.status(200).send(user_orders)
    } catch (error) {
        console.error('Error getting user orders:', error);
        res.status(500).send('Server error');
    }
})

app.post('/api/user/review_restaurant', async (req, res) => {
    const review_data = req.body;

    // eval body
    if (!review_data.user_id || !review_data.type || !review_data.rate || 
        !review_data.title || !review_data.comment || !review_data.reviewed_item_id) {
        return res.status(400).json('Missing required elements in body');
    }

    // restaurant review validation
    if (review_data.type !== "restaurant") {
        return res.status(400).json('Review type must be "restaurant"');
    }

    // ratin 1-5
    if (review_data.rate < 1 || review_data.rate > 5) {
        return res.status(400).json('Rating must be between 1 and 5');
    }

    try {
        
        const created_review = await createRestaurantReview(review_data)

        if(!created_review){
            return res.status(400).json("Could not create review");
        }

        return res.status(201).json(created_review);
    } catch (error) {
        console.error('Error creating user review:', error);
        res.status(500).send('Server error');
    }

    
})

app.post('/api/restaurant', async (req, res) => {
    const restaurant_data = req.body;

    // Validate required fields
    if (!restaurant_data.restaurant_name || !restaurant_data.address || !restaurant_data.coords) {
        return res.status(400).send('Missing required fields: restaurant_name, address, coords');
    }

    // Validate coords is [number, number]
    if (
        !Array.isArray(restaurant_data.coords) ||
        restaurant_data.coords.length !== 2 ||
        typeof restaurant_data.coords[0] !== 'number' ||
        typeof restaurant_data.coords[1] !== 'number'
    ) {
        return res.status(400).send('coords must be an array of 2 numbers: [latitude, longitude]');
    }

    if (restaurant_data.dishes && !Array.isArray(restaurant_data.dishes)) {
        return res.status(400).send('dishes must be an array');
    }

    try {
        const restaurant = await createRestaurant(restaurant_data);
        if (!restaurant) {
            return res.status(500).send('Restaurant creation failed');
        }
        res.status(200).json(restaurant);
    } catch (error) {
        console.error('Error creating restaurant:', error);
        res.status(500).send('Server error');
    }
});

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

app.get('/api/restaurant/reviews/:restaurant_id', async (req, res) => {

    const { restaurant_id } = req.params
    try {
        const restaurant_reviews = await getRestaurantsReviewsByID(restaurant_id)

        if(!restaurant_reviews){
            return res.status(400).send('Error getting reviews')
        } else {
            return res.status(200).json(restaurant_reviews)
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

// update user info
app.put('/api/users/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const { user_name, img } = req.body;
  
    try {
      const updatedUser = await updateUserInfo(userId, user_name, img);
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
});

// editar reseña de un usuario
app.put('/api/reviews/:reviewId', async (req, res) => {
    const reviewId = parseInt(req.params.reviewId);
    const { user_id, title, comment, rate } = req.body;
  
    if (!user_id) {
      return res.status(400).send('User ID is required');
    }
  
    try {
      const updated = await editUserReview(user_id, reviewId, title, comment, rate);
      if (updated) {
        res.status(200).send('Review updated');
      } else {
        res.status(404).send('Review not found or not updated');
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
});

app.post('/api/reviews/order', async (req, res) => {
    const { user_id, rate, title, comment, reviewed_item_id } = req.body;
  
    // Validación
    if (!user_id || !rate || !title || !comment || !reviewed_item_id) {
      return res.status(400).send('Missing fields');
    }
  
    try {
      const review = await createOrderReview(user_id, rate, title, comment, reviewed_item_id);
      res.status(201).json(review);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
});

app.delete('/api/reviews/:user_id/:review_id', async (req, res) => {
    const user_id = parseInt(req.params.user_id);
    const review_id = parseInt(req.params.review_id);
  
    try {
      const result = await deleteReview(user_id, review_id);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
});

app.delete('/api/reviews/all/:user_id', async (req, res) => {
    const user_id = parseInt(req.params.user_id);
  
    try {
      const result = await deleteAllReviewsForUser(user_id);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
});

app.put('/api/reviews/clear/:user_id', async (req, res) => {
    const user_id = parseInt(req.params.user_id);
  
    try {
      const result = await clearReviewsContent(user_id);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
});
  
app.post('/api/restaurants/:restaurant_id/dishes', async (req, res) => {
    const restaurant_id = parseInt(req.params.restaurant_id);
    const dishesList = req.body.dishes;
  
    if (!Array.isArray(dishesList) || dishesList.length === 0) {
      return res.status(400).send('You must provide an array of dishes');
    }
  
    try {
      const result = await addDishesToRestaurant(restaurant_id, dishesList);
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
});
  
app.get('/api/users/:user_id/reviews', async (req, res) => {
    const user_id = parseInt(req.params.user_id);
  
    try {
      const reviews = await getUserReviewsWithRestaurantNames(user_id);
  
      if (reviews.length === 0) {
        return res.status(404).send('No reviews found for this user');
      }
  
      res.json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });

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