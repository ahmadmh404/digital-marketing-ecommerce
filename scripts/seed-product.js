const { v4: uuidv4 } = require('uuid');

function generateProduct() {
  return {
    _id: uuidv4(),
    _type: 'product',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    name: ['Product A', 'Product B', 'Product C', 'Product D'][Math.floor(Math.random() * 4)],
    slug: {
      _type: 'slug',
      current: `product-${Math.floor(Math.random() * 1000)}`
    },
    images: [
      {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: `image-${Math.floor(Math.random() * 1000)}`
        },
        _key: Math.random().toString(36).substring(2, 10)
      }
    ],
    description: 'This is a sample product description.',
    price: parseFloat((Math.random() * 100).toFixed(2)),
    discount: Math.floor(Math.random() * 50),
    categories: [
      {
        _type: 'reference',
        _ref: `category-${Math.floor(Math.random() * 1000)}`,
        _key: Math.random().toString(36).substring(2, 10)
      }
    ],
    stock: Math.floor(Math.random() * 100),
    brand: {
      _type: 'reference',
      _ref: `brand-${Math.floor(Math.random() * 1000)}`
    },
    status: ['new', 'hot', 'sale'][Math.floor(Math.random() * 3)],
    variant: ['gadget', 'appliances', 'refrigerators', 'others'][Math.floor(Math.random() * 4)],
    isFeatured: Math.random() > 0.5
  };
}

// Generate 10 products for seeding
const products = Array.from({ length: 10 }, generateProduct);
// Output as NDJSON
products.forEach(product => console.log(JSON.stringify(product)));
