const fs = require("fs");
const path = require("path");
const sessionModel = require("../../models/Session");
const Session = require("../../src/resources/session");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");
const unlink = require("../../helpers/files");
const { ValidationError } = require("../../helpers/errors");

const VIDEOS_DIR = path.join(__dirname, "../../public/courses/videos");

const getAllSessions = async (req, res) => {
        const { page, limit, sort, ...filterQuery } = req.query;

        const filter = Session.parseFilter(filterQuery);
        const sortObj = Session.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const sessions = await sessionModel.find({
            filter,
            sort: sortObj,
            skip,
            limit: parsedLimit
        });

        res.json(sessions);
};

const getSession = async (req, res, next) => {
    try {
        const sessionId = parseId(req.params.id);
        const userId = parseId(req.user.sub); // From token

        const session = await sessionModel.findById(sessionId);
        if (!session) throw new NotFoundError("Session not found");

        // If the session is NOT free, check if they are enrolled!
        if (session.free === 0) {
            const isEnrolled = await courseUserModel.isUserEnrolled(session.course, userId);
            if (!isEnrolled) {
                throw new ForbiddenError("You must purchase this course to watch this video.");
            }
        }

        res.json(session);
    } catch (error) { next(error); }
};

const createSession = async (req, res) => {
        const data = Session.parseOnly(req.body, ["title", "free", "duration"]);

        if (!req.file) {
           throw new ValidationError("Session video is required.");
        }

        console.log(req.file);
        
        data.video = req.file.filename;
        data.course = parseId(req.params.id);

        const newSession = await sessionModel.create(data);
        res.status(201).json(newSession);
};

const updateSession = async (req, res) => {
        const id = parseId(req.params.id);
        const data = Session.parseUpdate(req.body);
        
        const updatedSession = await sessionModel.update(id, data);
        res.json(found(updatedSession, "Session"));
};

const deleteSession = async (req, res) => {
        const id = parseId(req.params.id);
        const deletedSession = await sessionModel.remove(id);
        if (deletedSession && deletedSession.video) {
                // __dirname is .../controllers/v1
                // ../../ goes up to the root folder, then into public/courses/covers
                await safeUnlink(path.join(VIDEOS_DIR, deletedSession.video));

        }
        res.json(found(deletedSession, "Session"));
};

module.exports = {
    getAllSessions,
    getSession,
    createSession,
    updateSession,
    deleteSession,
};