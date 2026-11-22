// Public business contact. FormSubmit requires one-time recipient activation.
const CONTACT_EMAIL = "avillarrubia2@gmail.com";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
function closeMenu() {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
});
navigation
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia("(min-width: 1101px)").addEventListener("change", closeMenu);
document.querySelector("#year").textContent = new Date().getFullYear();

const privacyDialog = document.querySelector("#privacy-dialog");
document.querySelectorAll("[data-privacy]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    privacyDialog.showModal();
    document.body.classList.add("dialog-open");
  });
});
privacyDialog
  .querySelector(".dialog-close")
  .addEventListener("click", () => privacyDialog.close());
privacyDialog.addEventListener("click", (event) => {
  const bounds = privacyDialog.getBoundingClientRect();
  if (
    event.target === privacyDialog &&
    (event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom)
  )
    privacyDialog.close();
});
privacyDialog.addEventListener("close", () =>
  document.body.classList.remove("dialog-open"),
);

const form = document.querySelector("#brief-form");
if (form) {
  const status = document.querySelector("#form-status");
  const submit = document.querySelector("#submit-brief");
  const submitLabel = document.querySelector("#submit-label");
  let sending = false;
  let sentPayload = "";
  const payloadFor = () => Object.fromEntries(new FormData(form));
  form.addEventListener("input", () => {
    if (sending) return;
    status.replaceChildren();
    submit.disabled = JSON.stringify(payloadFor()) === sentPayload;
    submitLabel.textContent = submit.disabled
      ? "Consulta enviada"
      : "Enviar consulta";
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    for (const fieldName of ["name", "email", "message"]) {
      const field = form.elements.namedItem(fieldName);
      if (!field.value.trim()) {
        status.textContent =
          "Completa tu nombre, tu correo y una descripción del proyecto.";
        field.focus();
        return;
      }
    }
    const payload = payloadFor();
    if (payload._honey || JSON.stringify(payload) === sentPayload) return;
    const snapshot = JSON.stringify(payload);
    payload.email = payload.email.trim();
    payload._replyto = payload.email;
    sending = true;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    submitLabel.textContent = "Enviando…";
    status.textContent = "Estamos enviando tu consulta.";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.dataset.submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: "omit",
      });
      const result = await response.json();
      if (
        !response.ok ||
        (result.success !== true && result.success !== "true") ||
        /activat|confirm.*email|check.*inbox/i.test(
          String(result.message || ""),
        )
      ) {
        throw new Error("Submission not confirmed");
      }
      sentPayload = snapshot;
      status.textContent =
        "Tu consulta se ha enviado. Gracias por escribirnos; te responderemos al correo que has indicado.";
    } catch {
      const fallback = document.createElement("a");
      fallback.href = "mailto:" + CONTACT_EMAIL;
      fallback.textContent = "Escribir directamente por email";
      status.replaceChildren(
        document.createTextNode(
          "No hemos podido confirmar el envío. Tus datos siguen aquí; puedes volver a intentarlo o escribirnos por email. ",
        ),
        fallback,
      );
    } finally {
      clearTimeout(timeout);
      sending = false;
      form.removeAttribute("aria-busy");
      submit.disabled = JSON.stringify(payloadFor()) === sentPayload;
      submitLabel.textContent = submit.disabled
        ? "Consulta enviada"
        : "Enviar consulta";
    }
  });
}

// Non-modal contact disclosure: native links still work without JavaScript.
const contactDock = document.querySelector(".contact-dock");
const contactToggle = contactDock.querySelector("summary");
contactDock.addEventListener("toggle", () => {
  if (contactDock.open) closeMenu();
});
contactDock.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (event) => {
    contactDock.open = false;
    if (form && link.hash === "#contacto") {
      event.preventDefault();
      if (window.location.hash !== "#contacto") {
        window.history.pushState(null, "", "#contacto");
      }
      form.scrollIntoView({ block: "start" });
      document.querySelector("#name").focus({ preventScroll: true });
    }
  });
});
document.addEventListener("click", (event) => {
  if (!contactDock.contains(event.target)) contactDock.open = false;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && contactDock.open) {
    contactDock.open = false;
    contactToggle.focus();
  }
});
