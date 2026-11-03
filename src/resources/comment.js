const { createResource } = require("../parsing/resource");
const { objectId } = require("../parsing/id");

module.exports = createResource({
  schema: {
    content: {
      type: "string", trim: true, empty: false, max: 1000,
      messages: {
        required: "Comment content is required.",
        string: "Comment content cannot be empty.",
        stringEmpty: "Comment content cannot be empty.",
        stringMax: "Comment cannot exceed {expected} characters."
      }
    },
    
    course: objectId("Course"),

    parent: {
      ...objectId("Parent Comment"),
      optional: true
    }
  },
  
  filterFields: ["course", "parent"],
  
  filterExtras: {
    createdAt: { type: "date" },
    updatedAt: { type: "date" },
  },
  
  sortable: ["createdAt", "updatedAt"],
  defaultSort: { createdAt: -1 }
});