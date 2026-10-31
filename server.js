require("dotenv").config();
const app = require("./app");app.use(cors());
const authRouter = require("./routes/v1/auth");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const { notFound, errorHandler, camelcase } = require("./middlewares/http");
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json())
app.use(express.json({ limit: "1mb" })); 
app.use(camelcase);
app.use(express.static(path.join(__dirname, "public", "courses", "covers")));

app.use("/v1/auth", authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
