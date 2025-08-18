import Employee from "../Models/employeeModel.js";
import { generateReferralCode } from "../Utils/generateReferralCode.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import jwt from "jsonwebtoken";
import path from 'path';
export const createEmployee = async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        position,
        address,
        city,
        state,
        pinCode,
        aadhar,
        dl
    } = req.body;

    try {
        // Check if employee already exists
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ message: "Employee already exists" });
        }

        // Generate password
        const firstNameDigits = firstName.slice(0, 4);
        const lastPhoneDigits = phone.slice(-4);
        const password = `${firstNameDigits}${lastPhoneDigits}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        const referralCode = req.referralCodeForUpload;
        // Extract file paths from multer fields
        const getRelativePath = (file) => file ? path.join('/uploads', path.relative('uploads', file.path)).replace(/\\/g, '/') : null;

        const profileImagePath = getRelativePath(req.files?.profileImage?.[0]);
        const aadharFrontPath = getRelativePath(req.files?.aadharFront?.[0]);
        const aadharBackPath = getRelativePath(req.files?.aadharBack?.[0]);
        const dlImagePath = getRelativePath(req.files?.dlImage?.[0]);

        // Create new employee
        const newEmployee = new Employee({
            firstName,
            lastName,
            email,
            phone,
            position,
            password: hashedPassword,
            address,
            city,
            state,
            pinCode,
            referralCode,
            aadhar,
            dl,
            profileImage: profileImagePath,
            aadharImages: {
                front: aadharFrontPath,
                back: aadharBackPath
            },
            dlImage: dlImagePath
        });

        await newEmployee.save();

        res.status(201).json({
            message: "Employee created successfully",
            employee: newEmployee
        });

    } catch (error) {
        console.error("Error creating employee:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Employee Sign In 
export const employeeSignIn = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the employee exists
        const employee = await Employee.findOne({ email });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Verify the password
        const isPasswordValid = await bcrypt.compare(password, employee.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: employee._id, role: employee.role },
            process.env.ADMIN_JWT_SECRET,
            { expiresIn: "1d" } // Token expires in 1 day
        );

        // Exclude the password from the response
        const { password: _, ...employeeData } = employee._doc;

        // Send the response
        res.status(200).json({
            message: "Sign-in successful",
            token,
            employee: employeeData, // Send all employee data excluding the password
        });
    } catch (error) {
        console.error("Error during employee sign-in:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllEmployee = async (req, res) => {
    try {
        // Extract query parameters from the request
        const query = req.query;

        // Fetch employees based on the query, or fetch all if no query is provided
        const employees = await Employee.find(query).select("-password");

        // Check if employees exist
        if (!employees.length) {
            return res.status(404).json({ message: "No employees found" });
        }

        // Send the filtered or full employee data
        res.status(200).json({ message: "Employees fetched successfully", employees });
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const deleteEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the employee by ID to get image paths
        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Helper to delete a file if it exists
        const deleteFileIfExists = (filePath) => {
            if (filePath && fs.existsSync(path.join(process.cwd(), filePath))) {
                fs.unlink(path.join(process.cwd(), filePath), (err) => {
                    if (err) {
                        console.error(`Error deleting ${filePath}:`, err);
                    } else {
                        console.log(`Deleted: ${filePath}`);
                    }
                });
            }
        };

        // Delete associated images
        deleteFileIfExists(employee.profileImage);
        deleteFileIfExists(employee.aadharImages.front);
        deleteFileIfExists(employee.aadharImages.back);
        deleteFileIfExists(employee.dlImage);

        // Delete the employee
        await Employee.findByIdAndDelete(id);

        // Fetch all remaining employees
        const getAllEmployees = await Employee.find({}).select("-password");

        res.status(200).json({
            employees: getAllEmployees,
            message: "Employee and images deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const updateEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find employee
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        let profileImage = employee.profileImage; // keep existing by default

        if (req.file) {
            // --- build new filename like creation ---
            const empCode = employee.referralCode || `EMP${employee._id}`;
            const ext = path.extname(req.file.originalname); // keep same extension (.jpg/.png)
            const fileName = `${empCode}-profileImage${ext}`;
            const uploadDir = path.join("uploads", "employees", "profile");
            const filePath = path.join(uploadDir, fileName);

            // --- ensure folder exists ---
            fs.mkdirSync(uploadDir, { recursive: true });

            // --- delete old image if exists ---
            if (employee.profileImage) {
                const oldPath = path.join(process.cwd(), employee.profileImage.replace(/^\//, ""));
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            // --- move uploaded file to correct location ---
            fs.renameSync(req.file.path, filePath);

            // --- save DB path with leading "/" ---
            profileImage = `/uploads/employees/profile/${fileName}`;
        }

        // --- update employee ---
        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                position: req.body.position,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                pinCode: req.body.pinCode,
                aadhar: req.body.aadhar,
                dl: req.body.dl,
                profileImage,
            },
            { new: true }
        );

        res.status(200).json({
            message: "Employee updated successfully",
            employee: updatedEmployee,
        });
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findById(id).select("-password");
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        res.status(200).json({ message: "Employee fetched successfully", employee });
    } catch (error) {
        console.error("Error fetching employee by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};