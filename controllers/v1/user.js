const userModel = require("../../models/User");
const Banned = require("../../models/Banned");
const User = require("../../src/resources/user");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const { UnauthorizedError } = require("../../helpers/errors");
const found = require("../../helpers/found");


const getAllUsers = async (req, res) => {
    const { page, limit, sort, ...filterQuery } = req.query;

    const filter = User.parseFilter(filterQuery);
    const sortObj = User.parseSort(sort);
    const { skip, limit: parsedLimit } = parsePagination({ page, limit });

    const users = await userModel.find({
        filter,
        sort: sortObj,
        skip,
        limit: parsedLimit
    });

    res.json(users);
};

const getUser = async (req, res) => {
    const id = parseId(req.params.id);
    const user = await userModel.findById(id);
    res.json(found(user, "User"));
};

const updateUser = async (req, res) => {
    const id = parseId(req.params.id);
    const data = User.parseUpdate(req.body);
    const user = await userModel.update(id, data);
    res.json(found(user, "User"));
}

const upgradeUser = async (req, res) => {
    const id = parseId(req.params.id);
    const user = await userModel.setRole(id, userModel.ROLES.ADMIN);
    res.json(found(user, "User"));
};

const updateCrime = async (req, res) => {
    const id = parseId(req.params.id);
    const { crime } = User.parseOnly(req.body, ["crime"]);
    const user = await userModel.setCrime(id, crime);
    res.json(found(user, "User"));
};

const banUser = async (req, res) => {
        const { phone } = User.parseOnly(req.body, ["phone"]); 
        const ban = await Banned.create({ phone });
        res.status(201).json(ban);
};

const deleteUser = async (req, res) => {
    const id = parseId(req.params.id);
    const user = await userModel.deleteUser(id);
    res.json(found(user, "User"));
};

module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    upgradeUser,
    updateCrime,
    banUser,
    deleteUser
};