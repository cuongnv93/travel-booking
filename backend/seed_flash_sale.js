const mongoose = require('mongoose');

async function seedFlashSale() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/travel-booking');
    const db = mongoose.connection;

    const futureDate = new Date(Date.now() + 48 * 3600 * 1000); // 48 hours from now

    // 1. Update 2 Tours
    const toursCollection = db.collection('tours');
    const tours = await toursCollection.find({}).limit(2).toArray();

    if (tours.length > 0) {
      await toursCollection.updateOne(
        { _id: tours[0]._id },
        {
          $set: {
            isFlashSale: true,
            flashSalePrice: Math.round((tours[0].price || 2000000) * 0.55),
            flashSaleEnd: futureDate
          }
        }
      );
      console.log('Updated Tour 1 for Flash Sale:', tours[0].slug);
    }

    if (tours.length > 1) {
      await toursCollection.updateOne(
        { _id: tours[1]._id },
        {
          $set: {
            isFlashSale: true,
            flashSalePrice: Math.round((tours[1].price || 1500000) * 0.6),
            flashSaleEnd: futureDate
          }
        }
      );
      console.log('Updated Tour 2 for Flash Sale:', tours[1].slug);
    }

    // 2. Update 1 Hotel
    const hotelsCollection = db.collection('hotels');
    const hotels = await hotelsCollection.find({}).limit(1).toArray();

    if (hotels.length > 0) {
      await hotelsCollection.updateOne(
        { _id: hotels[0]._id },
        {
          $set: {
            isFlashSale: true,
            flashSalePrice: Math.round((hotels[0].pricePerNight || 1500000) * 0.5),
            flashSaleEnd: futureDate
          }
        }
      );
      console.log('Updated Hotel 1 for Flash Sale:', hotels[0].slug);
    }

    console.log('✅ Successfully seeded Flash Sale items into MongoDB!');
    mongoose.disconnect();
  } catch (err) {
    console.error('Flash Sale Seed error:', err);
  }
}

seedFlashSale();
