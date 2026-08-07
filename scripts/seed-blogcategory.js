const { v4: uuidv4 } = require('uuid');

function generateBlogcategory() {
  return {
    _id: uuidv4(),
    _type: 'blogcategory',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    title: ['Technology', 'Lifestyle', 'Business', 'Health', 'Travel'][Math.floor(Math.random() * 5)],
    slug: {
      _type: 'slug',
      current: `category-${Math.floor(Math.random() * 1000)}`
    },
    description: 'Description for the blog category.'
  };
}

// Generate 10 blogcategories for seeding
const blogcategories = Array.from({ length: 10 }, generateBlogcategory);
// Output as NDJSON
blogcategories.forEach(bc => console.log(JSON.stringify(bc)));
