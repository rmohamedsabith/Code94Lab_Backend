const mongoose = require('mongoose');

const favoritesSchema = new mongoose.Schema({
    favoriteProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]  // Array of product IDs
});

module.exports = mongoose.model('Favorites', favoritesSchema);
