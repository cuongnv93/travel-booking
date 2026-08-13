const mongoose = require('mongoose');

async function inspectTours() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/travel-booking');
    const db = mongoose.connection;
    const toursCollection = db.collection('tours');

    const tours = await toursCollection.find({}).toArray();
    console.log(`Found ${tours.length} tours in MongoDB:`);
    tours.forEach((t, i) => {
      console.log(`\n--- [${i+1}] ${t.slug} (${t.destination}) ---`);
      console.log('Title:', JSON.stringify(t.title));
      console.log('Images:', t.images);
    });

    mongoose.disconnect();
  } catch (err) {
    console.error('Error inspecting tours:', err);
  }
}

inspectTours();
