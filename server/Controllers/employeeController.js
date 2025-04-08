import Employee from "../Models/employeeModel.js";

export const createEmployee = async (req, res) => {
    const { firstName, lastName, email, phone, role, address, city, state, pincode, referralCode } = req.body;
    try {
        const employee = await Employee.findOne({ email });
        if (employee) {
            return res.status(400).json({ message: "Employee already exists" });
        }

        const firstNameDigits = firstName.slice(0, 4);
        const lastPhoneDigits = phone.slice(-4);
        const password = `${firstNameDigits}${lastPhoneDigits}`;
        const hashedPassword = await bcrypt.hash(password, 10);

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
            profilePicture: "https://example.com/default-profile-pic.jpg", // Placeholder URL
        });
        await newEmployee.save();
        res.status(201).json({ message: "Employee created successfully" });
    } catch (error) {
        console.log(error)

    }
}