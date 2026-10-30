/* =========================================================
   MAYA DI PIETRO — PORTFOLIO
   1. Langues (EN / FR / IT)
   2. Couleur de fond continue entre les projets
   3. Stickers déplaçables
   4. Vignettes de l'index
   5. Agrandissement des images
   ========================================================= */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- 1. Langues ---------- */
  const LANGS = ["en", "fr", "it"];
  const store = {
    get() { try { return localStorage.getItem("lang"); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem("lang", v); } catch (e) {} },
  };

  function initialLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(fromUrl)) return fromUrl;
    const saved = store.get();
    if (LANGS.includes(saved)) return saved;
    const nav = (navigator.language || "fr").slice(0, 2).toLowerCase();
    return LANGS.includes(nav) ? nav : "en";
  }

  let lang = initialLang();

  function t(key) {
    return (I18N[lang] && I18N[lang][key]) ?? (I18N.en[key] ?? "");
  }

  function applyLang(next) {
    lang = next;
    root.lang = lang;
    document.title = t("meta.title");
    document.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-alt]").forEach(el => { el.alt = t(el.dataset.i18nAlt); });
    document.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    document.querySelectorAll("[data-i18n-name]").forEach(el => { el.dataset.name = t(el.dataset.i18nName); });
    document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    store.set(lang);
    lastName = null; // force la mise à jour du libellé en bas de page
    fitTitles();     // la longueur des descriptions change selon la langue
    tick();
  }

  document.querySelectorAll(".lang button").forEach(b =>
    b.addEventListener("click", () => applyLang(b.dataset.lang))
  );

  // contact
  const email = document.querySelector(".js-email");
  const phone = document.querySelector(".js-phone");
  if (email) { email.textContent = CONTACT.email; email.href = "mailto:" + CONTACT.email; }
  if (phone) { phone.textContent = CONTACT.phone; phone.href = "tel:" + CONTACT.phone.replace(/\s/g, ""); }

  /* ---------- 2. Couleur de fond continue ---------- */
  const sections = [...document.querySelectorAll("[data-bg]")];
  const nowLabel = document.querySelector(".now__label");
  const nowFill = document.querySelector(".now__fill");
  const stickers = [...document.querySelectorAll(".sticker")];
  const stages = [...document.querySelectorAll(".project__stage")];
  let lastName = null;
  const pnav = document.querySelector(".pnav");
  const pnavLinks = pnav ? [...pnav.querySelectorAll("a")] : [];
  const projectIds = pnavLinks.map(a => a.hash.slice(1));

  const hex = h => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const palette = sections.map(s => ({ bg: hex(s.dataset.bg), fg: hex(s.dataset.fg) }));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = x => x * x * (3 - 2 * x);
  const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;

  const topbar = document.querySelector(".topbar");
  function tick() {
    const vh = window.innerHeight;
    if (topbar) topbar.classList.toggle("is-scrolled", scrollY > 24);
    const mid = vh * 0.62;      // ligne de référence
    const zone = vh * 0.85;     // distance sur laquelle la couleur se mélange (plus long = plus doux)

    let i = 0;
    for (let k = 0; k < sections.length; k++) {
      if (sections[k].getBoundingClientRect().top <= mid) i = k;
    }
    const cur = palette[i];
    const nextSec = sections[i + 1];
    let k = 0;
    if (nextSec) k = ease(clamp(1 - (nextSec.getBoundingClientRect().top - mid) / zone));
    const nxt = palette[i + 1] || cur;

    root.style.setProperty("--bg", mix(cur.bg, nxt.bg, k));
    // le texte bascule sur une courte distance pour rester lisible
    root.style.setProperty("--fg", mix(cur.fg, nxt.fg, clamp((k - 0.42) / 0.16)));

    const curSec = (k > 0.5 && nextSec ? nextSec : sections[i]);
    const name = curSec.dataset.name;
    if (name !== lastName) {
      lastName = name;
      // repère : numéro du projet + nom, et point actif dans la navigation
      const n = projectIds.indexOf(curSec.id);
      if (nowLabel) nowLabel.textContent = n >= 0 ? `${n + 1}/${projectIds.length}  ${name}` : name;
      pnavLinks.forEach(a => a.classList.toggle("is-active", a.hash === "#" + curSec.id));
      if (pnav) pnav.classList.toggle("is-on", n >= 0);
    }

    const max = document.documentElement.scrollHeight - vh;
    if (nowFill) nowFill.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";

    // titres de projets : rétrécissent progressivement, au rythme du scroll,
    // pendant que les images arrivent (de 100 % à 30 %)
    for (const st of stages) {
      const body = st.parentElement.querySelector(".project__body");
      if (!body) continue;
      const top = body.getBoundingClientRect().top;
      const p = ease(clamp((vh * 1.0 - top) / (vh * 0.7)));   // 0 → 1
      st.style.setProperty("--title-scale", (1 - 0.7 * p).toFixed(4));
    }

    // légère rotation des stickers selon leur position (effet de profondeur)
    if (!reduceMotion) {
      for (const s of stickers) {
        if (s.classList.contains("is-dragging")) continue;
        const r = s.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const off = (r.top + r.height / 2 - vh / 2) / vh; // -0.5 … 0.5
        s.style.setProperty("--spin", (off * 10).toFixed(2) + "deg");
      }
    }
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { tick(); ticking = false; });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* ---------- 3. Stickers déplaçables ---------- */
  let zTop = 30;
  let suppressClick = false;

  if (finePointer) {
    document.querySelectorAll(".drag").forEach(el => {
      let sx = 0, sy = 0, bx = 0, by = 0, moved = false;

      el.addEventListener("pointerdown", e => {
        if (e.button !== 0 || e.target.closest("button")) return;   // les pastilles restent cliquables
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        sx = e.clientX; sy = e.clientY;
        bx = parseFloat(el.style.getPropertyValue("--dx")) || 0;
        by = parseFloat(el.style.getPropertyValue("--dy")) || 0;
        moved = false;
        el.classList.add("is-dragging");
        el.style.zIndex = ++zTop;
      });

      el.addEventListener("pointermove", e => {
        if (!el.hasPointerCapture(e.pointerId)) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
        el.style.setProperty("--dx", bx + dx + "px");
        el.style.setProperty("--dy", by + dy + "px");
      });

      const end = e => {
        if (!el.hasPointerCapture(e.pointerId)) return;
        el.releasePointerCapture(e.pointerId);
        el.classList.remove("is-dragging");
        suppressClick = moved;
      };
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
    });
  }

  /* ---------- 4. Vignettes de l'index ---------- */
  const thumb = document.querySelector(".index__thumb");
  if (thumb && finePointer) {
    document.querySelectorAll(".index__list a").forEach(a => {
      a.addEventListener("mouseenter", () => { thumb.src = a.dataset.thumb; thumb.classList.add("is-on"); });
      a.addEventListener("mouseleave", () => thumb.classList.remove("is-on"));
      a.addEventListener("mousemove", e => {
        thumb.style.transform = `translate(${e.clientX + 24}px, ${e.clientY - 80}px)`;
      });
    });
  }

  /* ---------- 5. Agrandissement des images ---------- */
  const box = document.querySelector(".lightbox");
  const boxImg = box.querySelector(".lightbox__img");
  const boxClose = box.querySelector(".lightbox__close");
  let lastFocus = null;

  function openBox(img) {
    lastFocus = document.activeElement;
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt;
    box.hidden = false;
    document.body.style.overflow = "hidden";
    boxClose.focus();
  }
  function closeBox() {
    box.hidden = true;
    boxImg.src = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", e => {
    const img = e.target.closest(".project__body img, img.zoomable, .zoomable img");
    if (!img || img.closest(".lightbox, .memo, .plunge, .build")) return;
    if (suppressClick) { suppressClick = false; return; }
    openBox(img);
  });
  box.addEventListener("click", e => { if (e.target !== boxImg) closeBox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !box.hidden) closeBox(); });

  // les images du site deviennent accessibles au clavier
  document.querySelectorAll(".project__body .g img, img.zoomable").forEach(img => {
    img.tabIndex = 0;
    img.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openBox(img); } });
  });

  /* ---------- Taille du nom : "Di Pietro" remplit la largeur ---------- */
  const heroLock = document.querySelector(".hero__lockup");
  const heroMaya = document.querySelector(".hero__maya");
  const heroDp = document.querySelector(".hero__dp");
  function fitName() {
    if (!heroLock || !heroDp) return;
    heroLock.style.fontSize = "100px";
    const box = heroLock.parentElement;
    const cs = getComputedStyle(box);
    const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const pf = document.querySelector(".hero__pf");
    const w = Math.max(heroDp.getBoundingClientRect().width, pf ? pf.getBoundingClientRect().width : 0);
    // "Di Pietro" occupe ~68 % de la largeur (74 % sur téléphone), sans dépasser 1/3 de la hauteur
    const ratio = window.innerWidth <= 860 ? 0.74 : 0.68;
    const size = Math.min((100 * avail * ratio) / w, window.innerHeight * 0.25);   // 3 lignes : Portfolio / Maya / Di Pietro
    heroLock.style.fontSize = size.toFixed(1) + "px";
    heroLock.style.setProperty("--maya-w", heroMaya.getBoundingClientRect().width + "px");
    heroLock.style.setProperty("--dp-w", heroDp.getBoundingClientRect().width + "px");
  }
  /* ---------- Titres de projets : jamais sous le bloc de description ----------
     Si l'écran est trop bas, le titre rétrécit juste assez pour laisser
     un espace entre la description (en haut à droite) et le titre (en bas). */
  function fitTitles() {
    const vh = window.innerHeight;
    document.querySelectorAll(".project").forEach(sec => {
      const title = sec.querySelector(".project__title");
      const meta = sec.querySelector(".project__meta");
      const inner = sec.querySelector(".project__info-inner");
      if (!title || !meta || !inner) return;
      title.style.fontSize = "";
      if (window.innerWidth <= 860) return;               // sur mobile, tout est empilé
      const cs = getComputedStyle(title);
      const fs = parseFloat(cs.fontSize);
      const lines = (title.innerHTML.match(/<br/gi) || []).length + 1;
      const metaBottom = parseFloat(getComputedStyle(inner).top) + meta.offsetHeight;
      const stagePad = parseFloat(getComputedStyle(title.parentElement).paddingBottom);
      const gap = 40;                                        // espace minimum entre les deux
      const room = vh - stagePad - metaBottom - gap;
      const maxFs = room / (lines * 0.86);
      if (fs > maxFs) title.style.fontSize = Math.max(maxFs, 40).toFixed(1) + "px";
    });
  }

  function fitAll() { fitName(); fitTitles(); }
  fitAll();
  window.addEventListener("resize", fitAll);
  if (document.fonts) document.fonts.ready.then(fitAll);

  /* ---------- NIFFF : la silhouette descend le long de sa ligne d'aspiration, puis disparaît dans l'œil ---------- */
  document.querySelectorAll(".plunge").forEach(pl => {
    const stage = pl.querySelector(".plunge__stage");
    const fig = pl.querySelector(".plunge__fig");
    const img = fig.querySelector("img");
    const eye = pl.querySelector(".plunge__eye");
    const update = () => {
      const r = pl.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp(-r.top / Math.max(1, r.height - vh));           // 0 → 1 pendant que la scène est collée
      const sr = stage.getBoundingClientRect(), er = eye.getBoundingClientRect();
      const pupil = er.top - sr.top + er.height * 0.08;                // haut de l'œil
      const figH = img.offsetHeight;
      const start = vh * (window.innerWidth <= 860 ? 0.4 : 0.08);
      const endY = pupil - figH * 0.45;                                // la silhouette entre derrière l'œil
      const y = start + (endY - start) * (p * p);                      // chute qui accélère doucement
      fig.style.setProperty("--fy", y.toFixed(1) + "px");
      // la ligne relie la silhouette à l'œil : elle se raccourcit pendant la chute
      fig.style.setProperty("--lh", Math.max(0, pupil - (y + figH)).toFixed(1) + "px");
      fig.style.setProperty("--fo", (1 - clamp((p - 0.94) / 0.06)).toFixed(3));
    };
    window.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    window.addEventListener("resize", update);
    if (img.complete) update(); else img.addEventListener("load", update);
    update();
  });

  /* ---------- AFFICHES : tester les couleurs de l'affiche jaune ---------- */
  document.querySelectorAll(".po").forEach(po => {
    const img = po.querySelector(".po__img");
    const dots = [...po.querySelectorAll(".po__dot")];
    dots.forEach(d => d.addEventListener("click", () => {
      dots.forEach(x => x.setAttribute("aria-pressed", String(x === d)));
      img.src = d.dataset.src;
    }));
  });

  /* ---------- PIERRE NOIR : retrouve les paires ---------- */
  document.querySelectorAll(".memo").forEach(memo => {
    const grid = memo.querySelector(".memo__grid");
    const names = grid.dataset.cards.split(" ");
    const nEl = memo.querySelector(".memo__n");
    const win = memo.querySelector(".memo__win");
    let open = [], done = 0, lock = false;

    const deal = () => {
      const deck = names.slice().sort(() => Math.random() - 0.5);
      grid.innerHTML = deck.map(n => `
        <button type="button" class="mcard" data-pair="${n.replace("-x", "")}" aria-label="carte">
          <span class="mcard__in" style="--r:${(Math.random() * 6 - 3).toFixed(1)}deg">
            <img class="mcard__back" src="assets/img/pierre-noir/cards/back.png" alt="">
            <img class="mcard__front" src="assets/img/pierre-noir/cards/${n}.png" alt="">
          </span>
        </button>`).join("");
      open = []; done = 0; lock = false; nEl.textContent = "0"; win.hidden = true;
    };

    grid.addEventListener("click", e => {
      const c = e.target.closest(".mcard");
      if (!c || lock || c.classList.contains("is-open") || c.classList.contains("is-done")) return;
      c.classList.add("is-open"); open.push(c);
      if (open.length < 2) return;
      const [a, b] = open;
      if (a.dataset.pair === b.dataset.pair) {
        a.classList.replace("is-open", "is-done"); b.classList.replace("is-open", "is-done");
        open = []; done++; nEl.textContent = done;
        if (done === names.length / 2) win.hidden = false;
      } else {
        lock = true;
        setTimeout(() => { a.classList.remove("is-open"); b.classList.remove("is-open"); open = []; lock = false; }, 950);
      }
    });
    memo.querySelector(".memo__again").addEventListener("click", deal);
    deal();
  });

  /* ---------- démarrage ---------- */
  applyLang(lang);
})();
