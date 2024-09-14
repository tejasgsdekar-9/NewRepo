if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}


//setting ejs
const methodOverride = require("method-override");
const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


//views
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({
    extended: true
}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//Setting mongoose
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const { error } = require("console");
const dbUrl = "mongodb+srv://tejasgadekar108:x0gNzENhtQW9JtAi@cluster69.qfdpa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster69";
async function main() {
    await mongoose.connect(dbUrl);
}
main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });
const store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret: process.env.SECRET,
        },
        touchAfter: 24 * 3600,
});

store.on("error",()=>{
    console.log("ERROR in mongo session",err)
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        express: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// app.get("/", (req, res) => {
//     res.send("hi, i am root");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// all url calls

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;

    next();
});




app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found :("));
});

app.use((err, req, res, next) => {
    let {
        statusCode = 500, message = "Something went wrong!"
    } = err;
    res.render("error.ejs", {
        message
    });
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});
