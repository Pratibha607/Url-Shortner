require("dotenv").config();
const express = require("express");
const { connectToMongoDB } = require("./connect");
const URL = require("./models/url");
const path = require("path");
const cookieparser = require("cookie-parser");
const { restrictToLoggedInUserOnly, checkAuth } = require("./middlewares/auth");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouters");
const userRoute = require("./routes/user");

const app = express();
const PORT = process.env.PORT;

connectToMongoDB(process.env.MONGO_URL).then(() =>
  console.log("Mongodb connected")
);
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());

app.get("/test", async (req, res) => {
  const allurls = await URL.find({});
  return res.render("home", {
    urls: allurls,
  });
});

app.use("/url", restrictToLoggedInUserOnly, urlRoute); // restrictToLoggedInUserOnly is used to restrict it without user
app.use("/user", userRoute);
app.use("/", checkAuth, staticRoute);

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  try {
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      }
    );
    if (entry) {
      res.redirect(entry.redirectURL);
    } else {
      // Handle the case where no entry is found for the given shortId
      res.status(404).send("Not Found");
    }
  } catch (error) {
    // Handle database query/update errors
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
