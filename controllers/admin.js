const Product = require('../models/product')
const deleteFromFile = require('../util/file');

exports.getDashboard = (req, res, next) => {
  const ITEMS_PER_PAGE = 4
  const page = +req.query.page || 1
  let totalItems;
  Product.find({userId: req.user._id})
    .countDocuments()
    .then(numProducts => {
      totalItems = numProducts;
      return Product.find({userId: req.user._id})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE); 
    })
    .then((products) => {
      res.render('admin/dashboard', {
        prods: products,
        user: req.user,
        docTitle: "Dashboard",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch((err) => console.log(err));
};

exports.getAddproduct = (req, res, next) => {
    res.render('admin/addproduct', {
        docTitle: 'Add Product',
        user: req.user
    });
};


exports.postAddProduct = (req, res, next) => {
    const name = req.body.name
    const category = req.body.category
    const price = req.body.price
    const contact = req.body.contact
    const description = req.body.description
    const imageUrl = req.file
    const date = req.body.date

    if(!imageUrl) {
        return console.log('Attached file not an image')
      }

      const image = imageUrl.path;

    const product = new Product({
        name: name,
        category: category,
        price: price,
        contact: contact,
        description: description,
        imageUrl: image,
        date: date,
        userId: req.user._id
    })
     product.save().then(() => {
      console.log('Product created successfully')
      return res.redirect('/')
    }).catch(err => {
        console.log(err)
    })
}


exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId
    Product.findById(productId).then((product) => {
        if(!product) {
            return res.redirect('/admin/dashboard')
        }
        res.render('admin/edit-product', {
            docTitle: 'Edit Product',
            product: product,
            user: req.user
        })
    })
}


exports.postEditProduct = (req, res, next) => {
    const name = req.body.name
    const category = req.body.category
    const price = req.body.price
    const contact = req.body.contact
    const description = req.body.description
    const imageUrl = req.file
    const date = req.body.date
    const prodId = req.body.productId
    
    Product.findById(prodId).then((product) => {
        if(product.userId.toString() !== req.user._id.toString()) {
            console.log('You Can\'t edit this product')
            return res.redirect('/')
        }

        product.name = name
        product.category = category
        product.price = price
        product.contact = contact
        product.description = description

        if (date && date.trim() !== '') {
            product.date = date;
        }

        if(imageUrl) {
            deleteFromFile(product.imageUrl)
            product.imageUrl = imageUrl.path
        }

        return product.save().then(result => {
            res.redirect('/admin/dashboard')
           })
    }).catch(err => {
        console.log(err)
    })

}


exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId

    Product.findById(prodId).then((product) => {
        if(!product) {
            return next(new Error('Product Not found'))
        }

        deleteFromFile(product.imageUrl)
        return Product.deleteOne({_id: prodId, userId: req.user._id})
    }).then(() => {
        res.redirect('/admin/dashboard')
    }).catch(err => {
        console.log(err)
    })
}