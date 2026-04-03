import ServiceArea from "../Models/serviceAreaModel.js";

export const createServiceArea = async (req, res) => {
    try {
        const { name, latitude, longitude, radius } = req.body;

        if (!name || !latitude || !longitude || !radius) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const serviceArea = await ServiceArea.create({
            name,
            location: {
                type: "Point",
                coordinates: [longitude, latitude], // ⚠️ lng, lat
            },
            radius,
        });

        return res.status(201).json({
            success: true,
            message: "Service area created successfully",
            data: serviceArea,
        });
    } catch (error) {
        console.error("Create Service Area Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const checkServiceAvailability = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude and Longitude required",
            });
        }

        // Find nearest service area
        const areas = await ServiceArea.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [longitude, latitude],
                    },
                    distanceField: "distance",
                    spherical: true,
                    query: { isActive: true },
                },
            },
        ]);

        if (!areas.length) {
            return res.json({
                success: true,
                serviceable: false,
                message: "No service areas found",
            });
        }

        const nearestArea = areas[0];

        const isServiceable = nearestArea.distance <= nearestArea.radius;

        return res.json({
            success: true,
            serviceable: isServiceable,
            area: nearestArea.name,
            distance: nearestArea.distance, // meters
            radius: nearestArea.radius,
        });
    } catch (error) {
        console.error("Check Service Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const getAllServiceAreas = async (req, res) => {
    try {
        const areas = await ServiceArea.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: areas,
        });
    } catch (error) {
        console.error("Get Areas Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};


export const updateServiceArea = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, latitude, longitude, radius } = req.body;

        if (!name || latitude === undefined || longitude === undefined || radius === undefined) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const area = await ServiceArea.findById(id);

        if (!area) {
            return res.status(404).json({
                success: false,
                message: "Service area not found",
            });
        }

        const latNum = Number(latitude);
        const lngNum = Number(longitude);
        const radiusNum = Number(radius);

        if (Number.isNaN(latNum) || Number.isNaN(lngNum) || Number.isNaN(radiusNum)) {
            return res.status(400).json({
                success: false,
                message: "Latitude, longitude and radius must be valid numbers",
            });
        }

        area.name = name;
        area.radius = radiusNum;
        area.location = {
            type: "Point",
            coordinates: [lngNum, latNum],
        };

        await area.save();

        return res.json({
            success: true,
            message: "Service area updated successfully",
            data: area,
        });
    } catch (error) {
        console.error("Update Service Area Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};

export const toggleServiceArea = async (req, res) => {
    try {
        const { id } = req.params;

        const area = await ServiceArea.findById(id);

        if (!area) {
            return res.status(404).json({
                success: false,
                message: "Service area not found",
            });
        }

        area.isActive = !area.isActive;
        await area.save();

        res.json({
            success: true,
            message: "Status updated",
            data: area,
        });
    } catch (error) {
        console.error("Toggle Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};