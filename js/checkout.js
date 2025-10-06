(function () {
  // --- helpers
  const qs = (s) => document.querySelector(s);
  const qsa = (s) => Array.from(document.querySelectorAll(s));
  const getLS = (k) => JSON.parse(localStorage.getItem(k)) || [];

  // elements
  const summaryContainer = qs("#summary-items");
  const totalEl = qs("#checkout-total");
  const form = qs("#checkout-form");
  const successMessage = qs("#success-message");
  const placeBtn = qs("#place-order");

  // fields & errors
  const nameEl = qs("#name"),
    emailEl = qs("#email"),
    addressEl = qs("#address");
  const paymentInputs = qsa('input[name="payment-method"]');
  const cardDetails = qs("#card-details");
  const cardName = qs("#card-name"),
    cardNumber = qs("#card-number"),
    cardExp = qs("#card-exp"),
    cardCvv = qs("#card-cvv");

  // error nodes
  const err = (id) => qs("#" + id);

  // load cart items (robust: supports .title or .name; .image or .img)
  let cartItems = getLS("cartItems").map((ci) => ({
    id: ci.id ?? ci.productId ?? ci._id ?? "",
    title: ci.title ?? ci.name ?? "Untitled product",
    image: ci.image ?? ci.img ?? "",
    price: Number(ci.price ?? 0),
    quantity: Number(ci.quantity ?? 1),
  }));

  // render summary with images, title, qty, price & subtotal
  function renderSummary() {
    if (!cartItems.length) {
      summaryContainer.innerHTML = "<p>Your cart is empty.</p>";
      totalEl.textContent = "0.00";
      placeBtn.disabled = true;
      return;
    }
    placeBtn.disabled = false;
    let total = 0;
    const html = cartItems
      .map((item) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        const img =
          item.image || "https://via.placeholder.com/80?text=No+Image";
        const title = escapeHtml(item.title);
        return `
            <div class="summary-item" role="listitem">
              <img src="${img}" alt="${title}">
              <div class="meta">
                <p>${title}</p>
                <small>Qty: ${item.quantity} • $${item.price.toFixed(
          2
        )} each</small>
              </div>
              <div class="price">$${subtotal.toFixed(2)}</div>
            </div>
          `;
      })
      .join("");
    summaryContainer.innerHTML = html;
    totalEl.textContent = total.toFixed(2);
  }

  // small helper to avoid injection when building HTML from product titles
  function escapeHtml(text) {
    return ("" + text).replace(/[&<>"']/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m];
    });
  }

  // payment selection toggles
  function toggleCardFields() {
    const pm = qsa('input[name="payment-method"]:checked')[0]?.value;
    if (pm === "card") {
      cardDetails.style.display = "block";
      cardDetails.setAttribute("aria-hidden", "false");
    } else {
      cardDetails.style.display = "none";
      cardDetails.setAttribute("aria-hidden", "true");
      // clear card fields to avoid accidental retention in UI
      cardName.value = cardNumber.value = cardExp.value = cardCvv.value = "";
      hideError("err-card-number");
      hideError("err-card-exp");
      hideError("err-card-cvv");
      hideError("err-card-name");
    }
    hideError("err-payment");
  }
  qsa('input[name="payment-method"]').forEach((r) =>
    r.addEventListener("change", toggleCardFields)
  );

  // hide error helper
  function hideError(id) {
    const el = err(id);
    if (el) el.style.display = "none";
  }

  // show error helper
  function showError(id, message) {
    const el = err(id);
    if (!el) return;
    el.textContent = message || el.textContent;
    el.style.display = "block";
  }

  // validators
  function validateEmail(v) {
    // simple regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validateExpiry(mmYY) {
    if (!/^\d{2}\/\d{2}$/.test(mmYY)) return false;
    const [mm, yy] = mmYY.split("/").map(Number);
    if (mm < 1 || mm > 12) return false;
    // convert to end-of-month
    const expYear = 2000 + yy;
    const expDate = new Date(expYear, mm, 0, 23, 59, 59); // last day of mm
    return expDate >= new Date();
  }

  // basic card number check: digits & length 13..19
  function validateCardNumber(num) {
    const digits = (num || "").replace(/\s+/g, "");
    return /^\d{13,19}$/.test(digits);
  }
  function validateCvv(v) {
    return /^\d{3,4}$/.test(v);
  }

  // when placing order
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    // clear previous errors
    [
      "err-name",
      "err-email",
      "err-address",
      "err-payment",
      "err-card-number",
      "err-card-exp",
      "err-card-cvv",
      "err-card-name",
    ].forEach(hideError);
    successMessage.style.display = "none";

    // basic fields
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const address = addressEl.value.trim();
    const selectedPM = qsa('input[name="payment-method"]:checked')[0]?.value;

    let ok = true;
    if (name.length < 2) {
      showError("err-name", "Please enter your full name (min 2 characters).");
      ok = false;
    }
    if (!validateEmail(email)) {
      showError("err-email", "Please enter a valid email.");
      ok = false;
    }
    if (address.length < 8) {
      showError("err-address", "Please provide a more complete address.");
      ok = false;
    }
    if (!selectedPM) {
      showError("err-payment", "Please choose a payment method.");
      ok = false;
    }

    // if no items in cart block
    if (!cartItems.length) {
      alert("Your cart is empty. Add items before checking out.");
      return;
    }

    // card extra validation if card selected
    if (selectedPM === "card") {
      const cn = cardNumber.value.trim();
      const ce = cardExp.value.trim();
      const cv = cardCvv.value.trim();
      const cnm = cardName.value.trim();

      if (!cnm) {
        showError("err-card-name", "Name on card is required.");
        ok = false;
      }
      if (!validateCardNumber(cn)) {
        showError("err-card-number", "Card number must be digits (13-19).");
        ok = false;
      }
      if (!validateExpiry(ce)) {
        showError(
          "err-card-exp",
          "Enter a valid expiry (MM/YY) that is not expired."
        );
        ok = false;
      }
      if (!validateCvv(cv)) {
        showError("err-card-cvv", "CVV must be 3 or 4 digits.");
        ok = false;
      }
    }

    if (!ok) return;

    // simulate order submission (do NOT store card info)
    const orderId = "ORD" + Date.now().toString(36).toUpperCase().slice(-8);
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    // clear cart from localStorage and in-memory copy
    localStorage.removeItem("cartItems");
    cartItems = [];

    // update UI
    renderSummary(); // will show empty cart
    form.reset();
    toggleCardFields(); // hides card fields if they were open

    successMessage.innerHTML = `
          ✅ Order placed — <strong>${orderId}</strong><br>
          Total: <strong>$${subtotal.toFixed(2)}</strong><br>
          A confirmation email was "sent" to <strong>${escapeHtml(
            email
          )}</strong> (simulated).
          <div style="margin-top:10px"><a href="index.html" class="btn" style="background:var(--primary-color); color:var(--white-color); padding:8px 12px; border-radius:8px; text-decoration:none;">Continue shopping</a></div>
        `;
    successMessage.style.display = "block";

    // disable submit briefly to avoid duplicate presses
    placeBtn.disabled = true;
    setTimeout(() => {
      placeBtn.disabled = false;
    }, 2500);
  });

  // render once
  renderSummary();

  // small UX: formatting card number (groups of 4)
  cardNumber &&
    cardNumber.addEventListener("input", function (e) {
      let v = this.value.replace(/\D/g, "").slice(0, 19);
      this.value = v.replace(/(\d{4})(?=\d)/g, "$1 ");
    });

  // format expiry mm/yy
  cardExp &&
    cardExp.addEventListener("input", function (e) {
      let v = this.value.replace(/\D/g, "").slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
      this.value = v;
    });
})();