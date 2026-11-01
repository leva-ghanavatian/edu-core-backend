const { createResource } = require("../parsing/resource");

const text = (label, rules = {}, messages = {}) => ({
    type: "string", trim: true, empty: false, ...rules,
    messages: {
        required: `${label} is required and cannot be empty.`,
        string: `${label} is required and cannot be empty.`,
        stringEmpty: `${label} is required and cannot be empty.`,
        stringMin: `${label} must be at least {expected} characters.`,
        stringMax: `${label} must be at most {expected} characters.`,
        ...messages
    }
});

const categoryResource = createResource({
    schema: {
        title: text("Title", { max: 100 }),
        href: text("Href", { min: 3, max: 30, pattern: /^[a-z0-9-]+$/ },
            { stringPattern: "Href may only contain lowercase letters, numbers, and dashes." })
    },
    filterFields: ["title", "href"],
    filterExtras: {
        createdAt: { type: "date" },
        updatedAt: { type: "date" }
    },
    sortable: ["title", "href", "createdAt", "updatedAt"]
});


module.exports = categoryResource;