const Product = require("../models/product");
const Order = require("../models/order");
const PdfDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(`${process.env.STRIPE_KEY}`);
const PRODUCTS_PER_PAGE = 3;

// SHOP

exports.getShop = async (req, res) => {
  const pageIndex = req.query.page;
  try {
    const products = await Product.find()
      .skip((pageIndex - 1) * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE);
    const noOfProducts = await Product.find().countDocuments();
    const noOfPages = Math.ceil(noOfProducts / 3);
    res.render("shop/index", {
      pageTitle: "Shop",
      path: "/",
      products: products,
      pageIndex: pageIndex,
      noOfPages: noOfPages,
    });
  } catch (err) {
    console.log(err);
  }
};

// PRODUCTS PAGE

exports.getProducts = async (req, res) => {
  const pageIndex = req.query.page;
  const products = await Product.find()
    .skip((pageIndex - 1) * PRODUCTS_PER_PAGE)
    .limit(PRODUCTS_PER_PAGE);
  const noOfProducts = await Product.find().countDocuments();
  const noOfPages = Math.ceil(noOfProducts / 3);
  res.render("shop/product-list", {
    pageTitle: "All Products",
    path: "/products",
    products: products,
    pageIndex: pageIndex,
    noOfPages: noOfPages,
  });
};

// DETAILS PAGE

exports.getProduct = async (req, res) => {
  const _id = req.params._id;
  try {
    const singleProduct = await Product.findById(_id);
    res.render(`shop/details`, {
      product: singleProduct,
      path: `Details`,
      pageTitle: "Product Details",
    });
  } catch (err) {
    console.log(err);
  }
};

// CHECKOUT

exports.getCheckout = (req, res) => {
  req.user.loadCart(async (cartProducts, totalPrice) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: cartProducts.map((cartProd) => {
        const { name, price, qty } = cartProd;
        return {
          quantity: qty,
          price_data: {
            unit_amount: price * 100,
            currency: "inr",
            product_data: {
              name: name,
            },
          },
        };
      }),
      success_url: `${req.protocol}://${req.get("host")}/checkout-success`,
      cancel_url: `${req.protocol}://${req.get("host")}/checkout`,
    });
    res.render("shop/checkout", {
      pageTitle: "Checkout",
      path: "/checkout",
      cartProducts: cartProducts,
      totalPrice: totalPrice,
      stripeUrl: session.url,
    });
  });
};

// ORDERS

exports.getOrders = async (req, res) => {
  const orders = await Order.find({ "user.userId": req.user._id });
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "My Orders",
    orders: orders,
  });
};

exports.postOrders = async (req, res) => {
  const { _id } = req.user;
  await req.user.loadCart(async (orderProducts, totalPrice) => {
    const orderItems = orderProducts.map((item) => {
      return { _id: item._id, qty: item.qty, name: item.name };
    });
    const order = new Order({
      items: orderItems,
      totalPrice: totalPrice,
      user: { userId: _id },
    });
    await order.save();
    req.user.cart.items = [];
    req.user.save();
  });
  res.redirect("/orders");
};

exports.getInvoice = async (req, res, next) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId);
  if (order.user.userId.equals(req.user._id)) {
    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join("data", "invoice", invoiceName);
    const pdfDoc = new PdfDocument();

    pdfDoc.pipe(fs.createWriteStream(invoicePath));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=${invoiceName}`);
    pdfDoc.pipe(res);

    pdfDoc.text("Invoice", { align: "center" });
    pdfDoc.text("----------------------------------", {
      align: "center",
    });
    for (let i = 0; i < order.items.length; i++) {
      const product = await Product.findById(order.items[i]._id);
      pdfDoc.text(`Product Name : ${product.name}`);
      pdfDoc.text(`Product Quantity : ${order.items[i].qty}`);
      pdfDoc.text(`Product Price : $${product.price}`);
      pdfDoc.text("----------------------------------", {
        align: "center",
      });
    }
    pdfDoc.text(`Total Price : $${order.totalPrice}`);
    pdfDoc.end();
  } else {
    next(new Error("You didn't place that order !"));
  }
};

// CART

exports.getCart = (req, res) => {
  req.user.loadCart(async (cartProducts, totalPrice) => {
    res.render("shop/cart", {
      pageTitle: "Cart",
      path: "/cart",
      cartProducts: cartProducts,
      totalPrice: totalPrice,
    });
  });
};

exports.postCart = async (req, res) => {
  const _id = req.params._id;
  await req.user.addToCart(_id);
  res.redirect("/cart");
};

exports.postRemoveCartProduct = async (req, res) => {
  const _id = req.params._id;
  await req.user.deleteCartProduct(_id);
  res.redirect("/cart");
};
