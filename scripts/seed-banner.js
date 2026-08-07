const { v4: uuidv4 } = require('uuid');

function generateBanner() {
  return {
    _id: uuidv4(),
    _type: 'banner',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    banner: ['New Year Offer', 'Summer Sale', 'Winter Clearance', 'Spring Deal'][Math.floor(Math.random() * 4)],
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
    discountAmount: Math.floor(Math.random() * 20) + 5,
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: `image-${Math.floor(Math.random() * 1000)}`
      }
    },
    title: ['Product Sale', 'Special Offer', 'Limited Time Deal', 'Exclusive Discount'][Math.floor(Math.random() * 4)]
  };
}

// Generate 10 banners for seeding
const banners = Array.from({ length: 10 }, generateBanner);
// Output as NDJSON
banners.forEach(banner => console.log(JSON.stringify(banner)));
