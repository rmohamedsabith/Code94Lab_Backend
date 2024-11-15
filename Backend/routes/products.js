const express =require('express')
const { getAll, createProduct, updateProduct, deleteProduct, getOne} = require('../controllers/productController')
const router=express.Router()

const multer=require('multer')
const path=require('path')

const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'uploads/products'));
      },
      filename: function (req, file, cb) {
        const dateSuffix = Date.now(); // Get current timestamp
        const originalName = file.originalname; // Get the original name of the file
        const newName = `${dateSuffix}-${originalName.replace(/\s/g, '_')}`; // Combine timestamp and original name
        cb(null, newName);
      },
    }),
  }); 

router.route('/products').get(getAll)
router.route('/product/:id/delete').delete(deleteProduct)
router.route('/product/:id/edit').put(upload.array('images'),updateProduct)
router.route('/product/:id').get(getOne)
router.route('/product/new').post(upload.array('images'),createProduct)



module.exports=router