const { createResource } = require("../parsing/resource");
const { objectId } = require("../parsing/id");

module.exports = createResource({
  schema: {
    code: {
      type: "string", trim: true, empty: false, uppercase: true, max: 20,
      messages: {
        required: "Discount code is required.",
        stringEmpty: "Discount code cannot be empty."
      }
    },
    percent: {
      type: "number", integer: true, min: 1, max: 100, convert: true,
      messages: {
        required: "Percentage is required.",
        numberMin: "Percentage must be at least 1.",
        numberMax: "Percentage cannot exceed 100."
      }
    },
    course: objectId("Course"),
    max: {
      type: "number", integer: true, min: 1, convert: true,
      messages: {
        required: "Maximum uses is required.",
        numberMin: "Maximum uses must be at least 1."
      }
    }
  },
  
  filterFields: ["code", "course"],
  
  filterExtras: {
    creator: { type: "objectID", convert: true },
    createdAt: { type: "date" }
  },
  
  sortable: ["createdAt", "percent"],
  defaultSort: { createdAt: -1 }
});