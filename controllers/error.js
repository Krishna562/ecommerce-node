exports.get404Page = (req, res) => {
  res.status(404).render("error/pageNotFound", {
    pageTitle: "404",
    path: "/404",
  });
};

exports.get500Page = (req, res) => {
  res
    .status(500)
    .render("error/error500", { pageTitle: "Error!", path: "/500" });
};
