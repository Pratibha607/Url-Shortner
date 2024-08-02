const User = require("../models/user");
const { v4: uuidv4 } = require("uuid");
const { setUser } = require("../service/auth");

//handle for signup
async function handleUserSignup(req, res) {
  const { name, mobile, email, password } = req.body;
  await User.create({
    name,
    mobile,
    email,
    password,
  });
  return res.redirect("/");
}

//handle for login
async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user)
    return res.render("login", {
      error: "invalid Username or password",
    });
  const token=setUser(user);
  res.cookie("uid", token);
  return res.redirect("/");


}
module.exports = { handleUserSignup, handleUserLogin };
