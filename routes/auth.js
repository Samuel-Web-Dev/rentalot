const express = require("express");
const { check, body } = require("express-validator/check");

const routes = express.Router();

const authController = require("../controllers/auth");
const User = require('../models/user')

routes.get("/signup", authController.getSignup);

routes.post("/signup", [
  body('name').trim().isAlpha('en-US', { ignore: ' ' }).withMessage('Please Input a valid name without numbers and spaces'),
  check("email").isEmail().withMessage("Please enter a valid Email").custom((value, { req }) => {
  return User.findOne({ email: value }).then((userDoc) => {
      if (userDoc) {
        return Promise.reject(
          "E-mail Already exists, please pick a different one"
        );
      }
    });
}),
  

body(
  "password",
  "Please enter a password with at least 5 characters and only numbers and letters"
)
  .isLength({ min: 5 })
  .isAlphanumeric(),

  body('confirmPassword').custom((value, {req}) => {
     if(value !== req.body.password){
      throw new Error("Password have to match");
     }
     return true
  })
] ,authController.postSignup);

routes.get("/login", authController.getLogin);

routes.post("/login",[
  body('email', 'Please enter a valid email').isEmail(),
  body(
    "password",
    "Wrong password"
  )
    .isLength({ min: 5 })
    .isAlphanumeric(),
], authController.postLogin);

routes.get("/upload-profile", authController.getUploadProfile);

routes.post("/upload-profile", authController.postUploadProfile);

routes.get("/reset", authController.getResetPassword);

routes.post("/reset",[
  body('email').isEmail().withMessage('Invalid Email')
], authController.postResetPassword);

routes.get("/reset/:token", authController.getNewPassword);

routes.post("/new-password",[
  body(
    "password",
    "Please enter a password with at least 5 characters and only numbers and letters"
  )
    .isLength({ min: 5 })
    .isAlphanumeric(),
  
    body('confirmPassword').custom((value, {req}) => {
       if(value !== req.body.password){
        throw new Error("Password have to match");
       }
       return true
    })
], authController.postNewPassword);

routes.post("/logout", authController.postLogout);

module.exports = routes;
