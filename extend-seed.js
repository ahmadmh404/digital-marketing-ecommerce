const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const seedFilePath = path.join(__dirname, 'seed', 'production-export-2025-03-06t08-03-19-280z', 'data.ndjson');

// Read the existing NDJSON file
const data = fs.readFileSync(seedFilePath, 'utf8');
const lines = data.trim().split('\n').filter(line => line.trim() !== '');

const existingObjects = lines.map(line => {
  try {
    return JSON.parse(line);
  } catch (e) {
    console.error('Error parsing line:', line);
    throw e;
  }
});

// Group by _type
const grouped = {};
existingObjects.forEach(obj => {
  const type = obj._type;
  if (!grouped[type]) {
    grouped[type] = [];
  }
  grouped[type].push(obj);
});

// Define generators for each type
const generators = {
  address: () => ({
    _id: uuidv4(),
    _type: 'address',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    name: ['Home', 'Office', 'Warehouse', 'Store'][Math.floor(Math.random() * 4)],
    email: `user${Math.floor(Math.random() * 1000)}@example.com`,
    address: `${Math.floor(Math.random() * 1000)} ${['Main', 'Oak', 'Maple', 'Pine'][Math.floor(Math.random() * 4)]} St, Apt ${Math.floor(Math.random() * 100)}`,
    city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
    state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
    zip: `${Math.floor(Math.random() * 90000) + 10000}`,
    default: Math.random() > 0.5,
    createdAt: new Date().toISOString()
  }),
  author: () => ({
    _id: uuidv4(),
    _type: 'author',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    name: [`John Doe`, `Jane Smith`, `Bob Johnson`, `Alice Brown`][Math.floor(Math.random() * 4)],
    slug: {
      _type: 'slug',
      current: `author-${Math.floor(Math.random() * 1000)}`
    },
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: `image-${Math.floor(Math.random() * 1000)}` // This is a placeholder; in reality, we should reference an existing asset
      }
    }
  }),
  banner: () => ({
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
    title: [`Product Sale`, `Special Offer`, `Limited Time Deal`, `Exclusive Discount`][Math.floor(Math.random() * 4)]
  }),
  blog: () => ({
    _id: uuidv4(),
    _type: 'blog',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    title: [`Blog Post Title`, `Another Great Article`, `Latest News Update`, `Industry Insights`][Math.floor(Math.random() * 4)],
    slug: {
      _type: 'slug',
      current: `blog-post-${Math.floor(Math.random() * 1000)}`
    },
    author: {
      _type: 'reference',
      _ref: `author-${Math.floor(Math.random() * 1000)}` // This should reference an existing author, but for seed we can use a placeholder
    },
    mainImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: `image-${Math.floor(Math.random() * 1000)}`
      }
    },
    blogcategories: [
      {
        _key: Math.random().toString(36).substring(2, 10),
        _type: 'reference',
        _ref: `blogcategory-${Math.floor(Math.random() * 1000)}`
      }
    ],
    publishedAt: new Date().toISOString(),
    isLatest: Math.random() > 0.5,
    body: [] // Simplified for seed; in reality, this is portable text
  }),
  blogcategory: () => ({
    _id: uuidv4(),
    _type: 'blogcategory',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    title: [`Technology`, `Lifestyle`, `Business`, `Health`, `Travel`][Math.floor(Math.random() * 5)],
    slug: {
      _type: 'slug',
      current: `category-${Math.floor(Math.random() * 1000)}`
    },
    description: 'Description for the blog category.'
  }),
  brand: () => ({
    _id: uuidv4(),
    _type: 'brand',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    title: [`Brand A`, `Brand B`, `Brand C`, `Brand D`][Math.floor(Math.random() * 4)],
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
  }),
  category: () => ({
    _id: uuidv4(),
    _type: 'category',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    title: [`Electronics`, `Clothing`, `Home & Garden`, `Books`, `Toys`][Math.floor(Math.random() * 5)],
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
  }),
  order: () => ({
    _id: uuidv4(),
    _type: 'order',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    orderNumber: `ORD-${Math.floor(Math.random() * 1000000)}`,
    invoice: {
      id: `INV-${Math.floor(Math.random() * 1000000)}`,
      number: `INV-${Math.floor(Math.random() * 1000000)}`,
      hosted_invoice_url: `https://example.com/invoice/${Math.floor(Math.random() * 1000000)}`
    },
    stripeCheckoutSessionId: `cs_test_${Math.random().toString(36).substring(2, 16)}`,
    stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 16)}`,
    clerkUserId: `user_${Math.random().toString(36).substring(2, 16)}`,
    customerName: [`John Doe`, `Jane Smith`, `Bob Johnson`][Math.floor(Math.random() * 3)],
    email: `customer${Math.floor(Math.random() * 1000)}@example.com`,
    stripePaymentIntentId: `pi_${Math.random().toString(36).substring(2, 16)}`,
    products: [
      {
        product: {
          _type: 'reference',
          _ref: `product-${Math.floor(Math.random() * 1000)}`
        },
        quantity: Math.floor(Math.random() * 10) + 1,
        _key: Math.random().toString(36).substring(2, 10)
      }
    ],
    totalPrice: parseFloat((Math.random() * 1000).toFixed(2)),
    currency: 'USD',
    amountDiscount: parseFloat((Math.random() * 100).toFixed(2)),
    address: {
      state: ['NY', 'CA', 'TX', 'FL'][Math.floor(Math.random() * 4)],
      zip: `${Math.floor(Math.random() * 90000) + 10000}`,
      city: ['New York', 'Los Angeles', 'Chicago', 'Houston'][Math.floor(Math.random() * 4)],
      address: `${Math.floor(Math.random() * 1000)} Main St`,
      name: [`John Doe`, `Jane Smith`][Math.floor(Math.random() * 2)]
    },
    status: ['pending', 'processing', 'paid', 'shipped', 'delivered'][Math.floor(Math.random() * 5)],
    orderDate: new Date().toISOString()
  }),
  product: () => ({
    _id: uuidv4(),
    _type: 'product',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    name: [`Product A`, `Product B`, `Product C`, `Product D`][Math.floor(Math.random() * 4)],
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
  })
};

// Generate 3 new objects for each type
const newObjects = [];
Object.keys(generators).forEach(type => {
  for (let i = 0; i < 3; i++) {
    const obj = generators[type]();
    newObjects.push(obj);
  }
});

// Append the new objects to the file
const newDataLines = newObjects.map(obj => JSON.stringify(obj));
fs.appendFileSync(seedFilePath, '\n' + newDataLines.join('\n') + '\n');

console.log(`Added ${newObjects.length} new objects to ${seedFilePath}`);
