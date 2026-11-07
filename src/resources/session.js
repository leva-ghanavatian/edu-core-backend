const { createResource } = require("../parsing/resource");
const { objectId } = require("../parsing/id");

module.exports = createResource({
  schema: {
    title: {
      type: "string", trim: true, empty: false, max: 150,
      messages: {
        string: "Title is required and cannot be empty.",
        stringEmpty: "Title is required and cannot be empty.",
        stringMax: "Title must be at most {expected} characters."
      }
    },
    
    // Storing duration in total seconds. 12:09 => 729
    duration: {
      type: "number", integer: true, min: 1, convert: true,
      messages: {
        required: "Duration is required.",
        number: "Duration must be a number (in seconds).",
        numberInteger: "Duration must be a whole number.",
        numberMin: "Duration must be greater than 0."
      }
    },

    // 0 for false, 1 for true
    free: {
      type: "number", integer: true, min: 0, max: 1, convert: true,
      messages: {
        required: "Free status is required.",
        numberMin: "Free must be 0 or 1.",
        numberMax: "Free must be 0 or 1."
      }
    },

    // video: {
    //   type: "string", trim: true, empty: false,
    //   messages: {
    //     required: "Video URL is required.",
    //     stringEmpty: "Video URL is required."
    //   }
    // },

    course: objectId("Course")
  },
  
  filterFields: ["title", "free", "course"],
  
  filterExtras: {
    duration: { type: "number", integer: true, min: 1 },
    createdAt: { type: "date" },
    updatedAt: { type: "date" },
  },
  
  sortable: ["title", "duration", "free", "createdAt", "updatedAt"],
  defaultSort: { createdAt: -1 }
});