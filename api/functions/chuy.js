import { getDb } from "../mongoClient.js";

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