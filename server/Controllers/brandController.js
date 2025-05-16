import Brand from "../Models/brandModel.js";

export const addBrand = async (req, res) => {
    const { brandName } = req.body;
    try {
        const newBrand = new Brand({ brandName });
        await newBrand.save();
        const brands = await Brand.find();
        res.status(201).json({ brands, message: "Brand added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json(brands);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}
export const addModel = async (req, res) => {
    const { brandId, modelName } = req.body;
    try {
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }
        brand.models.push({ name: modelName });
        await brand.save();
        const brands = await Brand.find();

        res.status(201).json({ brands, message: "Model added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getModels = async (req, res) => {
    const { brandId } = req.query;
    try {
        const brand = await Brand.findById(brandId);
        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }
        res.status(200).json(brand.models);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export const deleteBrand = async (req, res) => {
    try {
        const { brandId } = req.params;

        // Validate if brandId exists
        if (!brandId) {
            return res.status(400).json({ success: false, message: 'Brand ID is required' });
        }

        // Find and delete the brand
        const deletedBrand = await Brand.findByIdAndDelete(brandId);

        if (!deletedBrand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        const brands = await Brand.find();

        res.status(200).json({
            message: 'Brand deleted successfully',
            brands,
        });

    } catch (error) {
        console.error('Error deleting brand:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete brand',
            error: error.message
        });
    }
}
export const deleteModel = async (req, res) => {
    try {
        const { brandId, modelId } = req.params;

        // Validate if both IDs exist
        if (!brandId || !modelId) {
            return res.status(400).json({
                success: false,
                message: 'Brand ID and Model ID are required'
            });
        }

        // Find the brand and pull the model from the models array
        const updatedBrand = await Brand.findByIdAndUpdate(
            brandId,
            { $pull: { models: { _id: modelId } } },
            { new: true } // Return the updated document
        );

        if (!updatedBrand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        const brands = await Brand.find();
        res.status(200).json({
            success: true,
            message: 'Model deleted successfully',
            brands,
        });

    } catch (error) {
        console.error('Error deleting model:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete model',
            error: error.message
        });
    }
}