const { createResource } = require("../parsing/resource");
const { createParser } = require("../parsing/compile");
const { objectId } = require("../parsing/id");

const text = (label, rules = {}, messages = {}) => ({
  type: "string", trim: true, empty: false, ...rules,
  messages: {
    required: `${label} is required.`,
    stringEmpty: `${label} cannot be empty.`,
    stringMax: `${label} must be at most {expected} characters.`,
    ...messages
  }
});

const ticketResource = createResource({
  schema: {
    departmentID: objectId("Department"),
    departmentSubID: objectId("SubDepartment"),
    priority: { 
      type: "number", integer: true, min: 1, max: 3, convert: true,
      messages: { required: "Priority is required (1, 2, or 3)." }
    },
    title: text("Title", { max: 150 }),
    body: text("Body", { max: 2000 }),
    course: { ...objectId("Course"), optional: true } // Optional: Ticket might not be about a course
  },
  filterFields: ["departmentID", "departmentSubID", "priority", "course"],
  filterExtras: {
    user: { type: "objectID", convert: true },
    parent: { type: "objectID", convert: true },
    answered: { type: "number", convert: true }, // 0 = waiting, 1 = answered
    createdAt: { type: "date" }
  },
  sortable: ["priority", "createdAt"],
  defaultSort: { createdAt: -1 }
});

// Add a custom parser specifically for Admin replies
const answerParser = createParser({
  body: text("Body", { max: 2000 })
});

ticketResource.parseAnswer = answerParser.parseCreate;

module.exports = ticketResource;