const ticketModel = require("../../models/Ticket");
const Ticket = require("../../src/resources/ticket");
const { parsePagination } = require("../../src/parsing/pagination");
const { parseId } = require("../../src/parsing/id");
const found = require("../../helpers/found");
const { NotFoundError } = require("../../helpers/errors");

const createTicket = async (req, res, next) => {
    try {
        const data = Ticket.parseCreate(req.body);
      
        data.user = parseId(req.user.sub);
        data.answered = 0;

        const newTicket = await ticketModel.create(data);
        res.status(201).json(newTicket);
    } catch (error) { next(error); }
};

const getUserTickets = async (req, res, next) => {
    try {
        const userId = parseId(req.user.sub);
        const { page, limit, sort, ...filterQuery } = req.query;

        const filter = Ticket.parseFilter({ ...filterQuery, user: userId });
        filter.parent = null; // <--- Only get main tickets (no parent)

        const sortObj = Ticket.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const tickets = await ticketModel.findWithPopulate({ filter, sort: sortObj, skip, limit: parsedLimit });
        res.json(tickets);
    } catch (error) { next(error); }
};

const getUnansweredTickets = async (req, res, next) => {
    try {
        const { page, limit, sort, ...filterQuery } = req.query;

        const filter = Ticket.parseFilter({ ...filterQuery, answered: 0 });
        filter.parent = null; // <--- Only get main tickets

        const sortObj = Ticket.parseSort(sort);
        const { skip, limit: parsedLimit } = parsePagination({ page, limit });

        const tickets = await ticketModel.findWithPopulate({ filter, sort: sortObj, skip, limit: parsedLimit });
        res.json(tickets);
    } catch (error) { next(error); }
};

const setAnswer = async (req, res, next) => {
    try {
        const ticketId = parseId(req.body.ticketID);
        const { body } = Ticket.parseAnswer(req.body);

        const originalTicket = await ticketModel.getTicketAndAnswer(ticketId);
        if (!originalTicket.ticket) throw new NotFoundError("Ticket not found");

        const answerData = {
            title: "پاسخ تیکت شما",
            body,
            parent: ticketId, // <--- This defines it as an answer
            priority: originalTicket.ticket.priority,
            user: parseId(req.user.sub),
            answered: 0,
            departmentID: originalTicket.ticket.departmentID,
            departmentSubID: originalTicket.ticket.departmentSubID,
            createdAt: new Date()
        };

        const newAnswer = await ticketModel.create(answerData);
        await ticketModel.setAnswered(ticketId);

        res.status(201).json(newAnswer);
    } catch (error) { next(error); }
};

const getTicketAnswer = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        const result = await ticketModel.getTicketAndAnswer(id);
        
        if (!result.ticket) throw new NotFoundError("Ticket not found");

        res.json({
            ticket: result.ticket,
            ticketAnswer: result.answer || null
        });
    } catch (error) { next(error); }
};

module.exports = { createTicket, getUserTickets, getUnansweredTickets, setAnswer, getTicketAnswer };