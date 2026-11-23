// Progressive motion: content and navigation remain complete without this file.
const motionRoot = document.documentElement;
const isAboutPage = Boolean(document.querySelector(".about-hero"));
motionRoot.classList.toggle("page-about", isAboutPage);
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let motionPaused = false;
try {
  motionPaused = sessionStorage.getItem("colvia-motion-choice") === "off";
} catch {
  /* Preferences are optional when storage is unavailable. */
}
const motionToggle = document.createElement("button");
motionToggle.type = "button";
motionToggle.className = "motion-toggle";
motionToggle.innerHTML =
  '<span class="motion-toggle-icon" aria-hidden="true"></span><span class="motion-toggle-label"></span>';
document.querySelector(".header-shell").after(motionToggle);
function motionDisabled() {
  return reducedMotion.matches || motionPaused;
}
function applyMotionPreference() {
  const disabled = motionDisabled();
  motionRoot.classList.toggle("motion-reduced", disabled);
  motionToggle.disabled = reducedMotion.matches;
  const label = reducedMotion.matches
    ? "Movimiento reducido"
    : motionPaused
      ? "Reanudar animaciones"
      : "Pausar animaciones";
  motionToggle.setAttribute("aria-label", label);
  motionToggle.title = reducedMotion.matches
    ? "Según la preferencia de tu dispositivo"
    : label;
  motionToggle.querySelector(".motion-toggle-label").textContent = label;
  if (disabled) {
    motionRoot.classList.remove(
      "page-entering",
      "page-arriving",
      "page-leaving",
    );
    motionRoot.classList.add("page-return");
    document.querySelectorAll(".will-reveal").forEach(reveal);
    document.querySelectorAll("[style]").forEach((element) => {
      element.style.removeProperty("--tilt-x");
      element.style.removeProperty("--tilt-y");
      element.style.removeProperty("--section-travel");
    });
  }
}
motionToggle.addEventListener("click", () => {
  motionPaused = !motionPaused;
  try {
    sessionStorage.setItem("colvia-motion-choice", motionPaused ? "off" : "on");
  } catch {}
  applyMotionPreference();
});
reducedMotion.addEventListener("change", applyMotionPreference);
applyMotionPreference();
// Give lists their own rhythm instead of revealing a whole block at once.
document
  .querySelectorAll(
    ".public-details article, .faq-list details, .contact-form > *, .site-footer .wrap",
  )
  .forEach((element) => element.classList.add("reveal"));
const revealElements = document.querySelectorAll(".reveal");
motionRoot.classList.add("motion-ready");

function reveal(element) {
  element.classList.remove("will-reveal");
  element.classList.add("is-visible");
}

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting || motionDisabled()) {
              reveal(entry.target);
            } else if (!entry.target.contains(document.activeElement)) {
              entry.target.classList.add("will-reveal");
              entry.target.classList.remove("is-visible");
            }
          });
        },
        { threshold: 0, rootMargin: "0px 0px -35px 0px" },
      )
    : null;

revealElements.forEach((element) => {
  const siblings = [...element.parentElement.children].filter((child) =>
    child.classList.contains("reveal"),
  );
  element.style.setProperty(
    "--reveal-delay",
    `${Math.min(siblings.indexOf(element), 3) * 100}ms`,
  );
  if (
    element.matches(".service-row, .founder-card, .experience-card, .principle")
  ) {
    element.dataset.motionDirection =
      siblings.indexOf(element) % 2 ? "right" : "left";
  }
  if (
    !motionDisabled() &&
    revealObserver &&
    element.getBoundingClientRect().top >= innerHeight
  ) {
    element.classList.add("will-reveal");
  } else {
    reveal(element);
  }
  revealObserver?.observe(element);
});
document.addEventListener("focusin", (event) => {
  const hiddenSection = event.target.closest(".will-reveal");
  if (hiddenSection) reveal(hiddenSection);
});
// Stop ambient loops when their scene is off screen or the tab is hidden.
document.querySelectorAll(".hero-shell").forEach((hero) => {
  const orbit = document.createElement("div");
  orbit.className = "hero-motion-orbits";
  orbit.setAttribute("aria-hidden", "true");
  orbit.innerHTML = "<i></i><i></i>";
  hero.prepend(orbit);
});
const ribbonAnchor =
  document.querySelector(".team-section") ||
  document.querySelector(".hero-shell");
if (ribbonAnchor) {
  const ribbon = document.createElement("div");
  ribbon.className = "motion-ribbon";
  ribbon.setAttribute("aria-hidden", "true");
  const ribbonPhrases = [
    "Escuchar tu idea.",
    "Entender tu negocio.",
    "Diseñar contigo.",
    "Desarrollar a medida.",
    "Conectar tus herramientas.",
    "Seguir mejorando.",
  ];
  const ribbonGroup =
    '<span class="ribbon-group">' +
    ribbonPhrases.map((phrase) => `<span>${phrase}</span><i></i>`).join("") +
    "</span>";
  ribbon.innerHTML =
    '<div class="ribbon-track">' + ribbonGroup.repeat(4) + "</div>";
  ribbonAnchor.after(ribbon);
}
const scenes = document.querySelectorAll(
  ".hero-shell, .hero-visual, .about-emblem, .section, .site-footer, .motion-ribbon",
);
const motionSections = [...document.querySelectorAll(".section")];
motionSections.forEach((section) => {
  section.classList.add("motion-section");
  const art = document.createElement("span");
  art.className = "section-motion-art";
  art.setAttribute("aria-hidden", "true");
  section.prepend(art);
});
if ("IntersectionObserver" in window) {
  const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) =>
      entry.target.classList.toggle("motion-in-view", entry.isIntersecting),
    );
  });
  scenes.forEach((scene) => sceneObserver.observe(scene));
} else {
  scenes.forEach((scene) => scene.classList.add("motion-in-view"));
}
document.addEventListener("visibilitychange", () => {
  motionRoot.classList.toggle("motion-suspended", document.hidden);
});

document
  .querySelectorAll(".system-canvas, .experience-card, .founder-card")
  .forEach((canvas) => {
    let pointerFrame = 0;
    canvas.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || motionDisabled()) return;
      cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const bounds = canvas.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        canvas.style.setProperty("--tilt-x", `${-y * 5}deg`);
        canvas.style.setProperty("--tilt-y", `${x * 5}deg`);
      });
    });
    canvas.addEventListener("pointerleave", () => {
      cancelAnimationFrame(pointerFrame);
      canvas.style.removeProperty("--tilt-x");
      canvas.style.removeProperty("--tilt-y");
    });
  });

const readingProgress = document.querySelector(".reading-progress");
let progressFrame = 0;
function updateProgress() {
  if (progressFrame) return;
  progressFrame = requestAnimationFrame(() => {
    progressFrame = 0;
    const range = motionRoot.scrollHeight - innerHeight;
    const progress = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
    if (readingProgress)
      readingProgress.style.transform = `scaleX(${progress})`;
    if (motionDisabled()) return;
    motionSections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > innerHeight) return;
      const travel = Math.max(
        0,
        Math.min(1, (innerHeight - bounds.top) / (innerHeight + bounds.height)),
      );
      section.style.setProperty(
        "--section-travel",
        `${(travel - 0.5) * 150}px`,
      );
      section.style.setProperty("--section-progress", travel);
    });
  });
}
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
document.addEventListener("toggle", updateProgress, true);
updateProgress();

// Direct visits keep their introductions. Internal navigation uses one shared
// transition instead of stacking a page fade and another hero introduction.
// The one-use marker also works when the browser omits the referrer.
const navigationKey = "colvia-internal-navigation";
const navigationEntry = performance.getEntriesByType("navigation")[0];
const nativePageTransitions = typeof CSSViewTransitionRule !== "undefined";
const alreadyPainted =
  performance.getEntriesByName("first-contentful-paint").length > 0;
let internalArrival = false;
try {
  const previous = JSON.parse(sessionStorage.getItem(navigationKey) || "null");
  sessionStorage.removeItem(navigationKey);
  internalArrival =
    previous?.path === location.pathname && Date.now() - previous.time < 10000;
} catch {
  /* Navigation must also work without session storage. */
}
const referrer = document.referrer ? new URL(document.referrer) : null;
const localPages = ["./", "index.html", "conocenos.html"].map(
  (path) => new URL(path, location.href).pathname,
);
internalArrival ||=
  navigationEntry?.type === "navigate" &&
  referrer?.origin === location.origin &&
  localPages.includes(referrer.pathname);
const skipEntrance =
  motionDisabled() ||
  // If rendering already started (unsupported render blocking or its timeout),
  // do not hide visible content just to replay an entrance.
  alreadyPainted ||
  navigationEntry?.type === "back_forward" ||
  (navigationEntry?.type !== "reload" && internalArrival) ||
  Boolean(location.hash && location.hash !== "#inicio");

// The curtain is reserved for direct visits to the homepage.
const pageCurtain = document.createElement("div");
pageCurtain.className = "page-curtain";
pageCurtain.setAttribute("aria-hidden", "true");
pageCurtain.innerHTML = `
  <div class="curtain-layer curtain-lime"></div>
  <div class="curtain-layer curtain-ink"></div>
  <div class="curtain-brand">
    <div class="curtain-lockup">
      <svg class="curtain-symbol" viewBox="0 0 64 64" fill="currentColor">
        <g transform="rotate(90 32 32)">
          <g class="curtain-piece curtain-piece-one"><path d="M5 29V18C5 10 10 5 18 5H59L38 26H29C18 26 15 38 5 43Z"/></g>
          <g class="curtain-piece curtain-piece-two"><path d="M5 29V18C5 10 10 5 18 5H59L38 26H29C18 26 15 38 5 43Z" transform="rotate(180 32 32)"/></g>
        </g>
      </svg>
      <span class="curtain-word"><span>COLVIA</span></span>
    </div>
    <span class="curtain-rule"></span>
  </div>`;
document.body.append(pageCurtain);
let navigating = false;
let navigationTimer;
let entranceTimer;
function enterPage(skip = false, transition = false) {
  clearTimeout(navigationTimer);
  clearTimeout(entranceTimer);
  navigating = false;
  motionRoot.classList.remove("page-leaving", "page-entering", "page-arriving");
  motionRoot.classList.toggle("page-return", skip);
  motionRoot.style.setProperty(
    "--hero-entry-offset",
    isAboutPage || skip ? "0s" : "0.35s",
  );
  if (skip) {
    if (
      !motionDisabled() &&
      transition &&
      !nativePageTransitions &&
      !alreadyPainted &&
      !location.hash
    ) {
      motionRoot.classList.add("page-arriving");
      entranceTimer = setTimeout(
        () => motionRoot.classList.remove("page-arriving"),
        500,
      );
    }
    return;
  }
  motionRoot.classList.add("page-entering");
  entranceTimer = setTimeout(
    () => motionRoot.classList.remove("page-entering"),
    isAboutPage ? 1200 : 1400,
  );
}
pageCurtain.addEventListener("animationend", (event) => {
  if (event.animationName === "intro-lime-lift") {
    clearTimeout(entranceTimer);
    motionRoot.classList.remove("page-entering");
  }
});
document
  .querySelector(".about-emblem")
  ?.addEventListener("animationend", (event) => {
    if (event.animationName === "about-intro-emblem") {
      clearTimeout(entranceTimer);
      motionRoot.classList.remove("page-entering");
    }
  });
enterPage(
  skipEntrance,
  internalArrival && navigationEntry?.type === "navigate",
);
addEventListener("pageshow", (event) => {
  if (event.persisted) enterPage(true);
});
document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const link = event.target.closest("a[href]");
  if (
    !link ||
    link.hasAttribute("download") ||
    (link.target && link.target !== "_self")
  )
    return;
  const destination = new URL(link.href, location.href);
  if (
    destination.origin !== location.origin ||
    !localPages.includes(destination.pathname)
  )
    return;
  const normalize = (path) => path.replace(/index\.html$/, "");
  if (normalize(destination.pathname) === normalize(location.pathname)) return;
  if (navigating) {
    event.preventDefault();
    return;
  }
  navigating = true;
  try {
    sessionStorage.setItem(
      navigationKey,
      JSON.stringify({ path: destination.pathname, time: Date.now() }),
    );
  } catch {
    /* Referrer and history detection remain available. */
  }
  // Let the browser keep the old page visible until the new one is ready,
  // then crossfade their snapshots. There is no extra navigation delay.
  if (nativePageTransitions || motionDisabled()) return;
  event.preventDefault();
  clearTimeout(entranceTimer);
  motionRoot.classList.remove("page-entering", "page-arriving");
  motionRoot.classList.add("page-leaving");
  navigationTimer = setTimeout(() => location.assign(destination.href), 240);
});
