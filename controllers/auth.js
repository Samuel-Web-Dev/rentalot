const User = require('../models/user')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const { validationResult } = require('express-validator/check')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "samlekchris@gmail.com",
      pass: "xqup rhln fhae rxqx",
    },
    tls: {
        rejectUnauthorized: false
    }
  });

exports.getSignup = (req, res, next) => {
    res.render('./auth/signup', {
        docTitle: 'SignUp',
        errorMessage: '',
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
    })
}

exports.postSignup = (req, res, next) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).render("auth/signup", {
           path: "/signup",
           pageTitle: "SignUp",
           errorMessage: errors.array()[0].msg,
           oldInput: {
               name,
               email,
               password,
               confirmPassword
           },
           validationErrors: errors.array(),
         });
      }

    bcrypt.hash(password, 12)
    .then((hashPassword) => {
        const user = new User({
            name: name,
            email: email,
            password: hashPassword,
            confirmPassword: confirmPassword
        })
        return user.save()
    }).then((user) => {
        req.session.user = user
        res.redirect('/upload-profile')
        return transporter.sendMail({
            from: 'Erinoluwa@gmail.com', // sender address
            to: email, // list of receivers
            subject: "Successfully", // Subject line
            html: "<b style='color: green'>Account Created Successfully</b>", 
    })
}).catch(err => {
    console.log(err)
})
}

exports.getUploadProfile = (req, res, next) => {
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('./auth/upload-profile', {
        docTitle: 'Upload Profile',
        errorMessage: message,
    })
}

exports.postUploadProfile = (req, res, next) => {
    if(!req.file) {
        return req.flash("error", "Choose an image");
    }
    const profile = req.file.path
    const userId = req.user._id

    User.findById(userId)
    .then(user => {
        if(!user) {
            return req.flash("error", "User Not Found, Signup to update profile");
        }
        user.profilePic = profile
        req.session.user.profilePic = profile
        req.session.isLoggedIn = false
        return user.save()
    }).then(() => {
        res.redirect('/login')
    }).catch(err => {
        console.log('Error Uploading image')
    })
}

exports.getLogin = (req, res, next) => {
    let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
    res.render('./auth/login', {
        docTitle: 'Login',
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
        },
        validationErrors: []
    })
}


exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        console.log(errors.array())
        return res.status(422).render("auth/login", {
           docTitle: "Login",
           errorMessage: errors.array()[0].msg,
           oldInput: {
               email,
               password,
           },
           validationErrors: errors.array(),
         });
      }

    User.findOne({email: email}).then(user => {
        if(!user) {
            return res.status(422).render("auth/login", {
                docTitle: "Login",
                errorMessage: 'Invalid email or password',
                oldInput: {
                    email,
                    password,
                }
              });
        }


        return bcrypt.compare(password, user.password)
               .then((doMatch) => {
                  if(!doMatch) {
                    req.flash("error", "Invalid email or password");
                     return res.redirect('/login')
                  }

                  req.session.isLoggedIn = true
                  req.session.user = user
                  req.session.save(() => {
                    return res.redirect('/')
                  })
               }).catch(err => {
                 console.log(err)
               })
    }).catch(err => {
        console.log(err)
    })
}


exports.getResetPassword = (req, res, next) => {
    res.render('./auth/reset', {
        docTitle: 'Reset Password',
        errorMessage: '',
        oldInput: {
            email: ''
        }
    })
}


exports.postResetPassword = (req, res, next) => {
    const email = req.body.email;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("auth/reset", {
            docTitle: "Reset",
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email,
            }
        });
    }

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');
        User.findOne({ email: email })
            .then((user) => {
                if (!user) {
                    return res.status(422).render("./auth/reset", {
                        docTitle: "Login",
                        errorMessage: 'User with this email not Found',
                        oldInput: {
                            email
                        }
                    });
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then((result) => {
                res.redirect('/');
                return transporter.sendMail({
                    from: 'Erinoluwa', // sender address
                    to: email, // list of receivers
                    subject: "Reset Password", // Subject line
                    html: `<p>You requested a password reset</p>
                           <p>Click this <a href='http://localhost:3000/reset/${token}'>link</a> to set a new password</p>`,
                });
            })
            .catch(err => {
                console.log(err);
            });
    });
};



exports.getNewPassword = (req, res, next) => {
    const token = req.params.token
    User.findOne({
        resetToken: token,
        resetTokenExpiration: {$gt: Date.now()}
    }).then(user => {
        if(!user) {
            console.log('User not Found')
            return res.redirect('/reset')
        }

        res.render('./auth/new-password', {
            docTitle: 'New Password',
            userId: user._id.toString(),
            passwordToken: token,
            oldInput: {
                password: '',
                confirmPassword: ''
            }
        })
    })
}



exports.postNewPassword = (req, res, next) => {
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const passwordToken = req.body.passwordToken;
    const userId = req.body.userId;
    const errors = validationResult(req);
    let resetUser;

    if(!errors.isEmpty()){
        return res.status(422).render("./auth/new-password", {
           docTitle: "Login",
           errorMessage: errors.array()[0].msg,
           oldInput: {
               password,
               confirmPassword,
           },
         });
      }


    User.findOne({ _id: userId, resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                console.log('User not found or token expired');
                return res.redirect('/reset');
            }

            resetUser = user;
            return bcrypt.hash(password, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.confirmPassword = confirmPassword
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then((user) => {
            req.session.user = user
           return res.redirect('/login');
        })
        .catch(err => {
            console.log(err);
            next(err);
        });
};



exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err)
        return res.redirect('/')
    })
}