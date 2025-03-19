import Feature from '../models/feature.js';
import cloudinary from '../utils/cloudinaryConfig.js';

// Get all feature images
const getFeatures = async (req, res) => {
    try {
        const features = await Feature.find({});
        res.status(200).json(features);
    } catch (error) {
        res.status(500).json({ message: "Error fetching features", error: error.message });
    }
};

// Add new feature images
const addFeature = async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No image files provided" });
    }
    try {
        const imageUploadPromises = req.files.map(file =>
            cloudinary.uploader.upload(file.path, {
                folder: "feature_images"  // Optional: specify a folder in Cloudinary
            })
        );
        const imageResponses = await Promise.all(imageUploadPromises);
        const imageUrls = imageResponses.map(img => img.secure_url);

        const newFeature = new Feature({ images: imageUrls });
        await newFeature.save();
        res.status(201).json(newFeature);
    } catch (error) {
        res.status(500).json({ message: "Error adding feature", error: error.message });
    }
};

// Update an existing feature image
const updateFeature = async (req, res) => {
    const { featureId } = req.params;
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
    }
    try {
        // Update only the relevant feature image
        const result = await cloudinary.uploader.upload(req.file.path);
        const updatedFeature = await Feature.findByIdAndUpdate(
            featureId,
            { $push: { images: result.secure_url } }, // Add image to images array
            { new: true }
        );
        if (!updatedFeature) {
            return res.status(404).json({ message: "Feature not found" });
        }
        res.json(updatedFeature);
    } catch (error) {
        res.status(500).json({ message: "Error updating feature", error: error.message });
    }
};

// Delete a feature image
const deleteFeature = async (req, res) => {
    const { featureId } = req.params;
    try {
        const feature = await Feature.findById(featureId);
        if (!feature) {
            return res.status(404).json({ message: "Feature not found" });
        }

        // Optionally delete all images from Cloudinary
        const publicIds = feature.images.map(image => image.split('/').pop().split('.')[0]);
        await Promise.all(publicIds.map(id => cloudinary.uploader.destroy(id)));

        // Delete feature entry
        await Feature.findByIdAndDelete(featureId);
        res.json({ message: "Feature deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting feature", error: error.message });
    }
};

export { getFeatures, addFeature, updateFeature, deleteFeature };
