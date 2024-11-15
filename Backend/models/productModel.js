const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    SKU: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: [true, "Please enter the product name"],
        trim: true,
        maxLength: [100, "Product name cannot exceed 100 characters"],
    },
    thumbnail: {
        type: String,
        required: [true, "Please select a thumbnail image"],
    },
    images:[
        {
            image:{
                type:String,
                require:true
            }
        }
    ],
    description: {
        type: String,
        required: [true, "Please enter product description"],
    },
    quantity: {
        type: Number,
        required: [true, "Please enter the product quantity"],
        min: [0, "Quantity cannot be less than 0"],
    },
    price:{
        type:String,
        required:[true,"Please enter the product price"],   
    }
}, {
    timestamps: true,
});

async function generateSKU() {
    // Find the most recent product based on creation time or SKU sorting
    const lastProduct = await mongoose.model('Product').findOne().sort({ SKU: -1 });

    if (!lastProduct) {
        return 'CA1'; // If no products exist, return 'CA1'
    }

    // Extract the numeric part of the last SKU (assuming it's in format "CA1", "CA2", etc.)
    const lastSKU = lastProduct.SKU;
    const numericPart = parseInt(lastSKU.slice(2), 10);

    // Increment the SKU by 1
    const newNumericPart = numericPart + 1;

    // Return the new SKU
    return `CA${newNumericPart}`;
}


productSchema.pre('save', async function (next) {
    this.name = this.name.toUpperCase();
    if (!this.SKU) {
        // If SKU is not set (i.e., for a new product), generate a new SKU
        this.SKU = await generateSKU();
    }
   
    next();
});

module.exports = mongoose.model('Product', productSchema);
