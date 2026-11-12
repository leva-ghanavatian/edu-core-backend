const fs = require("fs");
const nodemailer = require("nodemailer");
const contactModel = require("../../models/Contact");
const Contact = require("../../src/resources/contact");
const { parseId } = require("../../src/parsing/id");
const { parsePagination } = require("../../src/parsing/pagination");
const found = require("../../helpers/found");
const { sendEmail } = require("../../helpers/mailer");
const { NotFoundError } = require("../../helpers/errors");

const submitContact = async (req, res) => {
    let filePath = null;
    try {
        const data = Contact.parseCreate(req.body);

        if (req.file) {
            data.attachment = req.file.filename;
            filePath = req.file.path;
        }

        const ticket = await contactModel.create(data);
        res.status(201).json(ticket);

    } catch (error) {
        // ROLLBACK: If validation or DB fails, delete the uploaded file!
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        next(error);
    }
};

const getAllContacts = async (req, res) => {

    const { page, limit, sort, ...filterQuery } = req.query;
    const filter = Contact.parseFilter(filterQuery);
    const sortObj = Contact.parseSort(sort);
    const { skip, limit: parsedLimit } = parsePagination({ page, limit });

    const contacts = await contactModel.find({ filter, sort: sortObj, skip, limit: parsedLimit });
    res.json(contacts);
};

const updateContactStatus = async (req, res) => {

    const id = parseId(req.params.id);
    const { status } = Contact.parseOnly(req.body, ["status"]);

    const updated = await contactModel.updateStatus(id, status);
    res.json(found(updated, "Contact Ticket"));

};

const replyToContact = async (req, res, next) => {
    try {
        const id = parseId(req.params.id);
        
        const { replyMessage } = Contact.parseOnly(req.body, ["replyMessage"]);
        if (!replyMessage) throw new ValidationError("Reply message is required");

        const contact = await contactModel.findById(id);
        if (!contact) throw new NotFoundError("Contact ticket not found");

        await sendEmail({
            to: contact.email,
            subject: `Re: ${contact.subject}`,
            text: replyMessage
        });

        // Mark the ticket as RESOLVED in the database
        const updatedTicket = await contactModel.updateStatus(id, "RESOLVED");

        res.json({ 
            message: "Reply sent successfully", 
            ticket: updatedTicket 
        });
    } catch (error) { 
        next(error); 
    }
};

module.exports = { submitContact, getAllContacts, updateContactStatus, replyToContact };
