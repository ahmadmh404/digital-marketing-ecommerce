const { v4: uuidv4 } = require('uuid');

function generateCategory() {
  return {
    _id: uuidv4(),
    _type: 'category',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    title: ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Toys'][Math.floor(Math.random() * 5)],
    slug: {
      _type: 'slug',
      current: `category-${Math.floor(Math.random() * 1000)}`
    },
    description: 'Description for the category.',
    range: Math.floor(Math.random() * 100) + 1,
    featured: Math.random() > 0.5,
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: `image-${Math.floor(Math.random() * 1000)}`
      }
    }
  };
}

// Generate 10 categories for seeding
const categories = Array.from({ length: 10 }, generateCategory);
// Output as NDJSON
categories.forEach(category => console.log(JSON.stringify(category)));
