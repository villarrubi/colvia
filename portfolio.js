// Enhance the complete HTML gallery; all projects remain readable without JS.
const portfolio = document.querySelector(".portfolio-section");
if (portfolio) {
  const toolbar = portfolio.querySelector(".portfolio-toolbar");
  const grid = portfolio.querySelector(".portfolio-grid");
  const buttons = [...portfolio.querySelectorAll("[data-project-filter]")];
  const cards = [...grid.querySelectorAll(".portfolio-card")];
  const status = portfolio.querySelector(".portfolio-status");
  toolbar.hidden = false;
  let transition;
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const filter = button.dataset.projectFilter;
      buttons.forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
      grid.dataset.filter = filter;
      cards.forEach((card) => {
        card.hidden =
          filter !== "all" && card.dataset.projectCategory !== filter;
      });
      const count = cards.filter((card) => !card.hidden).length;
      grid.dataset.visibleCount = count;
      status.textContent =
        filter === "all"
          ? "5 ejemplos · 4 ámbitos"
          : `${count} ${count === 1 ? "ejemplo" : "ejemplos"} · ${button.textContent}`;
      transition?.cancel();
      if (
        document.documentElement.classList.contains("motion-ready") &&
        !document.documentElement.classList.contains("motion-paused")
      ) {
        transition = grid.animate(
          [
            { opacity: 0.35, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" },
        );
      }
    }),
  );
}
