const express = require('express');
const path = require('path');
const cors = require('cors');
const UserModel = require('./models/userModel');
const CategoryModel = require('./models/categoryModel');
const ItemModel = require('./models/itemModel');
const CartModel = require('./models/cartModel');
const OrderModel = require('./models/orderModel');
const ActivityLogModel = require('./models/activityLogModel');
const { activityLogMiddleware } = require('./middleware/activityLogMiddleware');

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(activityLogMiddleware);

(async () => {
  try {
    await UserModel.initTable();
    await CategoryModel.initTable();
    await ItemModel.initTable();
    await CartModel.initTable();
    await OrderModel.initTable();
    await ActivityLogModel.initTable();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
})();

app.get('/health', (req, res) => res.json({ success: true, message: 'Server is running' }));
app.get('/api/v1/health', (req, res) =>
  res.json({
    success: true,
    message: 'Campus OLX API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
);

app.use('/api/v1/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/v1', require('./routes'));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
