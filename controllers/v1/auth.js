const userModel = require("../../models/User");
const User = require("../../src/resources/user");
const { parseId } = require("../../src/parsing/id");
const { signToken } = require("../../helpers/auth");
const { UnauthorizedError } = require("../../helpers/errors");
const found = require("../../helpers/found");

const registerUser = async (req, res) => {
    const data = User.parseOnly(req.body, ["name", "username", "email", "password", "phone"]);
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