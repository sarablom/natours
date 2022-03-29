const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitizer = require("express-mongo-sanitize");
const xss = require("xss-clean");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

// 1) GLOBAL MIDDLEWARES
//Set Security HTTP Headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Prevent brute force attacks
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!"
});

app.use("/api", limiter);

//Body parser, reading data from body into req.body
//Limit amount of data that can be sent
app.use(express.json({
  limit: "10kb"
}));

//Data sanitization against NoSQL query injection
//Filters out all the data that is not allowed
app.use(mongoSanitizer());

//Data sannitization against XSS
//Clean user inputs from malicious code
//Converts HTML to plain text
app.use(xss());

//Serving static files
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
