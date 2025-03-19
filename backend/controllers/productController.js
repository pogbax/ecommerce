import Product from '../models/Product.js';
import cloudinary from '../utils/cloudinaryConfig.js';

// Function to handle uploading images to Cloudinary and returning their URLs
async function uploadImages(files) {
    const uploadPromises = files.map(file =>
        cloudinary.uploader.upload(file.path, {
            folder: "product_images"
        })
    );
    const imageResponses = await Promise.all(uploadPromises);
    return imageResponses.map(img => img.secure_url);
}

// Add a new product
const addProduct = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No images provided" });
    }

    try {
        const { name, description, price, category, materials, stock, types, isFeatured, isBest } = req.body;
        const imageUrls = await uploadImages(req.files);

        const newProduct = new Product({
            name,
            description,
            price,
            category,
            mainImage: imageUrls[0],  // Assuming the first image is the main image
            images: imageUrls,
            materials: materials.split(',').map(m => m.trim()),
            stock,
            types: types.split(',').map(type => type.trim()),  // Assuming types are sent as a comma-separated string
            isFeatured,  // New field for featured products
            isBest  // New field for best products
        });

        await newProduct.save();
        res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        console.error("Failed to add product:", error);
        res.status(500).json({ message: "Failed to add product", error: error.message });
    }
};

// Get all products with filter and sort options
const getAllProducts = async (req, res) => {
    const { 
        sort, 
        minPrice, 
        maxPrice, 
        category, 
        types, 
        isFeatured, 
        isBest, 
        keyword, 
        page = 1, 
        limit = 10 
    } = req.query;

    let sortParams = {};
    let filterParams = {};

    // Sorting parameters based on query
    switch (sort) {
        case 'price-asc':
            sortParams.price = 1;
            break;
        case 'price-desc':
            sortParams.price = -1;
            break;
        case 'name-asc':
            sortParams.name = 1;
            break;
        case 'name-desc':
            sortParams.name = -1;
            break;
        default:
            sortParams = {};
    }

    // Filtering parameters based on price range, category, types, and featured/best
    if (minPrice || maxPrice) {
        filterParams.price = {};
        if (minPrice) filterParams.price.$gte = Number(minPrice);
        if (maxPrice) filterParams.price.$lte = Number(maxPrice);
    }

    if (category) {
        filterParams.category = category;
    }

    if (types) {
        filterParams.types = { $in: types.split(',').map(type => type.trim()) };
    }

    if (isFeatured) {
        filterParams.isFeatured = true;
    }

    if (isBest) {
        filterParams.isBest = true;
    }

    // Adding keyword search functionality
    if (keyword) {
        filterParams.$or = [
            { name: { $regex: keyword, $options: "i" } },        // Case-insensitive match in product name
            { description: { $regex: keyword, $options: "i" } } // Case-insensitive match in product description
        ];
    }

    try {
        const skip = (page - 1) * limit;

        // Fetch filtered and sorted products with pagination
        const products = await Product.find(filterParams)
            .sort(sortParams)
            .skip(skip)
            .limit(Number(limit))
            .populate('category', 'name description')  // Populate category details
            .populate({
                path: 'reviews',
                select: 'rating comment user', // Select fields you want to include in reviews
                populate: {
                    path: 'user',
                    select: 'name' // Populate user details in reviews
                }
            });

        // Total products matching the query
        const totalProducts = await Product.countDocuments(filterParams);

        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products,
            pagination: {
                totalProducts,
                currentPage: Number(page),
                totalPages: Math.ceil(totalProducts / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
};

// Edit a product
const editProduct = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const productToUpdate = await Product.findById(id);
        if (!productToUpdate) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Handle image updates
        let imageUrls = productToUpdate.images;
        if (req.files && req.files.length > 0) {
            imageUrls = await uploadImages(req.files);
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, {
            ...updates,
            mainImage: imageUrls[0] || productToUpdate.mainImage,
            images: imageUrls,
            materials: updates.materials ? updates.materials.split(',').map(m => m.trim()) : productToUpdate.materials
        }, { new: true });

        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: "Failed to update product", error: error.message });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
};

// Get product details
const getProductDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id)
            .populate('category')
            .populate({
                path: 'reviews',
                select: 'rating comment user', // Select fields you want to include
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (!product.category) {
            console.warn(`Category not found for product ID ${product._id}`);
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch product details", error: error.message });
    }
};

export { addProduct, getAllProducts, editProduct, deleteProduct, getProductDetail, uploadImages };
