const { v4: uuidv4 } = require('uuid');

function generateBlog() {
  return {
    _id: uuidv4(),
    _type: 'blog',
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString(),
    _rev: Math.random().toString(36).substring(2, 15),
    title: ['Blog Post Title', 'Another Great Article', 'Latest News Update', 'Industry Insights'][Math.floor(Math.random() * 4)],
    slug: {
      _type: 'slug',
      current: `blog-post-${Math.floor(Math.random() * 1000)}`
    },
    author: {
      _type: 'reference',
      _ref: `author-${Math.floor(Math.random() * 1000)}`
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
    body: [] // Simplified for seed
  };
}

// Generate 10 blogs for seeding
const blogs = Array.from({ length: 10 }, generateBlog);
// Output as NDJSON
blogs.forEach(blog => console.log(JSON.stringify(blog)));
