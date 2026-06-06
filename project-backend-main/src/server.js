const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');
const db = require('./database');
const config = require('./config');

const PORT = config.port;

db.testConnection().then((connected) => {
  if (connected) {
    app.listen(PORT, () => {
      console.log(`Campus OLX API running on http://localhost:${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } else {
    console.error('Failed to connect to database. Server not started.');
    process.exit(1);
  }
});
