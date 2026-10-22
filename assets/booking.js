// Business destination only: country code + number, without punctuation.
const BUSINESS_WHATSAPP_NUMBER = "919493984204";

const ServiceBooking = (() => {
  const appliances = ["AC", "Refrigerator", "Washing Machine", "Dishwasher", "Microwave", "Other"];
  const brands = ["Samsung", "LG", "Whirlpool", "Bosch", "IFB", "Godrej", "Haier", "Voltas", "Daikin", "Blue Star", "Panasonic", "Faber", "Elica", "Glen", "Prestige", "Kent", "Aquaguard", "Other"];
  const slots = ["8:30 AM \u2013 11:00 AM", "11:00 AM \u2013 2:00 PM", "2:00 PM \u2013 5:00 PM", "5:00 PM \u2013 8:00 PM", "8:00 PM \u2013 10:15 PM"];
  function today(now = new Date()) {
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
  function normalizePhone(value) { return value.replace(/[\s()-]/g, "").replace(/^(?:\+91|91)(?=\d{10}$)/, ""); }
  function validate(v, minDate = today()) {
    const errors = {};
    for (const key of ["name", "phone", "appliance", "issue", "address", "date", "time"]) {
      if (!String(v[key] || "").trim()) errors[key] = "Please complete this field.";
    }
    if (v.phone && !/^[6-9]\d{9}$/.test(normalizePhone(v.phone))) errors.phone = "Enter a valid 10-digit Indian mobile number (optional +91).";
    if (v.appliance && !appliances.includes(v.appliance)) errors.appliance = "Please select an appliance type.";
    if (v.brand && !brands.includes(v.brand)) errors.brand = "Please select a listed brand or Other.";
    if (v.time && !slots.includes(v.time)) errors.time = "Please select a time slot.";
    if (v.date) {
      const parsed = new Date(`${v.date}T12:00:00`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date) || Number.isNaN(parsed.getTime()) || today(parsed) !== v.date || v.date < minDate) errors.date = "Please choose today or a future date.";
    }
    if (v.maps) {
      try {
        const url = new URL(v.maps);
        const host = url.hostname;
        if (url.protocol !== "https:" || url.username || url.password || !(host === "maps.app.goo.gl" || host === "goo.gl" && url.pathname.startsWith("/maps") || /^(www\.|maps\.)?google\.(com|co\.in)$/.test(host) && (host.startsWith("maps.") || url.pathname.startsWith("/maps")))) throw new Error();
      } catch { errors.maps = "Paste a valid HTTPS Google Maps link, or leave this blank."; }
    }
    return errors;
  }
  function message(v) {
    return `\u{1f6a8} *NEW SERVICE REQUEST* \u{1f6a8}\n\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\u{1f4e1} *Appliance:* ${v.appliance}\n\u{1f527} *Issue:* ${v.issue}\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\n\u{1f464} *Customer:* ${v.name}\n\u{1f4de} *Phone:* ${v.phone}\n\u{1f4cd} *Location:* ${v.address}\n\u{1f5fa}\ufe0f *Maps:* ${v.maps || "Not provided"}\n\u{1f7e1} *Brand:* ${v.brand || "Not provided"}\n\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n\u{1f5d3}\ufe0f *Preferred Date:* ${v.date}\n\u23f0 *Preferred Time:* ${v.time}\n\nPlease contact the customer to confirm the service visit.`;
  }
  function whatsappUrl(v, number = BUSINESS_WHATSAPP_NUMBER) {
    return messageUrl(message(v), number);
  }
  function messageUrl(text, number = BUSINESS_WHATSAPP_NUMBER) {
    if (!/^[1-9]\d{7,14}$/.test(number)) throw new Error("WhatsApp booking is temporarily unavailable. Please call the business to arrange your visit.");
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }
  function openWhatsApp(url, openWindow) {
    let tab;
    try {
      tab = openWindow("about:blank", "_blank");
      if (!tab) return false;
      tab.opener = null;
      tab.location.replace(url);
      return true;
    } catch {
      try { if (tab) tab.close(); } catch { /* The manual link remains available. */ }
      return false;
    }
  }
  function init() {
    const dialog = document.createElement("dialog");
    dialog.className = "service-booking-dialog";
    dialog.id = "service-booking-dialog";
    dialog.setAttribute("aria-labelledby", "service-booking-title");
    dialog.setAttribute("aria-describedby", "service-booking-intro");
    const options = values => values.map(value => `<option>${value}</option>`).join("");
    const field = (key, label, control, required = false) => `<div class="booking-field ${["issue", "address", "maps"].includes(key) ? "booking-full" : ""}"><label for="booking-${key}">${label}${required ? ' <span aria-hidden="true">*</span>' : " (optional)"}</label>${control}<span class="booking-error" id="booking-${key}-error"></span></div>`;
    const attrs = (key, required = false) => `id="booking-${key}" name="${key}" aria-describedby="booking-${key}-error" ${required ? "required" : ""}`;
    dialog.innerHTML = `<div class="booking-dialog-heading"><div><h2 id="service-booking-title">Book a service</h2><p id="service-booking-intro">Tell us what needs attention. Fields marked * are required. Your preferred slot is subject to confirmation.</p></div><button type="button" class="booking-close" aria-label="Close booking form">\u00d7</button></div>
      <form id="service-booking-form" novalidate><div class="booking-fields">
      ${field("name", "Customer Name", `<input ${attrs("name", true)} autocomplete="name" maxlength="100" placeholder="Your full name">`, true)}
      ${field("phone", "Mobile Number", `<input ${attrs("phone", true)} type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="10-digit mobile number">`, true)}
      ${field("appliance", "Appliance Type", `<select ${attrs("appliance", true)}><option value="">Select appliance</option>${options(appliances)}</select>`, true)}
      ${field("brand", "Appliance Brand", `<select ${attrs("brand")}><option value="">Select brand</option>${options(brands)}</select>`)}
      ${field("issue", "Issue Description", `<textarea ${attrs("issue", true)} rows="3" maxlength="2000" placeholder="Describe the problem and appliance model, if known"></textarea>`, true)}
      ${field("address", "Service Location / Full Address", `<textarea ${attrs("address", true)} autocomplete="street-address" rows="2" maxlength="1000" placeholder="House / flat number, street, locality, city and PIN code"></textarea>`, true)}
      ${field("maps", "Google Maps Link", `<input ${attrs("maps")} type="url" maxlength="2000" placeholder="https://maps.app.goo.gl/\u2026">`)}
      ${field("date", "Preferred Date", `<input ${attrs("date", true)} type="date" min="${today()}">`, true)}
      ${field("time", "Preferred Time Slot", `<select ${attrs("time", true)}><option value="">Select preferred time</option>${options(slots)}</select>`, true)}
      </div><p class="booking-submit-note">Visit charge: \u20b9350. Review and send your request in WhatsApp; the team will contact you to confirm the visit.</p><button class="btn btn-primary whatsapp-action" type="submit">Continue to WhatsApp</button><p class="booking-status" role="status" aria-live="polite"></p><a class="booking-fallback text-link" hidden target="_blank" rel="noopener noreferrer">Open your request in WhatsApp</a></form>`;
    document.body.append(dialog);
    const form = dialog.querySelector("form");
    const status = dialog.querySelector(".booking-status");
    const fallback = dialog.querySelector(".booking-fallback");
    let opener;
    function open(trigger, existingForm) {
      opener = trigger;
      form.elements.date.min = today();
      if (existingForm) {
        const prior = new FormData(existingForm);
        for (const [target, source] of [["name", "name"], ["phone", "phone"], ["issue", "concern"]]) {
          if (String(prior.get(source) || "").trim()) form.elements[target].value = prior.get(source);
        }
      }
      const service = existingForm?.dataset.service || trigger.dataset.service || document.querySelector(".booking-form")?.dataset.service;
      if (!form.elements.appliance.value && service) {
        form.elements.appliance.value = appliances.find(type => type !== "Other" && service.toLowerCase().includes(type.toLowerCase())) || "Other";
        if (form.elements.appliance.value === "Other") form.elements.issue.placeholder = `Describe the problem with your ${service.toLowerCase()} appliance`;
      }
      if (!dialog.open) dialog.showModal();
      document.body.classList.add("booking-dialog-open");
      form.elements.name.focus();
    }
    dialog.querySelector(".booking-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => {
      document.body.classList.remove("booking-dialog-open");
      if (opener?.isConnected) opener.focus();
    });
    document.addEventListener("click", event => {
      const trigger = event.target.closest("[data-book-service], a, button");
      if (!trigger || dialog.contains(trigger)) return;
      if (trigger.matches("[data-book-service]") || /^(book a service|book now)$/i.test(trigger.textContent.trim())) {
        event.preventDefault(); open(trigger);
      }
    });
    document.querySelectorAll(".booking-form").forEach(existingForm => {
      existingForm.noValidate = true;
      existingForm.addEventListener("submit", event => {
        event.preventDefault(); open(event.submitter || existingForm.querySelector("button"), existingForm);
      });
    });
    function values() { return Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()])); }
    function showErrors(errors) {
      for (const key of ["name", "phone", "appliance", "brand", "issue", "address", "maps", "date", "time"]) {
        form.elements[key].setAttribute("aria-invalid", errors[key] ? "true" : "false");
        dialog.querySelector(`#booking-${key}-error`).textContent = errors[key] || "";
      }
    }
    form.addEventListener("input", event => {
      fallback.hidden = true; fallback.removeAttribute("href"); status.textContent = "";
      if (event.target.getAttribute("aria-invalid") === "true") showErrors(validate(values()));
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      const v = values();
      const errors = validate(v);
      showErrors(errors);
      fallback.hidden = true;
      if (Object.keys(errors).length) {
        status.textContent = "Please correct the highlighted fields.";
        form.elements[Object.keys(errors)[0]].focus(); return;
      }
      let url;
      try { url = whatsappUrl(v); } catch (error) { status.textContent = error.message; return; }
      fallback.href = url; fallback.hidden = false;
      // Open synchronously during the click. Detach opener before navigating.
      const opened = openWhatsApp(url, window.open.bind(window));
      status.textContent = opened
        ? "Your service request is ready in WhatsApp. Please press Send to submit your request."
        : "Your browser blocked the WhatsApp window. Use the link below to open your request, then press Send to submit it.";
    });
  }
  return { today, normalizePhone, validate, message, whatsappUrl, messageUrl, openWhatsApp, init };
})();
if (typeof module !== "undefined" && module.exports) module.exports = ServiceBooking;
if (typeof document !== "undefined") document.addEventListener("DOMContentLoaded", ServiceBooking.init);
