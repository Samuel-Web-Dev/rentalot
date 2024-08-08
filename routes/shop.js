const express = require('express')

const routes = express.Router()

const shopController = require('../controllers/shop')

routes.get('/', shopController.getProducts)

routes.get('/products/category/:category', shopController.getProducts);

routes.get('/products/product-detail/:detail', shopController.getProductDetail)



module.exports = routes