const express =require('express')
const {getAll,addFavorite, removeFavorite } = require('../controllers/favoriteController')
const router=express.Router()

router.route('/favorites').get(getAll)
router.route('/favorites/add').put(addFavorite)
router.route('/favorites/remove').put(removeFavorite)
module.exports=router