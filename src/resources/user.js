const { createResource } = require("../parsing/resource");
const { createParser } = require("../parsing/compile");
const { ValidationError } = require("../../helpers/errors");

const PASSWORD_MSG = "Password must be between 8 and 72 characters.";

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

const userResource = createResource({
  schema: {
    name: text("Name", { max: 100 }),
    username: text("Username",
      { min: 3, max: 30, pattern: /^[\w.-]+$/ },
      { stringPattern: "Username may only contain letters, numbers, dots, dashes and underscores." }
    ),
    email: {
      type: "email", mode: "precise", normalize: true, max: 254,
      messages: {
        required: "Email is required and cannot be empty.",
        string: "Email is required and cannot be empty.",
        emailEmpty: "Email is required and cannot be empty.",
        email: "Email must be a valid email address.",
        stringMax: "Email must be at most {expected} characters."
      }
    },
    password: {
      type: "string", min: 8, max: 72,
      custom: (value, errors) => {
        if (typeof value === "string" && Buffer.byteLength(value, "utf8") > 72) {
          errors.push({ type: "passwordBytes", actual: value });
        }
        return value;
      },
      messages: {
        required: PASSWORD_MSG, string: PASSWORD_MSG,
        stringMin: PASSWORD_MSG, stringMax: PASSWORD_MSG, passwordBytes: PASSWORD_MSG
      }
    },
    phone: {
      type: "string", trim: true, optional: false, max: 20,
      messages: {
        string: "Phone must be a string.",
        stringMax: "Phone must be at most {expected} characters."
      }
    },
    crime: {
      type: "number", integer: true, min: 0,
      messages: {
        required: "Crime must be a non-negative integer.",
        number: "Crime must be a non-negative integer.",
        numberInteger: "Crime must be a non-negative integer.",
        numberMin: "Crime must be a non-negative integer."
      }
    }
  },
  filterFields: ["name", "username", "email", "phone", "crime"],
  filterExtras: {
    role: { type: "string", enum: ["USER", "ADMIN"] },
    createdAt: { type: "date" },
    updatedAt: { type: "date" }
  },
  sortable: ["name", "username", "crime", "createdAt", "updatedAt"]
});

const loginSchema = {
  email: { type: "email", optional: true, normalize: true },
  phone: { type: "string", optional: true },
  password: { type: "string" }
};

const loginParser = createParser(loginSchema);

// Override the parseLogin function
userResource.parseLogin = (data) => {
  const parsed = loginParser.parseCreate(data);
  if (!parsed.email && !parsed.phone) {
    throw new ValidationError("Please provide either an email or a phone number to login.");
  }
  return parsed;
};

module.exports = userResource;