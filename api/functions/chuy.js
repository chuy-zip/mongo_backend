import { parse } from "dotenv";
import { getDb } from "../mongoClient.js";
import { ObjectId } from 'mongodb';

export async function findMovieByTitle(title) {
  const db = await getDb();
  const movies = db.collection("movies");

  const query = { title };
  const options = {
    sort: { "imdb.rating": -1 },
    projection: { _id: 0, title: 1, imdb: 1 },
  };

  return await movies.findOne(query, options);
}

export async function getLastIdFromCollection(collection_name) {

  const id_dictionary = {
    "dishes": "dish_id",
    "orders": "order_id",
    "reviews": "review_id",
    "users": "user_id",
    "restaurants": "restaurant_id"
  };

  const collection_id = id_dictionary[collection_name];

  if (!collection_id) {
    throw new Error(`No ID field mapping found for collection: ${collection_name}`);
  }

  try {
    const db = await getDb();
    const collection = db.collection(collection_name);

    const pipeline = [
      {
        $group: {
          _id: null,
          maxId: { $max: `$${collection_id}` }
        }
      },
      {
        $project: {
          _id: 0,
          maxId: 1
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();

    // If no documents exist or maxId is null or undefined
    if (result.length === 0 || result[0].maxId == null) {
      return 0;
    }

    return result[0].maxId;

  } catch (error) {
    console.error("Failed to get max id: ", error);
    throw error;
  }
}

export async function getUserByUsername(username) {
  try {
    const db = await getDb();
    const users = db.collection("users");
    return await users.findOne({ user_name: username });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
}

export async function getAllRestaurants() {
  try {
    const db = await getDb();
    const restaurants = db.collection("restaurants");
    const cursor = await restaurants.find({});
    return await cursor.toArray();

  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    throw error;
  }
}

export async function getDishesByRestaurantName(restaurant_name) {
  try {
    const db = await getDb();
    const restaurants = db.collection("restaurants");

    const pipeline = [
      {
        '$match': {
          'restaurant_name': restaurant_name
        }
      }, {
        '$lookup': {
          'from': 'dishes',
          'localField': 'dishes',
          'foreignField': 'dish_id',
          'as': 'restaurant_dishes'
        }
      }, {
        '$unwind': '$restaurant_dishes'
      }, {
        '$replaceRoot': {
          'newRoot': '$restaurant_dishes'
        }
      }, {
        '$project': {
          '_id': 0,
          'dish_id': 1,
          'name': 1,
          'description': 1,
          'price': 1,
          'img': 1
        }
      }
    ];

    return await restaurants.aggregate(pipeline).toArray()

  } catch (error) {
    console.error("Failed to fetch restaurant's dishes:", error);
    throw error;
  }
}

export async function createUser(user_data) {
  try {
    const biggestId = await getLastIdFromCollection("users");
    const db = await getDb();
    const users = db.collection("users");

    // this is to make the user_id go first as the rest of the documents :)
    const newUser = {
      user_id: biggestId + 1,
      ...user_data
    };

    await users.insertOne(newUser);
    return newUser;
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
}

export async function createRestaurant(restaurant_data) {
  try {
    const biggestId = await getLastIdFromCollection("restaurants");
    const db = await getDb();
    const restaurants = db.collection("restaurants");

    // this is to make the restaurant_id go first as the rest of the documents :)
    const newRestaurant = {
      restaurant_id: biggestId + 1,
      ...restaurant_data
    };

    await restaurants.insertOne(newRestaurant);

    return newRestaurant;
  } catch (error) {
    console.error("Failed to create restaurant:", error);
    throw error;
  }
}

export async function placeUserOrderByID(user_id, order_data) {
  const db = await getDb();
  const users = db.collection("users");

  const order_id = new ObjectId();

  const orderWithId = {
    order_id, // genrate id
    ...order_data,
  };

  //Push to the user's orders array
  await users.updateOne(
    { user_id: user_id },
    { $push: { orders: orderWithId } }
  );

  return orderWithId;
}

export async function getUserOrders(user_id) {
  try {
    const db = await getDb();
    const users = db.collection("users");

    const int_user_id = parseInt(user_id) 

    const pipeline = [
      {
        '$match': {
          'user_id': int_user_id
        }
      }, {
        '$unwind': '$orders'
      }, {
        '$lookup': {
          'from': 'dishes', 
          'localField': 'orders.dishes.dish_id', 
          'foreignField': 'dish_id', 
          'as': 'orders.dishes'
        }
      }, {
        '$replaceRoot': {
          'newRoot': '$orders'
        }
      }, {
        '$project': {
          '_id': 0, 
          'order_id': 1, 
          'address': 1, 
          'dishes': 1, 
          'state': 1, 
          'date': 1, 
          'total': 1
        }
      }
    ]

    const result = await users.aggregate(pipeline).toArray()
    
    return result

  } catch (error) {
    console.error("Failed to fetch restaurant's dishes:", error);
    throw error;
  }
}
