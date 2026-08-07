const { v4: uuidv4 } = require('uuid');

function generateAuthor() {
  return {
    _id: uuidv4(),
    _type: 'author',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    name: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'][Math.floor(Math.random() * 4)],
    slug: {
      _type: 'slug',
      current: `author-${Math.floor(Math.random() * 1000)}`
    },
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: `image-${Math.floor(Math.random() * 1000)}` // Placeholder for an asset reference
      }
    }
  };
}

// Generate 10 authors for seeding
const authors = Array.from({ length: 10 }, generateAuthor);
// Output as NDJSON
authors.forEach(author => console.log(JSON.stringify(author)));
