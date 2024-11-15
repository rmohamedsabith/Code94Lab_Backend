const product =require('../models/productModel')
const asyncHandler=require('express-async-handler')
const apiFeatures = require('../util/apiFeatures')
const fs=require('fs').promises
const path=require('path')

//fetch all Data -> /product
const getAll=asyncHandler(async(req,res)=>{
    const resultperpage=8;
    const apifeature=new apiFeatures(product.find(),req.query)
      apifeature.search();
      apifeature.paginate(resultperpage);   
    const Products=await apifeature.query
    const totalProductCount=await product.countDocuments();
    if(!Products)
    {
        return res.status(400).json({message:"There are no Products"})
    }
    res.status(200).json(
        {
            Success:true,
            Total_count:totalProductCount,
            count:Products.length,
            resPerPage:resultperpage,
            Products

        })
})
//create a new product  -> /product/new
const createProduct = asyncHandler(async (req, res) => {      
    const { name, thumbnailIndex } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Product name is required' });
    }

    const upperCaseName = name.toUpperCase();
    const duplicate = await product.findOne({ name: upperCaseName }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate product name' });
    }

    let images = [];
    let thumbnail = null;

    if (req.files && req.files.length > 0) {

        images = req.files.map((file, index) => {
            const imageUrl = `${process.env.BACK_END_URL}/uploads/products/${file.filename}`;
            // Set thumbnail based on the provided index or default to the first image
            if (index === parseInt(thumbnailIndex, 10) || (!thumbnailIndex && index === 0)) {
                thumbnail = imageUrl;
            }
            return { image: imageUrl };
        });
    }

    const newProduct = {
        SKU:req.body.SKU,
        name: upperCaseName,
        images: images,
        thumbnail: thumbnail,
        description: req.body.description,
        quantity: req.body.quantity,
        price:req.body.price
    };

    try {
        const Product = await product.create(newProduct);
        if (!Product) {
            return res.status(400).json({ message: 'Product creation failed' });
        }
        
        res.status(201).json({
            success: true,
            Product
        });
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//update a product  -> /product/:id/edit
// const updateProduct=asyncHandler(async(req,res)=>{
//     try {
//         //find data
//         const Product=await product.findOne({_id:req.params.id}).exec()
//         if(!Product)
//         {
//             return res.status(400).json({message:"There are no product to update"})
//         }
//         if(req.body.name)
//         {
//                 // Check for duplicate 
//             const duplicate = await product.findOne({ name:req.body.name}).lean().exec()

//             // Allow updates to the original user 
//             if (duplicate && duplicate?._id.toString() !== req.params.id) {
//                 return res.status(409).json({ message: 'Duplicate username' })
//             }
//         }
//          const oldImages=Product.images;
//          let images=[];
//          /* req.images.forEach(item => {
//             if (typeof item === 'string') {
//                 images.push(item);
//             }
//           }); */
//             if(req.files?.length>0)
//             {
//                 req.files.forEach(file=>{
//                     let url=`${process.env.BACK_END_URL}/uploads/products/${file.filename}`
//                     images.push({image:url})
//                 })
//                 req.body.images=images; 
//             }
                   
//         const data =await product.findByIdAndUpdate(req.params.id,req.body,{
//             new:true,
//             runValidators:true
//          })
       
//         // delete the stored image if the new image is different
//         if (oldImages && req.body.images) {
//             oldImages.forEach(async image=>{
//                 const oldImageFilename = path.basename(new URL(image.image).pathname);
//                 console.log(oldImageFilename)
//                 const oldImageFilePath = path.join(__dirname,'..','uploads', 'products', oldImageFilename);
//                 // Check if the file exists before attempting to delete
//                 try {
//                   await fs.access(oldImageFilePath);
//                   // Delete the old file
//                   await fs.unlink(oldImageFilePath);
//                 } catch (error) {
//                   console.error('Error deleting old image image:', error.message);
//                 }
//             })
            
//         }

//         res.status(200).json({
//             success:true,
//             Product:data
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(400).json({
//             success:false,
//             message:error.message,
//           })
//     }
// })
const updateProduct = asyncHandler(async (req, res) => {
    try {
      const Product = await product.findOne({ _id: req.params.id }).exec();
      if (!Product) {
        return res.status(400).json({ message: "No product to update" });
      }
  
      const upperCaseName = req.body.name.toUpperCase();       
    const duplicate = await product.findOne({ name: upperCaseName }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== req.params.id) {
        return res.status(409).json({ message: 'Duplicate product name' });
    }
     
  
      const oldImages = Product.images;
      let images = [];
      let thumbnail = null;
      if (req.files && req.files.length > 0) {
  
          images = req.files.map((file, index) => {
              const imageUrl = `${process.env.BACK_END_URL}/uploads/products/${file.filename}`;
              // Set thumbnail based on the provided index or default to the first image
              if (index === parseInt(req.body.thumbnailIndex, 10) || (!req.body.thumbnailIndex && index === 0)) {
                  thumbnail = imageUrl;
              }
              return { image: imageUrl };
          });
      }
  
      const newProduct = {
          SKU:req.body.SKU,
          name: upperCaseName,
          images: images,
          thumbnail: thumbnail,
          description: req.body.description,
          quantity: req.body.quantity,
          price:req.body.price
      };
  
      const data = await product.findByIdAndUpdate(req.params.id, newProduct, {
        new: true,
        runValidators: true,
      });
  
      if (oldImages && req.body.images) {
        await Promise.all(
          oldImages.map(async (image) => {
            const oldImageFilename = path.basename(new URL(image.image).pathname);
            const oldImageFilePath = path.join(__dirname, '..', 'uploads', 'products', oldImageFilename);
  
            try {
              await fs.access(oldImageFilePath);
              await fs.unlink(oldImageFilePath);
            } catch (error) {
              console.error('Error deleting old image:', error.message);
            }
          })
        );
      }
  
      res.status(200).json({
        success: true,
        Product: data,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  });
  
//Delete a product  -> /product/:id/delete
const deleteProduct=asyncHandler(async(req,res)=>{
    const Product=await product.findOne({_id:req.params.id}).exec()
    if(!Product)
    {
        return res.status(400).json({message:"There are no product to delete"})
    }
    const oldImages=Product.images;
    
    const deletedData=await Product.deleteOne()
    // delete the stored image if the new image is different
    if (oldImages) {
        oldImages.forEach(async image=>{
            const oldImageFilename = path.basename(new URL(image.image).pathname);
            console.log(oldImageFilename)
            const oldImageFilePath = path.join(__dirname,'..','uploads', 'products', oldImageFilename);
            // Check if the file exists before attempting to delete
            try {
              await fs.access(oldImageFilePath);
              // Delete the old file
              await fs.unlink(oldImageFilePath);
            } catch (error) {
              console.error('Error deleting old image image:', error.message);
            }
        })
        
    }
    
    
    res.status(200).json(deletedData)
})
//get one product  -> /product/:id
const getOne=asyncHandler(async(req,res)=>{
    const Product=await product.findOne({_id:req.params.id}).exec()
    if(!Product)
    {
        return res.status(400).json({message:"There are no product to find"})
    }
    res.status(200).json({
        success:true,
        product:Product
    })
})





module.exports={
    getAll,
    createProduct,
    updateProduct,
    deleteProduct,
    getOne,
}
