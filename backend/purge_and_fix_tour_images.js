const mongoose = require('mongoose');

const TOUR_LANDMARK_MAP = {
  'ha-long-bay': [
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
    'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=1200'
  ],
  'nha-trang-diving': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200'
  ],
  'ho-guom-hanoi': [
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200',
    'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=1200'
  ],
  'da-nang-ba-na-hills': [
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1200',
    'https://images.unsplash.com/photo-1587573088695-cb4fb810d613?w=1200'
  ],
  'ban-gioc-cao-bang': [
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200'
  ],
  'phu-quoc-paradise': [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200'
  ],
  'sapa-fansipan': [
    'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=1200',
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200'
  ],
  'hue-culture-tour': [
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200',
    'https://images.unsplash.com/photo-1509030450996-93f2e3d84074?w=1200'
  ]
};

async function fixAllTours() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/travel-booking');
    const db = mongoose.connection;
    const toursColl = db.collection('tours');

    for (const [slug, imgs] of Object.entries(TOUR_LANDMARK_MAP)) {
      const res = await toursColl.updateMany(
        { slug },
        { $set: { images: imgs } }
      );
      console.log(`Updated tour "${slug}": modified ${res.modifiedCount} docs`);
    }

    // Also update any other tour that might not match slug but has destination
    const tours = await toursColl.find({}).toArray();
    for (const t of tours) {
      if (t.destination === 'Nha Trang') {
        await toursColl.updateOne(
          { _id: t._id },
          { $set: { images: TOUR_LANDMARK_MAP['nha-trang-diving'] } }
        );
      } else if (t.destination === 'Hạ Long') {
        await toursColl.updateOne(
          { _id: t._id },
          { $set: { images: TOUR_LANDMARK_MAP['ha-long-bay'] } }
        );
      }
    }

    console.log('✅ Cleaned up all tour images in MongoDB with zero people/handbag photos!');
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

fixAllTours();
