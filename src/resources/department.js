const { createResource } = require("../parsing/resource");

const text = (label, rules = {}, messages = {}) => ({
  type: "string", trim: true, empty: false, ...rules,
  messages: {
    required: `${label} is required.`,
    stringEmpty: `${label} cannot be empty.`,
    stringMax: `${label} must be at most {expected} characters.`,
    ...messages
  }
});

module.exports = createResource({
  schema: {
    title: text("Title", { max: 100 }) // "Financial", "Course Support"
  },
  filterFields: ["title"],
  filterExtras: { createdAt: { type: "date" } },
  sortable: ["title", "createdAt"],
  defaultSort: { title: 1 }
});