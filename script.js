document.addEventListener("DOMContentLoaded", () => {
  const headings = [
    document.getElementById("dynamic-heading"),
    document.getElementById("game-over-heading"),
  ];

  headings.forEach((heading) => {
    const text = heading.textContent;
    heading.innerHTML = text
      .split("")
      .map(
        (char, index) =>
          `<span style="animation-delay:${index * 0.1}s">${
            char === " " ? "&nbsp;" : char
          }</span>`
      )
      .join("");
  });
});
