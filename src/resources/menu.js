const { createResource } = require("../parsing/resource");
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

module.exports = createResource({
  schema: {
    title: text("Title", { max: 50 }),
    href: text("Href", { max: 100 }),
    parent: { 
        ...objectId("Parent Menu"), 
        optional: true // If missing, it's a main menu
    }
  },
  filterFields: ["title", "href", "parent"],
  filterExtras: {
    createdAt: { type: "date" }
  },
  sortable: ["title", "createdAt"],
  defaultSort: { title: 1 } 
});