const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth')

router.get('/dashboard', isAuth, adminController.getDashboard);

router.get('/add-product', isAuth, adminController.getAddproduct);

router.post('/add-product', isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct)

router.post('/delete-product', isAuth, adminController.postDeleteProduct)

module.exports = router;
