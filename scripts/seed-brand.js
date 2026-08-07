const { v4: uuidv4 } = require('uuid');

function generateBrand() {
  return {
    _id: uuidv4(),
    _type: 'brand',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    title: ['Brand A', 'Brand B', 'Brand C', 'Brand D'][Math.floor(Math.random() * 4)],
    slug: {
      _type: 'slug',
      current: `brand-${Math.floor(Math.random() * 1000)}`
    },
    description: 'Description for the brand.',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: `image-${Math.floor(Math.random() * 1000)}`
      }
    }
  };
}

// Generate 10 brands for seeding
const brands = Array.from({ length: 10 }, generateBrand);
// Output as NDJSON
brands.forEach(brand => console.log(JSON.stringify(brand)));
