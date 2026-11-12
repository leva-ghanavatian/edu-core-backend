const { createResource } = require("../parsing/resource");

const text = (label, rules = {}, messages = {}) => ({
  type: "string", trim: true, empty: false, ...rules,
  messages: {
    required: `${label} is required.`,
    string: `${label} is required.`,
    stringEmpty: `${label} cannot be empty.`,
    stringMax: `${label} must be at most {expected} characters.`,
    ...messages
  }
});

module.exports = createResource({
  schema: {
    name: text("Name", { max: 100 }),
    email: {
      type: "email", mode: "precise", normalize: true,
      messages: { required: "Email is required.", email: "Must be a valid email." }
    },
    phone: { type: "string", trim: true, optional: true, max: 20 },
    subject: text("Subject", { max: 150 }),
    message: text("Message", { max: 2000 }),
    replyMessage: {
      type: "string", trim: true, optional: true, max: 2000,
      messages: {
        string: "Reply must be a string.",
        stringMax: "Reply must be at most {expected} characters."
      }
    },
  },

  filterFields: ["email"],

  filterExtras: {
    status: { type: "string", enum: ["NEW", "IN_PROGRESS", "RESOLVED"] },
    createdAt: { type: "date" }
  },

  sortable: ["createdAt", "status"],
  defaultSort: { createdAt: -1 }
});