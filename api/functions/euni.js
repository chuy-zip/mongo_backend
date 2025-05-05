import { getDb } from "../mongoClient.js";
import { getLastIdFromCollection } from "./chuy.js";
import { ObjectId } from "mongodb";

export async function updateUserInfo(userId, newUserName, newImg) {
    const db = await getDb();
    const usersCollection = db.collection("users");
  
    const updateFields = {};
    if (newUserName) updateFields.user_name = newUserName;
    if (newImg) updateFields.img = newImg;
  
    const result = await usersCollection.findOneAndUpdate(
      { user_id: userId },
      { $set: updateFields },
      { returnDocument: "after" }
    );
  
    return result.value;
  }
  
//Editar una reseña de un usuario específico
export async function editUserReview(userId, reviewId, newTitle, newComment, newRate) {
    const db = await getDb();
    const reviewsCollection = db.collection("reviews");
  
    // Validar que la reseña pertenece al usuario
    const review = await reviewsCollection.findOne({ review_id: reviewId, user_id: userId });
    if (!review) {
      throw new Error("Review not found or does not belong to user");
    }
  
    const updateFields = {};
    if (newTitle) updateFields.title = newTitle;
    if (newComment) updateFields.comment = newComment;
    if (newRate) updateFields.rate = newRate;
  
    const result = await reviewsCollection.updateOne(
      { review_id: reviewId },
      { $set: updateFields }
    );
  
    return result.modifiedCount > 0;
  }

export async function createOrderReview(user_id, rate, title, comment, reviewed_item_id) {
    const db = await getDb();
    const usersCollection = db.collection('users');
    const reviewsCollection = db.collection('reviews');
  
    //buscar el usuario
    const user = await usersCollection.findOne({ user_id: user_id });
  
    if (!user) {
      throw new Error("User not found");
    }
  
    // buscar la orden dentro del usuario
    const orderExists = user.orders.some(order => 
        order.order_id.toString() === reviewed_item_id
    );
  
    if (!orderExists) {
      throw new Error("Order not found in user's orders");
    }
  
    //obtener el siguiente review_id único
    const lastReviewId = await getLastIdFromCollection("reviews");
    const newReviewId = lastReviewId + 1;
  
    //creacion de la review
    const newReview = {
      review_id: newReviewId,
      user_id,
      type: "order",
      rate,
      title,
      comment,
      reviewed_item_id
    };
  
    const result = await reviewsCollection.insertOne(newReview);
  
    // ingresando review_id al array de reviews del usuario
    await usersCollection.updateOne(
      { user_id: user_id },
      { $push: { reviews: newReviewId } }
    );
  
    return newReview;
}

export async function deleteReview(user_id, review_id) {
    const db = await getDb();
  
    const result = await db.collection('reviews').deleteOne({ review_id: review_id });
  
    if (result.deletedCount === 0) {
      throw new Error('Review not found');
    }
  
    await db.collection('users').updateOne(
      { user_id: user_id },
      { $pull: { reviews: review_id } }
    );
  
    return { message: 'Review deleted successfully' };
}

export async function deleteAllReviewsForUser(user_id) {
    const db = await getDb();
  
    // Obtener la lista de review_ids
    const user = await db.collection('users').findOne({ user_id: user_id });
    if (!user) {
      throw new Error('User not found');
    }
  
    const reviewsToDelete = user.reviews || [];
  
    // Eliminar todas las reseñas
    await db.collection('reviews').deleteMany({ review_id: { $in: reviewsToDelete } });
  
    // Vaciar la lista en el usuario
    await db.collection('users').updateOne(
      { user_id: user_id },
      { $set: { reviews: [] } }
    );
  
    return { message: 'All reviews deleted for user' };
}
  

export async function clearReviewsContent(user_id) {
    const db = await getDb();
  
    // Obtener la lista de review_ids del usuario
    const user = await db.collection('users').findOne({ user_id: user_id });
    if (!user) {
      throw new Error('User not found');
    }
  
    const reviewsToUpdate = user.reviews || [];
  
    // Actualizar todas las reseñas
    await db.collection('reviews').updateMany(
      { review_id: { $in: reviewsToUpdate } },
      { $set: { title: '', comment: '' } }
    );
  
    return { message: 'All reviews content cleared for user' };
}

export async function addDishesToRestaurant(restaurant_id, dishesList) {
  const db = await getDb();

  const restaurant = await db.collection('restaurants').findOne({ restaurant_id: restaurant_id });
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  const createdDishIds = [];

  for (const dish of dishesList) {
    const lastDishId = await getLastIdFromCollection('dishes');
    const newDishId = lastDishId + 1;

    const newDish = {
      dish_id: newDishId,
      name: dish.name,
      description: dish.description,
      price: dish.price,
      img: dish.img
    };

    await db.collection('dishes').insertOne(newDish);
    createdDishIds.push(newDishId);
  }

  await db.collection('restaurants').updateOne(
    { restaurant_id: restaurant_id },
    { $push: { dishes: { $each: createdDishIds } } }
  );

  return { message: 'Dishes added successfully', dish_ids: createdDishIds };
}

export async function getUserReviews(user_id) {
    const db = await getDb();
  
    const reviews = await db.collection('reviews').find({ user_id: user_id }).toArray();
  
    return reviews;
}

export async function getUserReviewsWithRestaurantNames(user_id) {
    const db = await getDb();
  
    const reviews = await db.collection('reviews').find({ user_id: user_id }).toArray();
  
    for (let review of reviews) {
      if (review.type === "restaurant") {
        // buscar el restaurante por su restaurant_id
        const restaurant = await db.collection('restaurants').findOne({ restaurant_id: parseInt(review.reviewed_item_id) });
  
        //si lo encuentra, agregamos el nombre a la review
        if (restaurant) {
          review.restaurant_name = restaurant.restaurant_name;
        } else {
          review.restaurant_name = "Unknown Restaurant";
        }
      }
    }
  
    return reviews;
}