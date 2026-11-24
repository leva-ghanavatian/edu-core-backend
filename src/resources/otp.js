const { createResource } = require("../parsing/resource");
const { createParser } = require("../parsing/compile");

const otpResource = createResource({
  schema: {
    phone: { 
      type: "string", trim: true, empty: false, 
      messages: { required: "Phone number is required." }
    }
  },
  // We don't need filters or sorts for OTPs
  filterFields: [],
  sortable: []
});

// Custom parser for verifying the OTP
const verifyParser = createParser({
  phone: { type: "string", trim: true, empty: false },
  code: { 
    type: "number", integer: true, convert: true, 
    messages: { required: "OTP code is required." } 
  }
});

otpResource.parseVerify = verifyParser.parseCreate;

module.exports = otpResource;