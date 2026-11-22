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
    path: "/v1/auth/refresh", // adjust to your real mount path
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
    res.status(201).json({ user: newUser, token });
};

const loginUser = async (req, res) => {
    const { email, phone, password } = User.parseLogin(req.body);
    const user = await userModel.authenticate({ email, phone }, password);
    if (!user) throw new UnauthorizedError("Invalid email/phone or password");
    res.json({
        token: signToken(user),
        user
    });
};

const getMe = async (req, res) => {
    const id = parseId(req.user.sub);
    const user = await userModel.findById(id);
    res.json(found(user, "User"));
};

module.exports = {
    registerUser,
    loginUser,
    getMe
}