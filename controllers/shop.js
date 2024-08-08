const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
    const category = req.params.category;
    const page = parseInt(req.query.page) || 1;
    const ITEMS_PER_PAGE = 8;

    let query = {};
    if (category && category !== 'All') {
        query.category = category;
    }

    Product.find(query)
        .populate('userId')
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .then((products) => {
            return Product.countDocuments(query).then((count) => {
                const response = {
                    products,
                    currentPage: page,
                    hasNextPage: ITEMS_PER_PAGE * page < count,
                    hasPreviousPage: page > 1,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(count / ITEMS_PER_PAGE),
                };


                if (req.xhr || req.headers.accept.indexOf('json') > -1) { // Ensure AJAX request
                    res.json(response);
                } else {
                    res.render('shop/shop', {
                        docTitle: 'Shop',
                        prods: products,
                        currentPage: page,
                        hasNextPage: ITEMS_PER_PAGE * page < count,
                        hasPreviousPage: page > 1,
                        nextPage: page + 1,
                        previousPage: page - 1,
                        lastPage: Math.ceil(count / ITEMS_PER_PAGE),
                        isAuthenticated: req.session.isLoggedIn,
                        currentCategory: category || 'All'
                    });
                }
            });
        })
        .catch((err) => {
            console.error('Error fetching products:', err);
            res.status(500).json({ message: "Fetching products failed." });
        });
};

exports.getProductCategory = (req, res, next) => {
  const category = req.params.category;

  let query = {};
  if (category !== "All") {
    query.category = category;
  }

  Product.find(query)
    .populate("userId")
    .then((products) => {
      res.json({ products });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Fetching products failed." });
    });
};

exports.getProductDetail = (req, res, next) => {
  const prodId = req.params.detail;
  Product.findById(prodId)
    .populate("userId")
    .then((product) => {
      if (!product) {
        console.log("Unable to find product");
      }
      res.render("./shop/product-detail", {
        docTitle: "Product Details",
        product: product,
      });
    });
};
