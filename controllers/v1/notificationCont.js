const notificationModel = require("../../models/Notification");
const Notification = require("../../src/resources/notification");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");
const { ForbiddenError } = require("../../helpers/errors");

// Admin sends a notification
const sendNotification = async (req, res, next) => {
    try {
        const data = Notification.parseCreate(req.body);
        const newNotification = await notificationModel.create(data);
        res.status(201).json(newNotification);
    } catch (error) { next(error); }
};

// User gets their OWN notifications
const getMyNotifications = async (req, res, next) => {
    try {
        const userId = parseId(req.user.sub);
        const { page, limit, sort, ...filterQuery } = req.query;

        // Force the filter to ONLY look for this user's ID
        const filter = Notification.parseFilter({ ...filterQuery, user: userId });
        const sortObj = Notification.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const notifications = await notificationModel.find({
            filter, sort: sortObj, skip, limit: parsedLimit
        });

        res.json(notifications);
    } catch (error) { next(error); }
};

// Get a specific notification
const getNotification = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const notification = await notificationModel.findById(id);

        if (!notification) return res.json(found(notification, "Notification"));

        // Security: Users can only view their own, Admins can view any
        if (req.user.role !== "ADMIN" && notification.user.toString() !== req.user.sub) {
            throw new ForbiddenError("You do not have permission to view this notification.");
        }

        res.json(notification);
    } catch (error) { next(error); }
};

// Mark as seen
const markNotificationSeen = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const userId = parseId(req.user.sub);

        // The model uses BOTH the ID and the User ID to prevent users from
        // marking other people's notifications as seen.
        const updated = await notificationModel.markAsSeen(id, userId);
        
        // If it returns null, either it doesn't exist, or it belongs to someone else.
        res.json(found(updated, "Notification"));
    } catch (error) { next(error); }
};

module.exports = { sendNotification, getMyNotifications, getNotification, markNotificationSeen };