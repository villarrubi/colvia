// Public business contact. The supplied "gmaiñ.com" was treated as a Gmail typo.
const CONTACT_EMAIL = "avillarrubia2@gmail.com";
const CONTACT_PHONE = "34633586060";

// Keep the external application handoff separate so browser tests can replace
// it without launching a mail client, WhatsApp or the system browser.
function openContactDraft(url, isEmail) {
  if (isEmail) window.location.href = url;
  else window.open(url, "_blank", "noopener,noreferrer");
}

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
document.querySelector("[data-privacy]").addEventListener("click", () => {
  privacyDialog.showModal();
  document.body.classList.add("dialog-open");
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
  document.querySelector("#submit-brief").disabled = false;
  function updateChannel() {
    const isEmail = new FormData(form).get("channel") === "email";
    document.querySelector("#submit-label").textContent = isEmail
      ? "Continuar por email"
      : "Continuar en WhatsApp";
    document.querySelector("#form-footnote").textContent = isEmail
      ? "Se abrirá tu aplicación de correo con el mensaje preparado. Revisa y envía cuando quieras."
      : "Se abrirá WhatsApp con tu mensaje preparado. Tú decides cuándo enviarlo.";
    status.replaceChildren();
  }
  form
    .querySelectorAll('[name="channel"]')
    .forEach((input) => input.addEventListener("change", updateChannel));
  form.addEventListener("input", () => status.replaceChildren());
  updateChannel();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const business = String(data.get("business") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (!name || !business || !message) {
      status.textContent =
        "Completa tu nombre, tu organización y una descripción del proyecto.";
      form.elements
        .namedItem(!name ? "name" : !business ? "business" : "message")
        .focus();
      return;
    }
    const brief = [
      "Hola, Colvia. Soy " + name + ".",
      "",
      "Empresa u organización: " + business,
      "Me interesa: " + data.get("service"),
      "",
      message,
    ].join("\n");
    const isEmail = data.get("channel") === "email";
    const url = isEmail
      ? "mailto:" +
        CONTACT_EMAIL +
        "?subject=" +
        encodeURIComponent("Consulta de proyecto: " + business) +
        "&body=" +
        encodeURIComponent(brief)
      : "https://wa.me/" + CONTACT_PHONE + "?text=" + encodeURIComponent(brief);
    const fallback = document.createElement("a");
    fallback.href = url;
    fallback.textContent = isEmail
      ? "Abrir el correo de nuevo"
      : "Abrir WhatsApp de nuevo";
    if (!isEmail) {
      fallback.target = "_blank";
      fallback.rel = "noopener noreferrer";
    }
    status.replaceChildren(
      document.createTextNode(
        "Mensaje preparado. Revisa y envíalo desde la aplicación. ",
      ),
      fallback,
    );
    openContactDraft(url, isEmail);
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
