const { v4: uuidv4 } = require('uuid');

function generateAddress() {
  return {
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
  };
}

// Generate 10 addresses for seeding
const addresses = Array.from({ length: 10 }, generateAddress);
// Output as NDJSON
addresses.forEach(addr => console.log(JSON.stringify(addr)));
