import Employee from "../Models/employeeModel.js";
import { generateReferralCode } from "../Utils/generateReferalCode.js";

export const createEmployee = async (req, res) => {
    const { firstName, lastName, email, phone, role, address, city, state, pincode } = req.body;
    try {
        const employee = await Employee.findOne({ email });
        if (employee) {
            return res.status(400).json({ message: "Employee already exists" });
        }

        const firstNameDigits = firstName.slice(0, 4);
        const lastPhoneDigits = phone.slice(-4);
        const password = `${firstNameDigits}${lastPhoneDigits}`;
        const hashedPassword = await bcrypt.hash(password, 10);
        const referralCode = generateReferralCode(firstName, phone);

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
            profilePicture // Placeholder URL
        });
        await newEmployee.save();
        res.status(201).json({ message: "Employee created successfully" });
    } catch (error) {
        console.log(error)

    }
}