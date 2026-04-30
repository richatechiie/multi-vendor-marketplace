require('dotenv').config();
require('./config/database');

const app  = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n Marketplace API running on port ${PORT}`);
  console.log(`Health check → http://localhost:${PORT}/health`);
  console.log(`Auth         → http://localhost:${PORT}/api/auth`);
  console.log(`Products     → http://localhost:${PORT}/api/products`);
  console.log(`Vendor       → http://localhost:${PORT}/api/vendor`);
  console.log(`Orders       → http://localhost:${PORT}/api/orders`);
  console.log(`Admin        → http://localhost:${PORT}/api/admin`);
  console.log(`Categories   → http://localhost:${PORT}/api/categories\n`);
});
