const deleteProduct = async (btn) => {
  const productId = btn.parentNode.querySelector("[id=productId]").value;
  const csrfToken = btn.parentNode.querySelector("[id=csrf]").value;
  const itemCard = btn.closest(".item__card");

  try {
    const result = await fetch(`/admin/delete-product/${productId}`, {
      method: "DELETE",
      headers: {
        "csrf-token": csrfToken,
      },
    });
    itemCard.remove();
  } catch (err) {
    console.log(err);
  }
};
