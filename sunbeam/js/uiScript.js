var burgerMenu = document.querySelector(".burger");
var headerMenu = document.querySelector(".header__menu");
burgerMenu.addEventListener("click", function () {
  this.classList.toggle("close");
  headerMenu.classList.toggle("overlay");
});

var menuItems = document.querySelectorAll(".menu__item");
menuItems.forEach((item) =>
  item.addEventListener("click", function ({ target }) {
    menuItems.forEach((i) => i.classList.remove("active"));
    target.classList.toggle("active");
  })
);
