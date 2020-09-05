const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const exphbs = require("express-handlebars");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

//Load Config
dotenv.config({ path: "./config/config.env" });

//Passport Config
require("./config/passport")(passport);

//initialize Connection
connectDB();

//Intialise APP
const app = express();

//Body Parser
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: false }));

//Method Overide for forms
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

//Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Handlebars Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require("./helpers/hbs");

//Setting Up VIEW ENGINE USING EXPRESS HANDLEBARS template engine
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: { formatDate, stripTags, truncate, editIcon, select },
  })
);
app.set("view engine", ".hbs");

//Sessions
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Set Global Variable
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

//Middleware Static Folders
app.use(express.static("public"));

//Routes Middleware
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

//Create server and PORT
app.listen(process.env.PORT || 3000, () => {
  console.log(
    `Server Running in  ${process.env.NODE_ENV} mode on PORT ${process.env.PORT}`
  );
});
