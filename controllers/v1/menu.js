const menuModel = require("../../models/Menu");
const Menu = require("../../src/resources/menu");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");

// Public: Returns a nested tree structure
const getAllMenus = async (req, res, next) => {
    try {
        // Fetch ALL menus (we don't paginate trees, we paginate the flat admin list)
        const menus = await menuModel.find({ 
            filter: {}, 
            sort: { title: 1 }, 
            skip: 0, 
            limit: 1000 
        });

        // Build the tree in O(n) time
        const map = {};
        const roots = [];

        // 1. Initialize the map and add a 'submenus' array to every item
        menus.forEach(menu => {
            map[menu._id.toString()] = { ...menu, submenus: [] };
        });

        // 2. Attach children to their parents
        menus.forEach(menu => {
            if (menu.parent) {
                const parentId = menu.parent.toString();
                // If the parent exists in the map, add this menu to its submenus
                if (map[parentId]) {
                    map[parentId].submenus.push(map[menu._id.toString()]);
                }
            } else {
                // If it has no parent, it's a top-level menu
                roots.push(map[menu._id.toString()]);
            }
        });

        res.json(roots);
    } catch (error) { next(error); }
};

// Admin: Returns a flat paginated list with populated parent
const getAllMenusPanel = async (req, res, next) => {
    try {
        const { page, limit, sort, ...filterQuery } = req.query;
        const filter = Menu.parseFilter(filterQuery);
        const sortObj = Menu.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const menus = await menuModel.findWithPopulate({
            filter, sort: sortObj, skip, limit: parsedLimit
        });
        
        res.json(menus);
    } catch (error) { next(error); }
};

const createMenu = async (req, res, next) => {
    try {
        const data = Menu.parseCreate(req.body);
        const newMenu = await menuModel.create(data);
        res.status(201).json(newMenu);
    } catch (error) { next(error); }
};

const deleteMenu = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const deleted = await menuModel.remove(id);
        res.json(found(deleted, "Menu"));
    } catch (error) { next(error); }
};

module.exports = { getAllMenus, getAllMenusPanel, createMenu, deleteMenu };