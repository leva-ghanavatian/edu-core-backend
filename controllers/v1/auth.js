const userModel = require("../../models/User");
const User = require("../../src/resources/user");
const { parseId } = require("../../src/parsing/id");
const { signToken } = require("../../helpers/auth");
const { UnauthorizedError } = require("../../helpers/errors");
const found = require("../../helpers/found");

const registerUser = async (req, res) => {
    const data = User.parseOnly(req.body, ["name", "username", "email", "password", "phone"]);
    const newUser = await userModel.create(data);
    res.status(201).json(newUser);
};

const loginUser = async (req, res) => {
    const { email, password } = User.parseOnly(req.body, ["email", "password"]);
    const user = await userModel.authenticate(email, password);
    if (!user) throw new UnauthorizedError("Invalid email or password");
    res.json({ token: signToken(user) });
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