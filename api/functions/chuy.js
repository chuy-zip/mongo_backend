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