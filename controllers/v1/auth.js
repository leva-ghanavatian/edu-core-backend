const userModel = require("../../models/User");
const Banned = require("../../models/Banned");
const User = require("../../src/resources/user");
const { parseId } = require("../../src/parsing/id");
const jwt = require("jsonwebtoken");
const { signToken, signRefreshToken } = require("../../helpers/auth");
const { UnauthorizedError, ForbiddenError } = require("../../helpers/errors");
const found = require("../../helpers/found");
const REFRESH_SECRET = "testRefresh1234";

const REFRESH_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/v1/auth/refresh",
    maxAge: 30 * 24 * 60 * 60 * 1000
};

const registerUser = async (req, res) => {
    const data = User.parseOnly(req.body, ["name", "username", "email", "password", "phone"]);
    if (data.phone) {
        const isBanned = await Banned.findByPhone(data.phone);
        if (isBanned) {
            throw new ForbiddenError("This phone number is banned from registering.");
        }
    }
    const newUser = await userModel.create(data);
    const token = signToken(newUser);
    res.cookie("refreshToken", signRefreshToken(newUser), REFRESH_COOKIE_OPTIONS);
    res.cookie("token", signToken(newUser), COOKIE_OPTIONS);
    res.status(201).json({ user: newUser });
};

const loginUser = async (req, res) => {
    const { email, phone, password } = User.parseLogin(req.body);
    const user = await userModel.authenticate({ email, phone }, password);
    if (!user) throw new UnauthorizedError("Invalid email/phone or password");
    res.cookie("refreshToken", signRefreshToken(user), REFRESH_COOKIE_OPTIONS);
    res.cookie("token", signToken(user), COOKIE_OPTIONS);
    res.json({user});
};

const getMe = async (req, res) => {
    const id = parseId(req.user.sub);
    const user = await userModel.findById(id);
    res.json(found(user, "User"));
};

const refreshToken = async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedError("Missing refresh token");

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw new ForbiddenError("Invalid or expired refresh token");
    }
    //Re-fetching the user means the new access token gets the current role,
    //and deleted or banned users can't refresh.
    const user = await userModel.findById(parseId(payload.sub));
    if (!user) throw new UnauthorizedError("User no longer exists");

    // rotate: issue a new refresh token too
    res.cookie("refreshToken", signRefreshToken(user), REFRESH_COOKIE_OPTIONS);
    res.json({ accessToken: signToken(user) });

};

const axios = require('axios');

module.exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
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
          'Api-Key': 'HaHLS0y1KRLFslecG64G84p2KolmHCBoFXVEyU1ziSKvgQTB2Z'
        }
      }
    );

    console.log("Success:", response.data);
    return res.status(200).json({ success: true, data: response.data });

  } catch (error) {
    console.error("Error sending OTP:", error.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    refreshToken
}