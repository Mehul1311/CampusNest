const CategoryModel = require('../models/categoryModel');

const CategoryController = {
  async getAll(req, res) {
    try {
      const categories = await CategoryModel.getAll();
      return res.status(200).json({ success: true, data: { categories } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async create(req, res) {
    try {
      const category = await CategoryModel.create(req.body);
      return res.status(201).json({ success: true, data: { category } });
    } catch (error) {
      if (error.code === '23505') {
        return res.status(400).json({ success: false, error: 'Category with this name/slug already exists' });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async getById(req, res) {
    try {
      const category = await CategoryModel.getById(req.params.id);
      if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
      return res.status(200).json({ success: true, data: { category } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async update(req, res) {
    try {
      const category = await CategoryModel.update(req.params.id, req.body);
      if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
      return res.status(200).json({ success: true, data: { category } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await CategoryModel.delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Category not found' });
      return res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  },
};

module.exports = CategoryController;
