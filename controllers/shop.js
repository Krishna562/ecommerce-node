const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const PdfDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(`${process.env.STRIPE_KEY}`);

// GET ALL PRODUCTS

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate("reviews.userId");
    res.json({ products });
  } catch (err) {
    next(err);
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

// GET ALL CATEGORIES

exports.getAllCategories = async (req, res) => {
  res.json({
    categories: [
      "Electronics",
      "Clothes",
      "Sports items",
      "Footwear",
      "Accessories",
    ],
  });
};

// ADD REVIEW

exports.addReview = async (req, res) => {
  const { stars, comment } = req.body;
  const productId = req.params.productId;
  const userId = req.userId;
  try {
    const product = await Product.findById(productId);
    const review = {
      stars,
      comment,
      userId,
    };
    product.reviews.push(review);
    await product.save();

    const products = await Product.find().populate("reviews.userId");
    res.json({ updatedProducts: products });
  } catch (err) {
    next(err);
  }
};
