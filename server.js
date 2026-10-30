require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

(async () => {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");
})();

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
