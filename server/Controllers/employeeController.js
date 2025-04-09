import Employee from "../Models/employeeModel.js";
import { generateReferralCode } from "../Utils/generateReferalCode.js";
import bcrypt from "bcryptjs";

export const createEmployee = async (req, res) => {
    const { firstName, lastName, email, phone, role, address, city, state, pincode, profileImage } = req.body;
    console.log(profileImage, "Profile  ");
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
            role,
            password: hashedPassword,
            address,
            city,
            state,
            pincode,
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
    try {
        const employees = await Employee.find({}).select("-password");
        console.log(employees)
        res.status(200).json({ employees });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}