const { createResource } = require("../parsing/resource");
const { objectId } = require("../parsing/id");

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
    title: text("Title", { max: 100 }),
    message: text("Message", { max: 1000 }),
    user: objectId("User") // The recipient
  },
  
  filterFields: ["user"], 
  
  filterExtras: {
    seen: { type: "boolean", convert: true },
    createdAt: { type: "date" }
  },
  
  sortable: ["createdAt"],
  defaultSort: { createdAt: -1 }
});