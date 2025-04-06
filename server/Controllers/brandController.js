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