if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}


const express= require("express");
const app = express();

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

const mongoose = require("mongoose");

async function main(){
    await mongoose.connect(dbUrl);
}
main().then(()=>{
    console.log("connected to DB");
}).catch(()=>{
    console.log(err);
});


const ejsMate =require("ejs-mate");
app.engine('ejs', ejsMate);

const path =require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({extended:true}));

const methodOverride= require("method-override");
app.use(methodOverride("_method"));

const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// sessions
const session = require("express-session");
const MongoStore = require('connect-mongo');
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24* 3600,  // seconds
});
store.on("error", ()=>{
    console.log("ERROR in MONGO SESSION STORE", err);
})
const sessionOptions = {
    store:store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true
    }
};
app.use(session(sessionOptions));

// passport configuration 
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());






// app.get("/", (req,res)=>{
// // console.log("Hi i am root");
// res.send("I am root");
// });


// for flash
const flash = require("connect-flash");
app.use(flash());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    // console.log(res.locals.success);
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// demo user fro singnup functions

// app.get("/demouser", async(req, res)=>{
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username:"delta-student",
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser)

// })

app.use("/listings", listingRouter);

app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);








// app.get("/testListing", async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"calangute, Goa",
//         country:"India",
//     });
   
//      await sampleListing.save();
//      console.log("sample was saved");
//      res.send("successful testing");

// });

// error for random page
app.all("/*", (req, res, next)=>{
    next(new ExpressError(404,"Page not found"));
})



app.use((err, req, res, next)=>{
    let{statusCode=500, message="something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
    // console.log(err);
    console.log("error occured");
})

app.listen(8080, (req,res)=>{
    console.log("server start on port 8080");
})