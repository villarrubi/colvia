// Progressive motion: content and navigation remain complete without this file.
const motionRoot = document.documentElement;
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const motionButtons = document.querySelectorAll(".motion-toggle");
// Give lists their own rhythm instead of revealing a whole block at once.
document
  .querySelectorAll(
    ".public-details article, .faq-list details, .contact-form > *, .site-footer .wrap",
  )
  .forEach((element) => element.classList.add("reveal"));
const revealElements = document.querySelectorAll(".reveal");
let motionPaused = false;
try {
  motionPaused = sessionStorage.getItem("colvia-motion-paused") === "true";
} catch {}
const motionEnabled = () => !motionPreference.matches && !motionPaused;

function reveal(element) {
  element.classList.remove("will-reveal");
  element.classList.add("is-visible");
}

const revealObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting || !motionEnabled()) {
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

function syncMotion() {
  const enabled = !motionPreference.matches;
  motionRoot.classList.toggle("motion-ready", enabled);
  motionRoot.classList.toggle("motion-paused", motionPaused);
  motionButtons.forEach((button) => {
    button.hidden = !enabled;
    button.textContent = motionPaused
      ? "Reanudar animaciones"
      : "Pausar animaciones";
    button.setAttribute("aria-pressed", String(motionPaused));
  });
  if (!enabled || motionPaused) {
    revealElements.forEach(reveal);
    document
      .querySelectorAll(".system-canvas, .experience-card, .founder-card")
      .forEach((canvas) => {
        canvas.style.removeProperty("--tilt-x");
        canvas.style.removeProperty("--tilt-y");
      });
  }
  updateProgress();
}

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
    revealObserver &&
    motionEnabled() &&
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
motionButtons.forEach((button) =>
  button.addEventListener("click", () => {
    motionPaused = !motionPaused;
    try {
      sessionStorage.setItem("colvia-motion-paused", String(motionPaused));
    } catch {}
    syncMotion();
  }),
);
motionPreference.addEventListener("change", syncMotion);

// Stop ambient loops when their scene is off screen or the tab is hidden.
const ribbonAnchor = document.querySelector(".audience-strip, .team-section");
if (ribbonAnchor) {
  const ribbon = document.createElement("div");
  ribbon.className = "motion-ribbon";
  ribbon.setAttribute("aria-hidden", "true");
  ribbon.innerHTML =
    '<div class="ribbon-track">' +
    Array.from(
      { length: 4 },
      () =>
        '<span class="ribbon-group"><span>Pensar.</span><i></i><span>Construir.</span><i></i><span>Mejorar.</span><i></i></span>',
    ).join("") +
    "</div>";
  ribbonAnchor.after(ribbon);
}
const scenes = document.querySelectorAll(
  ".hero-visual, .about-emblem, .section, .audience-strip, .site-footer, .motion-ribbon",
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
      if (motionPreference.matches || motionPaused || !finePointer.matches)
        return;
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
    motionSections.forEach((section) => {
      const bounds = section.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > innerHeight) return;
      const travel = Math.max(
        0,
        Math.min(1, (innerHeight - bounds.top) / (innerHeight + bounds.height)),
      );
      section.style.setProperty(
        "--section-travel",
        motionEnabled() ? `${(travel - 0.5) * 150}px` : "0px",
      );
      section.style.setProperty(
        "--section-progress",
        motionEnabled() ? travel : 1,
      );
    });
  });
}
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
document.addEventListener("toggle", updateProgress, true);
updateProgress();
syncMotion();

// Normal links remain normal: only unmodified clicks to another local HTML page
// get the short curtain. Hash links retain native scrolling and focus behavior.
const pageCurtain = document.createElement("div");
pageCurtain.className = "page-curtain";
pageCurtain.setAttribute("aria-hidden", "true");
pageCurtain.innerHTML = '<span>COLVIA<span class="curtain-dot"></span></span>';
document.body.append(pageCurtain);
let navigating = false;
let navigationTimer;
function enterPage() {
  clearTimeout(navigationTimer);
  navigating = false;
  motionRoot.classList.remove("page-leaving", "page-entering");
  if (!motionEnabled()) return;
  motionRoot.classList.add("page-entering");
  setTimeout(() => motionRoot.classList.remove("page-entering"), 850);
}
enterPage();
addEventListener("pageshow", (event) => {
  if (event.persisted) enterPage();
});
document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !motionEnabled()
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
  const localPages = ["./", "index.html", "conocenos.html"].map(
    (path) => new URL(path, location.href).pathname,
  );
  if (
    destination.origin !== location.origin ||
    !localPages.includes(destination.pathname)
  )
    return;
  const normalize = (path) => path.replace(/index\.html$/, "");
  if (normalize(destination.pathname) === normalize(location.pathname)) return;
  event.preventDefault();
  if (navigating) return;
  navigating = true;
  motionRoot.classList.remove("page-entering");
  motionRoot.classList.add("page-leaving");
  navigationTimer = setTimeout(() => location.assign(destination.href), 340);
});
