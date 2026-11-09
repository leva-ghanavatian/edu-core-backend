const { createResource } = require("../parsing/resource");
const { objectId } = require("../parsing/id");

module.exports = createResource({
  schema: {
    course: objectId("Course"),
    user: objectId("User"),
    price: { 
      type: "number", min: 0, convert: true,
      messages: { required: "Price is required." }
    }
  },
  filterFields: ["course", "user"],
  filterExtras: {
    createdAt: { type: "date" }
  },
  sortable: ["createdAt"],
  defaultSort: { createdAt: -1 }
});