const { createResource } = require("../parsing/resource");
const { objectId } = require("../parsing/id");

const text = (label, rules = {}, messages = {}) => ({
  type: "string", trim: true, empty: false, ...rules,
  messages: {
    required: `${label} is required.`,
    string: `${label} is required.`,
    stringEmpty: `${label} cannot be empty.`,
    stringMin: `${label} must be at least {expected} characters.`,
    stringMax: `${label} must be at most {expected} characters.`,
    ...messages
  }
});

module.exports = createResource({
  schema: {
    name: text("Name", { max: 150 }),
    description: text("Description", { max: 2000 }),
    cover: text("Cover", { max: 255 }),
    support: text("Support", { max: 255 }),
    
    href: text("Href", 
      { min: 3, max: 50, pattern: /^[a-z0-9-]+$/ },
      { stringPattern: "Href may only contain lowercase letters, numbers, and dashes." }
    ),
    
    price: {
      type: "number", min: 0,
      messages: { required: "Price is required.", number: "Price must be a number." }
    },
    
    status: {
      type: "string", enum: ["complete", "presell", "in-progress"],
      messages: { required: "Status is required.", stringEnum: "Status must be 'complete', 'presell', or 'in-progress'." }
    },
    
    discount: {
      type: "number", min: 0, max: 100, default: 0,
      messages: { number: "Discount must be a number (percentage)." }
    },

    category: objectId("Category")
  },
  
  filterFields: ["name", "status", "category", "price"],
  
  filterExtras: {
    creator: { type: "objectID", convert: true },
    createdAt: { type: "date" },
    updatedAt: { type: "date" },
  },
  
  sortable: ["name", "price", "createdAt", "updatedAt"],
  defaultSort: { createdAt: -1 }
});