document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    const closeNav = () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      toggle.textContent = "☰";
    };
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      toggle.textContent = isOpen ? "×" : "☰";
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNav));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        closeNav();
        toggle.focus();
      }
    });
  }
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const openReview = document.querySelector("[data-open-review]");
  const reviewForm = document.getElementById("reviewForm");
  if (openReview && reviewForm) {
    openReview.addEventListener("click", () => {
      reviewForm.classList.toggle("hidden");
      if (!reviewForm.classList.contains("hidden")) reviewForm.scrollIntoView({behavior:"smooth", block:"center"});
    });
    reviewForm.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(reviewForm);
      const message = reviewForm.querySelector(".form-message");
      message.textContent = `Preview created for ${data.get("name")}. This demo does not publish or save reviews.`;
    });
  }

  document.querySelectorAll(".booking-form").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();
      const data = new FormData(form);
      const service = form.dataset.service || "appliance";
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const concern = String(data.get("concern") || "").trim();
      if (!name || !phone) return;
      const message = `Hello Sai Pranay Enterprises, I would like to request ${service} service.%0AName: ${encodeURIComponent(name)}%0APhone: ${encodeURIComponent(phone)}%0AIssue: ${encodeURIComponent(concern || "Please contact me")}`;
      const status = form.querySelector(".form-status");
      if (status) status.textContent = "Opening WhatsApp with your request. Please review and send the message to confirm your booking.";
      window.open(`https://wa.me/919347533932?text=${message}`, "_blank", "noopener");
    });
  });
});
