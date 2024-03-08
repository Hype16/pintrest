var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

router.get("/", async function (req, res) {
  const posts = await postModel.find();
  res.render("feed", { posts });
});

router.get("/login", function (req, res) {
  res.render("login", { error: req.flash("error") });
});

router.get("/registration", function (req, res) {
  res.render("index");
});

router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("post");
  console.log(user);
  res.render("profile", { user });
});

router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    user.dp = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);

router.post(
  "/upload",
  isLoggedIn,
  upload.single("file"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(404).send("No files were Uploaded.");
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const postdata = await postModel.create({
      image: req.file.filename,
      imagetext: req.body.filecaption,
      user: user._id,
    });

    user.post.push(postdata._id);
    await user.save();
    res.send("Done");
  }
);
router.post("/register", function (req, res) {
  const userData = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullName: req.body.fullname,
  });
  userModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  });
});
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

module.exports = router;
