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

  // Photo viewer: each gallery (or single figure) is its own set
  var photoLinks = document.querySelectorAll("[data-viewer]");
  if (photoLinks.length && typeof HTMLDialogElement === "function") {
    var viewer = document.createElement("dialog");
    viewer.className = "viewer";
    viewer.setAttribute("aria-label", "Photo viewer");
    viewer.innerHTML =
      '<figure class="viewer-figure"><img alt="">' +
      '<figcaption><span class="viewer-caption"></span><span class="viewer-meta"></span><span class="viewer-count"></span></figcaption></figure>' +
      '<button type="button" class="viewer-btn viewer-prev" aria-label="Previous photo">&larr;</button>' +
      '<button type="button" class="viewer-btn viewer-next" aria-label="Next photo">&rarr;</button>' +
      '<button type="button" class="viewer-btn viewer-close">Close</button>';
    document.body.appendChild(viewer);

    var vImg = viewer.querySelector("img");
    var vCaption = viewer.querySelector(".viewer-caption");
    var vMeta = viewer.querySelector(".viewer-meta");
    var vCount = viewer.querySelector(".viewer-count");
    var vPrev = viewer.querySelector(".viewer-prev");
    var vNext = viewer.querySelector(".viewer-next");
    var set = [];
    var current = 0;

    var show = function (i) {
      current = (i + set.length) % set.length;
      var link = set[current];
      vImg.src = link.href;
      vImg.alt = link.querySelector("img").alt;
      vCaption.textContent = link.dataset.caption || "";
      vMeta.textContent = link.dataset.meta || "";
      vCount.textContent = set.length > 1 ? (current + 1) + " / " + set.length : "";
      vPrev.hidden = vNext.hidden = set.length < 2;
    };

    photoLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var group = link.closest(".gallery, .photo");
        set = Array.prototype.slice.call(group.querySelectorAll("[data-viewer]"));
        show(set.indexOf(link));
        viewer.showModal();
      });
    });

    vPrev.addEventListener("click", function () { show(current - 1); });
    vNext.addEventListener("click", function () { show(current + 1); });
    viewer.querySelector(".viewer-close").addEventListener("click", function () { viewer.close(); });
    viewer.addEventListener("click", function (e) {
      if (e.target === viewer || e.target.classList.contains("viewer-figure")) viewer.close();
    });
    viewer.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
    viewer.addEventListener("close", function () { vImg.removeAttribute("src"); });
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
