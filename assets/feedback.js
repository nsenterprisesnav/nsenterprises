const CustomerFeedback = (() => {
  function message(values) {
    return `*CUSTOMER FEEDBACK*\n\n*Customer:* ${values.name}\n*Appliance:* ${values.appliance}\n\n*Review:*\n${values.review}\n\nShared with the Ns Enterprises team.`;
  }
  function validate(values) {
    const errors = {};
    for (const key of ['name', 'appliance', 'review']) {
      if (!String(values[key] || '').trim()) errors[key] = 'Please complete this field.';
    }
    return errors;
  }
  function init() {
    const dialog = document.getElementById('feedback-dialog');
    if (!dialog) return;
    const form = document.getElementById('reviewForm');
    const status = form.querySelector('.form-message');
    const fallback = form.querySelector('.booking-fallback');
    let opener;
    document.querySelectorAll('[data-open-review]').forEach(button => {
      button.addEventListener('click', () => {
        opener = button;
        dialog.showModal();
        document.body.classList.add('booking-dialog-open');
        form.elements.name.focus();
      });
    });
    dialog.querySelector('.booking-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.body.classList.remove('booking-dialog-open');
      opener?.focus();
    });
    form.addEventListener('input', event => {
      status.textContent = '';
      fallback.hidden = true;
      fallback.removeAttribute('href');
      const key = event.target.name;
      if (key && event.target.value.trim()) {
        event.target.removeAttribute('aria-invalid');
        document.getElementById(`feedback-${key}-error`).textContent = '';
      }
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      fallback.hidden = true;
      const values = Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, value.trim()]));
      const errors = validate(values);
      for (const key of ['name', 'appliance', 'review']) {
        form.elements[key].setAttribute('aria-invalid', errors[key] ? 'true' : 'false');
        document.getElementById(`feedback-${key}-error`).textContent = errors[key] || '';
      }
      if (Object.keys(errors).length) {
        status.textContent = 'Please complete the highlighted fields.';
        form.elements[Object.keys(errors)[0]].focus();
        return;
      }
      let url;
      try { url = ServiceBooking.messageUrl(message(values)); }
      catch { status.textContent = 'WhatsApp feedback is temporarily unavailable. Please contact the business by phone.'; return; }
      fallback.href = url;
      fallback.hidden = false;
      const opened = ServiceBooking.openWhatsApp(url, window.open.bind(window));
      status.textContent = opened
        ? 'Your feedback is ready in WhatsApp. Please press Send to share it with our team.'
        : 'Your browser blocked the WhatsApp window. Use the link below, then press Send to share your feedback.';
    });
  }
  return {message, validate, init};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = CustomerFeedback;
if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', CustomerFeedback.init);
