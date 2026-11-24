const otpModel = require("../../models/Otp");
const Otp = require("../../src/resources/otp");
const axios = require('axios');
const { ValidationError } = require("../../helpers/errors");

const sendOtp = async (req, res) => {
    try {
        const { phone } = Otp.parseCreate(req.body);
        const code = Math.floor(Math.random() * 99999);

        const response = await axios.post(
            'https://api.iranpayamak.com/ws/v1/sms/pattern',
            {
                code: "SQNo8JmFL3",
                recipient: phone,
                line_number: "3000505",
                number_format: "english",
                attributes: {
                    "code": code
                }
            },
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Api-Key': process.env.SMS_API_KEY
                }
            }
        );

        const otp = await otpModel.create(phone, code, 3);

        console.log("Success:", response.data);
        return res.status(200).json({ success: true, data: response.data });

    } catch (error) {
        console.error("Error sending OTP:", error.response?.data || error.message);
        return res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const { phone, code } = Otp.parseVerify(req.body);

        const result = await otpModel.verify(phone, code);

        if (!result.success) {
            if (result.reason === "expired") throw new ValidationError("OTP has expired.");
            if (result.reason === "max_attempts") throw new ValidationError("Too many attempts. Request a new code.");
            throw new ValidationError("Invalid OTP code.");
        }

        // TODO: If this is for login, you would generate a JWT token here
        // and return it, just like in your login controller.

        res.json({ message: "Phone number verified successfully!" });
    } catch (error) { next(error); }
};

module.exports = { sendOtp, verifyOtp };