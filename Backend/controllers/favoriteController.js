const Favorites =require('../models/favoriteModel')
const asyncHandler=require('express-async-handler')

const getAll=asyncHandler(async (req, res) => {
    try {
        const favorites = await Favorites.findOne({}).populate('favoriteProductIds');
        res.status(200).json({
            success: true,
            favorites
        });
        
       
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve favorites' });
    }
})

const addFavorite= asyncHandler(async (req, res) => {
    const { id } = req.body;  

    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    try {
        // Find or create the document and push the new favorite product ID into the array
        const favorites = await Favorites.findOneAndUpdate(
            {}, 
            { $addToSet: { favoriteProductIds: id } },  
            { new: true, upsert: true } 
        ).populate('favoriteProductIds');

        res.status(200).json({
            success: true,
            favorites
        });
    } catch (error) {
        console.error(error);  // Log the actual error for more details
        res.status(500).json({ message: 'Failed to update favorites', error: error.message });
    }
});

const removeFavorite= asyncHandler(async (req, res) => {
    const { id } = req.body;  

    if (!id) {
        return res.status(400).json({ message: 'ID is required' });
    }

    try {
        // Find or create the document and push the new favorite product ID into the array
        const favorites = await Favorites.findOneAndUpdate(
            {}, 
            { $pull: { favoriteProductIds: id } },  // Use $pull to remove the product ID from the array
            { new: true }  // Return the updated document
        ).populate('favoriteProductIds');

        res.status(200).json({
            success: true,
            favorites
        });
    } catch (error) {
        console.error(error);  // Log the actual error for more details
        res.status(500).json({ message: 'Failed to update favorites', error: error.message });
    }
});


module.exports={
    getAll,
    addFavorite,
    removeFavorite
}