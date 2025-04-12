import Employee from "../Models/employeeModel.js";
import { generateReferralCode } from "../Utils/generateReferralCode.js";
import bcrypt from "bcryptjs";
import fs from "fs";

export const createEmployee = async (req, res) => {
    const { firstName, lastName, email, phone, position, address, city, state, pinCode, profileImage } = req.body;
    // console.log(pinCodAe, "Pincode");
    try {
        const employee = await Employee.findOne({ email });
        if (employee) {
            console.log("Employee already exists");
            return res.status(400).json({ message: "Employee already exists" });
        }

        const firstNameDigits = firstName.slice(0, 4);
        const lastPhoneDigits = phone.slice(-4);
        const password = `${firstNameDigits}${lastPhoneDigits}`;
        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = generateReferralCode(firstName, phone);


        // Handle uploaded file
        const profileImage = req.file ? `uploads/employee/${req.file.filename}` : null;

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
            profileImage // Placeholder URL
        });
        await newEmployee.save();
        res.status(201).json({ message: "Employee created successfully" });
    } catch (error) {
        console.log(error)

    }
}

export const getAllEmployee = async (req, res) => {
    console.log(req);
    try {
        const employees = await Employee.find({}).select("-password");
        console.log(employees)
        res.status(200).json({ message: "Emploee Fetched Successfully", employees });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the employee by ID to get the profile image path
        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Delete the employee by ID
        await Employee.findByIdAndDelete(id);

        // Delete the associated profile image if it exists
        if (employee.profileImage) {
            fs.unlink(employee.profileImage, (err) => {
                if (err) {
                    console.error("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully:", employee.profileImage);
                }
            });
        }

        // Fetch all remaining employees
        const getAllEmployees = await Employee.find({}).select("-password");
        console.log(getAllEmployees);

        // Return the updated list of employees
        res.status(200).json({ employees: getAllEmployees, message: "Employee deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the employee by ID
        const employee = await Employee.findById(id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Handle uploaded file
        let profileImage = employee.profileImage; // Keep the existing image by default
        if (req.file) {
            // Delete the old image if it exists
            if (employee.profileImage) {
                fs.unlink(employee.profileImage, (err) => {
                    if (err) {
                        console.error("Error deleting old image:", err);
                    } else {
                        console.log("Old image deleted successfully:", employee.profileImage);
                    }
                });
            }
            // Set the new image path
            profileImage = `uploads/employee/${req.file.filename}`;
        }

        // Update employee details
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
                profileImage, // Update the profile image
            },
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: "Employee updated successfully", employee: updatedEmployee });
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};