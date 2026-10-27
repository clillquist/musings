(function () {
  var root = document.documentElement;

  // Theme switch: light / dark / system
  function storedTheme() {
    try { return localStorage.getItem("theme") || "system"; } catch (e) { return "system"; }
  }
  function applyTheme(theme) {
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try {
      if (theme === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", theme);
    } catch (e) {}
    document.querySelectorAll("[data-theme-set]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.themeSet === theme));
    });
  }
  document.querySelectorAll("[data-theme-set]").forEach(function (b) {
    b.addEventListener("click", function () { applyTheme(b.dataset.themeSet); });
  });
  applyTheme(storedTheme());

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var sidebar = document.getElementById("sidebar");
  if (toggle && sidebar) {
    toggle.addEventListener("click", function () {
      var open = sidebar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sidebar.classList.contains("is-open")) {
        sidebar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // "On this page" rail built from h2/h3 headings
  var toc = document.querySelector("[data-toc]");
  var headings = Array.prototype.slice.call(document.querySelectorAll(".sheet .prose h2[id], .sheet .prose h3[id]"));
  if (!toc || headings.length < 2) return;

  var list = toc.querySelector("ol");
  var links = headings.map(function (h) {
    var li = document.createElement("li");
    li.className = "depth-" + h.tagName.charAt(1);
    var a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
    return a;
  });
  toc.hidden = false;

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var i = headings.indexOf(entry.target);
        links.forEach(function (l, j) { l.classList.toggle("is-active", i === j); });
      });
    }, { rootMargin: "0px 0px -70% 0px" });
    headings.forEach(function (h) { observer.observe(h); });
  }
})();
