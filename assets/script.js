document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    const closeNav = () => {
      nav.classList.remove("open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    };
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNav));
    document.addEventListener("click", event => {
      if (nav.classList.contains("open") && !nav.contains(event.target) && !toggle.contains(event.target)) closeNav();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        closeNav();
        toggle.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024 && nav.classList.contains("open")) closeNav();
    });
    window.addEventListener("pageshow", closeNav);

    // Keep the highlighted navigation item in sync with the visible homepage section.
    const homeLink = [...nav.querySelectorAll("a")].find(link => !new URL(link.href, window.location.href).hash);
    const sectionLinks = [...nav.querySelectorAll('a[href*="#"]')]
      .map(link => ({ link, section: document.getElementById(new URL(link.href, window.location.href).hash.slice(1)) }))
      .filter(item => item.section);
    if (sectionLinks.length) {
      const setActiveLink = activeLink => {
        nav.querySelectorAll("a.active").forEach(link => {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
        });
        if (activeLink) {
          activeLink.classList.add("active");
          activeLink.setAttribute("aria-current", "page");
        }
      };
      let framePending = false;
      const updateActiveSection = () => {
        framePending = false;
        const marker = window.scrollY + Math.min(window.innerHeight * .35, 240);
        let activeLink = homeLink;
        sectionLinks.forEach(item => {
          if (item.section.offsetTop <= marker) activeLink = item.link;
        });
        setActiveLink(activeLink);
      };
      const requestActiveUpdate = () => {
        if (!framePending) {
          framePending = true;
          window.requestAnimationFrame(updateActiveSection);
        }
      };
      sectionLinks.forEach(item => item.link.addEventListener("click", () => setActiveLink(item.link)));
      window.addEventListener("scroll", requestActiveUpdate, { passive: true });
      window.addEventListener("resize", requestActiveUpdate);
      window.addEventListener("hashchange", requestActiveUpdate);
      window.addEventListener("pageshow", requestActiveUpdate);
      updateActiveSection();
    }
  }
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

});
