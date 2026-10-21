(() => {
  const canvas = document.getElementById("net");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canvas && !reduce) {
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let dpr = 1;
    let running = true;
    const count = Math.round(Math.min(78, Math.max(42, (window.innerWidth * window.innerHeight) / 18000)));
    const nodes = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00016,
      vy: (Math.random() - 0.5) * 0.00012,
    }));

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      });

      const reach = Math.min(168, Math.max(110, Math.min(w, h) * 0.18));

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const ax = a.x * w;
        const ay = a.y * h;

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const bx = b.x * w;
          const by = b.y * h;
          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.hypot(dx, dy);
          if (dist > reach) continue;

          const fade = 1 - dist / reach;
          const mix = (a.x + b.x) * 0.5;
          const r = 226 + (255 - 226) * mix;
          const g = 199 + (92 - 199) * mix;
          const bl = 138 * (1 - mix);
          ctx.strokeStyle = `rgba(${r | 0}, ${g | 0}, ${bl | 0}, ${(0.28 * fade).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }

        ctx.fillStyle = a.x < 0.5 ? "rgba(246, 231, 196, 0.85)" : "rgba(255, 138, 61, 0.85)";
        ctx.beginPath();
        ctx.arc(ax, ay, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => {
      const hidden = document.hidden;
      if (hidden) running = false;
      else if (!running) {
        running = true;
        requestAnimationFrame(frame);
      }
    });
    requestAnimationFrame(frame);
  }

  const gate = document.querySelector(".gate");

  document.querySelector("[data-gate='enter']")?.addEventListener("click", () => {
    try {
      sessionStorage.setItem("age18", "1");
    } catch (e) {}
    document.documentElement.classList.add("age-ok");
  });

  document.querySelector("[data-gate='leave']")?.addEventListener("click", () => {
    gate?.classList.add("is-denied");
  });

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy") || "";
      try {
        await navigator.clipboard.writeText(value);
      } catch (e) {
        const area = document.createElement("textarea");
        area.value = value;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      button.classList.add("is-copied");
      window.setTimeout(() => button.classList.remove("is-copied"), 1400);
    });
  });
})();
