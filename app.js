const express = require('express')
const mongoose = require('mongoose')
const pug = require('pug')
const path = require('path')
const multer = require('multer')
const session = require('express-session')
const MongoDbStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
const app = express()
const helmet = require('helmet')
const compression = require('compression')
const crypto = require('crypto')

const User = require('./models/user')

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; script-src 'self' https://cdn.jsdelivr.net; script-src-elem 'self' https://cdn.jsdelivr.net; script-src-attr 'self' https://cdn.jsdelivr.net; connect-src 'self'; base-uri 'self';");
    next();
});

  

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB__USER}:${process.env.MONGODB__PASSWORD}@first-project.y8uqnxq.mongodb.net/${process.env.MONGODB__DATABASE}?retryWrites=true&w=majority&appName=first-project`

const store = new MongoDbStore({
    uri: MONGODB_URI,
    collection: 'sessions'
})

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
       cb(null, 'images')
    },
    filename: (req, file, cb) => {
        const date = new Date().toISOString().replace(/:/g, '-');
        cb(null, date + '-' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){ 
        cb(null, true)
     } else {
        cb(null, false)
     }
}

app.use(helmet())
app.use(compression())

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; script-src 'self'; connect-src 'self'; base-uri 'self';");
    next();
});

app.use(flash())

app.use(express.urlencoded({extended: false}))
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const adminRouter = require('./routes/admin')
const shopRouter = require('./routes/shop')
const authRouter = require('./routes/auth') 
const errorControllers = require('./controllers/error')

app.use(session({
    store: store,
    saveUninitialized: false,
    resave: false,
    secret: 'my secret, do not share it out'
}))

app.use((req, res, next) => {
   if(!req.session.user) {
    console.log('No user in session')
    return next();
   } 

   User.findById(req.session.user._id)
   .then(user => {
    if (!user) {
        console.log('User not found');
        return next();
    }
     req.user = user
     next()
   }).catch(err => {
     console.log(err)
   })
})

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader('Content-Security-Policy', `default-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; script-src 'self' 'nonce-${res.locals.nonce}' https://cdn.jsdelivr.net; connect-src 'self'; base-uri 'self';`);
    next();
})

app.use('/admin', adminRouter)
app.use(shopRouter)
app.use(authRouter)

app.use((errors, req, res, next) => {
    console.log(errors);
})

app.use(errorControllers.get404)

mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
}).then(() => {
    console.log('Successfully connected to database')
    app.listen(3000)
})