/* =========================================================
   LA SUCURSAL TECNOLÓGICA — INTERACTIVIDAD
   Todo en JavaScript puro (sin librerías extra).
========================================================= */
(function () {
  "use strict";

  // ---------- Utilidades ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const movimientoReducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const punteroFino = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const WHATSAPP = (window.LST && window.LST.whatsapp) || "573168869259";
  const STATIC = (window.LST && window.LST.static) || "/static/";

  let PRODUCTOS = [];
  try {
    PRODUCTOS = JSON.parse($("#datos-productos").textContent || "[]");
  } catch (e) {
    PRODUCTOS = [];
  }
  const PORID = Object.fromEntries(PRODUCTOS.map((p) => [p.id, p]));

  const escapar = (t) =>
    String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const imgUrl = (p) => STATIC + p.imagen;
  const logoUrl = STATIC + "img/logo.png";
  const linkWA = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
  const sinTildes = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const guardar = (clave, valor) => {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* modo privado */ }
  };
  const leer = (clave, defecto) => {
    try { const v = JSON.parse(localStorage.getItem(clave)); return v == null ? defecto : v; } catch (e) { return defecto; }
  };

  // ---------- Aviso (toast) ----------
  const toastEl = $("#toast");
  let toastTimer;
  function aviso(html, tipo = "ok") {
    if (!toastEl) return;
    toastEl.innerHTML = html;
    toastEl.className = "toast-lst visible " + tipo;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("visible"), 2600);
  }

  // ---------- Resumen de specs (texto corto) ----------
  function specsLista(p) {
    if (p.specs) {
      const s = p.specs;
      return [
        ["fa-microchip", "Procesador", s.cpu],
        ["fa-memory", "RAM", s.ram_corta],
        ["fa-hard-drive", "Almacenamiento", s.disco_corto],
        ["fa-display", "Pantalla", s.pantalla_corta],
        ["fa-bolt", "Gráfica", s.grafica_corta || "Integrada"],
      ].filter((x) => x[2]);
    }
    if (p.funciones) return p.funciones.map((f) => ["fa-check", f, "Sí"]);
    return [];
  }
  function resumenCorto(p) {
    if (p.specs) return [p.specs.cpu, p.specs.ram_corta, p.specs.disco_corto].filter(Boolean).join(" · ");
    if (p.funciones) return p.funciones.join(" · ");
    return p.descripcion;
  }

  /* =========================================================
     NAVBAR, PROGRESO DE SCROLL, VOLVER ARRIBA
  ========================================================= */
  const navbar = $("#navbar");
  const barra = $("#scrollProgress");
  const toTop = $("#toTop");
  function alHacerScroll() {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle("scrolled", y > 60);
    if (barra) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
    if (toTop) toTop.classList.toggle("visible", y > 700);
  }
  window.addEventListener("scroll", alHacerScroll, { passive: true });
  alHacerScroll();
  toTop && toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Cerrar el menú móvil al tocar un enlace
  $$("#menu .nav-link").forEach((a) =>
    a.addEventListener("click", () => {
      const menu = $("#menu");
      if (menu && menu.classList.contains("show") && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
      }
    })
  );

  /* =========================================================
     APARICIÓN AL HACER SCROLL
  ========================================================= */
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observador.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => observador.observe(el));

  /* =========================================================
     CONTADORES ANIMADOS
  ========================================================= */
  const obsContador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const fin = parseInt(el.dataset.contar, 10) || 0;
        obsContador.unobserve(el);
        if (movimientoReducido) { el.textContent = fin; return; }
        const inicio = performance.now();
        const dur = 1400;
        (function paso(t) {
          const k = Math.min((t - inicio) / dur, 1);
          el.textContent = Math.round(fin * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(paso);
        })(inicio);
      });
    },
    { threshold: 0.5 }
  );
  $$("[data-contar]").forEach((el) => obsContador.observe(el));

  /* =========================================================
     PARTÍCULAS DEL HERO (tu animación original, optimizada)
  ========================================================= */
  const canvas = $("#hero-canvas");
  if (canvas && !movimientoReducido) {
    const ctx = canvas.getContext("2d");
    let W, H, particulas = [], activo = true;
    const mouse = { x: -9999, y: -9999 };
    const contenedor = canvas.parentElement;

    function medir() {
      W = canvas.width = contenedor.offsetWidth;
      H = canvas.height = contenedor.offsetHeight;
    }
    function crear() {
      particulas = [];
      const n = Math.min(Math.floor((W * H) / 8000), 140);
      for (let i = 0; i < n; i++) {
        particulas.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.8 + 0.4,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          a: Math.random() * 0.5 + 0.1,
          c: Math.random() > 0.5 ? "56,189,248" : "37,99,235",
        });
      }
    }
    medir(); crear();
    window.addEventListener("resize", () => { medir(); crear(); });
    contenedor.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    contenedor.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });

    new IntersectionObserver((e) => { activo = e[0].isIntersecting; if (activo) requestAnimationFrame(dibujar); })
      .observe(contenedor);

    function dibujar() {
      if (!activo) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of particulas) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 120 && d > 0) {
          const f = ((120 - d) / 120) * 0.8;
          p.x -= (dx / d) * f; p.y -= (dy / d) * f;
        }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.a})`; ctx.fill();
      }
      for (let i = 0; i < particulas.length; i++) {
        for (let j = i + 1; j < particulas.length; j++) {
          const a = particulas[i], b = particulas[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(56,189,248,${(1 - d / 100) * 0.08})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
        // línea hacia el mouse
        const p = particulas[i];
        const dm = Math.hypot(mouse.x - p.x, mouse.y - p.y);
        if (dm < 160) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(56,189,248,${(1 - dm / 160) * 0.25})`;
          ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
      requestAnimationFrame(dibujar);
    }
    requestAnimationFrame(dibujar);
  }

  /* =========================================================
     HERO: LUZ QUE SIGUE EL MOUSE + PARALLAX DEL LOGO
  ========================================================= */
  const hero = $(".hero");
  const glow = $("#heroGlow");
  const visual = $("#heroVisual");
  if (hero && punteroFino && !movimientoReducido) {
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (glow) { glow.style.opacity = 1; glow.style.transform = `translate(${x - 300}px, ${y - 300}px)`; }
      if (visual) {
        const rx = (x / r.width - 0.5) * 20, ry = (y / r.height - 0.5) * 20;
        visual.style.setProperty("--px", `${rx}px`);
        visual.style.setProperty("--py", `${ry}px`);
      }
    });
    hero.addEventListener("mouseleave", () => { if (glow) glow.style.opacity = 0; });
  }

  /* =========================================================
     TEXTO QUE SE ESCRIBE SOLO
  ========================================================= */
  const typing = $("#typing");
  if (typing) {
    let palabras = [];
    try { palabras = JSON.parse(typing.dataset.palabras); } catch (e) { palabras = []; }
    if (movimientoReducido || !palabras.length) {
      typing.textContent = palabras[0] || "";
    } else {
      let i = 0, j = 0, borrando = false;
      (function escribir() {
        const palabra = palabras[i];
        typing.textContent = palabra.slice(0, j);
        let espera = borrando ? 35 : 70;
        if (!borrando && j === palabra.length) { borrando = true; espera = 1600; }
        else if (borrando && j === 0) { borrando = false; i = (i + 1) % palabras.length; espera = 300; }
        j += borrando ? -1 : 1;
        setTimeout(escribir, espera);
      })();
    }
  }

  /* =========================================================
     BOTONES MAGNÉTICOS Y TARJETAS CON INCLINACIÓN 3D
  ========================================================= */
  if (punteroFino && !movimientoReducido) {
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });

    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest && e.target.closest(".tilt");
      $$(".tilt.tilting").forEach((c) => { if (c !== card) soltarTilt(c); });
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      const fuerza = card.classList.contains("cat-card") ? 8 : 5;
      card.classList.add("tilting");
      card.style.setProperty("--rx", `${(0.5 - y) * fuerza}deg`);
      card.style.setProperty("--ry", `${(x - 0.5) * fuerza}deg`);
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });
    function soltarTilt(c) {
      c.classList.remove("tilting");
      c.style.removeProperty("--rx"); c.style.removeProperty("--ry");
    }
  }

  /* =========================================================
     MENÚ DESPLEGABLE DE CATEGORÍAS (táctil)
  ========================================================= */
  $$(".dropdown-lst > .nav-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (window.innerWidth < 992) {
        const li = a.parentElement;
        if (!li.classList.contains("abierto")) { e.preventDefault(); li.classList.add("abierto"); }
      }
    });
  });

  /* =========================================================
     COTIZACIÓN (carrito que se envía por WhatsApp)
  ========================================================= */
  const CLAVE_COT = "lst_cotizacion";
  let cotizacion = leer(CLAVE_COT, []).filter((i) => PORID[i.id]);
  const drawer = $("#drawerCotizacion");

  function contarCotizacion() {
    const total = cotizacion.reduce((s, i) => s + i.qty, 0);
    $$("[data-contador-cotizacion]").forEach((el) => {
      el.textContent = total;
      el.classList.toggle("con-items", total > 0);
    });
    $$("[data-agregar]").forEach((b) => {
      const ya = cotizacion.some((i) => i.id === b.dataset.agregar);
      b.classList.toggle("agregado", ya);
      b.innerHTML = ya ? '<i class="fas fa-check"></i> En tu cotización' : '<i class="fas fa-plus"></i> Agregar a cotización';
    });
  }

  function pintarCotizacion() {
    const lista = $("#listaCotizacion");
    if (!lista) return;
    if (!cotizacion.length) {
      lista.innerHTML = `
        <div class="drawer-vacio">
          <i class="fas fa-file-circle-plus"></i>
          <p>Aún no has agregado productos.</p>
          <small>Toca "Agregar a cotización" en cualquier producto.</small>
        </div>`;
    } else {
      lista.innerHTML = cotizacion.map(({ id, qty }) => {
        const p = PORID[id];
        return `
          <div class="drawer-item" data-id="${id}">
            <img src="${imgUrl(p)}" alt="" onerror="this.src='${logoUrl}'">
            <div class="drawer-item-info">
              <strong>${escapar(p.nombre)}</strong>
              <small>${escapar(resumenCorto(p))}</small>
              <span class="drawer-precio">${p.precio ? escapar(p.precio) : "Precio a consultar"}</span>
            </div>
            <div class="cantidad">
              <button type="button" data-menos aria-label="Menos">−</button>
              <span>${qty}</span>
              <button type="button" data-mas aria-label="Más">+</button>
            </div>
            <button type="button" class="drawer-quitar" data-quitar aria-label="Quitar"><i class="fas fa-trash"></i></button>
          </div>`;
      }).join("");
    }
    const enviar = $("#enviarCotizacion");
    if (enviar) enviar.disabled = !cotizacion.length;
    contarCotizacion();
  }

  function agregarACotizacion(id, origen) {
    const p = PORID[id];
    if (!p) return;
    const item = cotizacion.find((i) => i.id === id);
    if (item) {
      abrirCotizacion();
      return;
    }
    cotizacion.push({ id, qty: 1 });
    guardar(CLAVE_COT, cotizacion);
    pintarCotizacion();
    volarAlCarrito(origen);
    aviso(`<i class="fas fa-check-circle me-2"></i><b>${escapar(p.nombre)}</b> agregado. <button type="button" class="toast-accion" data-abrir-cotizacion>Ver cotización</button>`);
  }

  function volarAlCarrito(origen) {
    const destino = $(".nav-cart");
    if (!origen || !destino || movimientoReducido) return;
    const tarjeta = origen.closest(".producto-premium, .modal-producto, .quiz-reco");
    const img = tarjeta && tarjeta.querySelector("img");
    if (!img) return;
    const a = img.getBoundingClientRect();
    let b = destino.getBoundingClientRect();
    if (!b.width) b = { left: window.innerWidth - 60, top: 20, width: 20, height: 20 }; // menú móvil cerrado
    const clon = img.cloneNode();
    clon.className = "img-volando";
    Object.assign(clon.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
    document.body.appendChild(clon);
    requestAnimationFrame(() => {
      clon.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px, ${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.08)`;
      clon.style.opacity = "0.3";
    });
    setTimeout(() => { clon.remove(); destino.classList.add("rebote"); setTimeout(() => destino.classList.remove("rebote"), 500); }, 750);
  }

  function abrirCotizacion() {
    if (!drawer) return;
    pintarCotizacion();
    document.body.classList.add("drawer-abierto");
    drawer.setAttribute("aria-hidden", "false");
    setTimeout(() => { const b = drawer.querySelector("button"); b && b.focus(); }, 50);
  }
  function cerrarCotizacion() {
    document.body.classList.remove("drawer-abierto");
    drawer && drawer.setAttribute("aria-hidden", "true");
  }

  const nota = $("#notaCotizacion");
  if (nota) {
    nota.value = leer("lst_nota", "");
    nota.addEventListener("input", () => guardar("lst_nota", nota.value));
  }

  $("#listaCotizacion") && $("#listaCotizacion").addEventListener("click", (e) => {
    const fila = e.target.closest(".drawer-item");
    if (!fila) return;
    const item = cotizacion.find((i) => i.id === fila.dataset.id);
    if (!item) return;
    if (e.target.closest("[data-mas]")) item.qty = Math.min(item.qty + 1, 99);
    else if (e.target.closest("[data-menos]")) item.qty = Math.max(item.qty - 1, 1);
    else if (e.target.closest("[data-quitar]")) cotizacion = cotizacion.filter((i) => i !== item);
    else return;
    guardar(CLAVE_COT, cotizacion);
    pintarCotizacion();
  });

  $("#enviarCotizacion") && $("#enviarCotizacion").addEventListener("click", () => {
    if (!cotizacion.length) return;
    const lineas = cotizacion.map(({ id, qty }, n) => {
      const p = PORID[id];
      return `${n + 1}. ${p.nombre} (x${qty})\n   ${resumenCorto(p)}${p.precio ? "\n   Precio web: " + p.precio : ""}`;
    });
    let texto = `Hola, quiero cotizar estos productos de La Sucursal Tecnológica:\n\n${lineas.join("\n")}`;
    if (nota && nota.value.trim()) texto += `\n\nNota: ${nota.value.trim()}`;
    window.open(linkWA(texto), "_blank", "noopener");
  });

  $("#vaciarCotizacion") && $("#vaciarCotizacion").addEventListener("click", () => {
    if (!cotizacion.length) return;
    cotizacion = [];
    guardar(CLAVE_COT, cotizacion);
    pintarCotizacion();
    aviso('<i class="fas fa-trash me-2"></i>Cotización vaciada', "info");
  });

  /* =========================================================
     VISTA RÁPIDA (modal)
  ========================================================= */
  const modal = $("#modalProducto");
  let focoAnterior = null;

  function abrirModal(html) {
    if (!modal) return;
    focoAnterior = document.activeElement;
    $("#modalContenido").innerHTML = html;
    modal.classList.add("abierto");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("sin-scroll");
    setTimeout(() => { const b = modal.querySelector(".modal-lst-cerrar"); b && b.focus(); }, 50);
  }
  function cerrarModal() {
    if (!modal || !modal.classList.contains("abierto")) return;
    modal.classList.remove("abierto");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("sin-scroll");
    focoAnterior && focoAnterior.focus && focoAnterior.focus();
  }

  function verProducto(id) {
    const p = PORID[id];
    if (!p) return;
    const filas = specsLista(p).map(([ic, k, v]) => `
      <div class="modal-spec"><i class="fas ${ic}"></i><span>${escapar(k)}</span><b>${escapar(v)}</b></div>`).join("");
    const relacionados = PRODUCTOS
      .filter((x) => x.id !== p.id && x.categoria === p.categoria && (x.marca === p.marca || x.tipo === p.tipo))
      .sort((a, b) => (b.tipo === p.tipo) - (a.tipo === p.tipo) || (b.marca === p.marca) - (a.marca === p.marca))
      .slice(0, 3);
    abrirModal(`
      <div class="modal-producto" id="modalTitulo-wrap">
        <div class="modal-producto-img">
          <span class="badge-producto ${p.tipo === "Gamer" ? "gamer" : "destacado"}">${p.tipo === "Gamer" ? "GAMER" : escapar(p.tipo.toUpperCase())}</span>
          <img src="${imgUrl(p)}" alt="${escapar(p.nombre)}" onerror="this.src='${logoUrl}'">
        </div>
        <div class="modal-producto-info">
          <span class="prod-cat">${escapar(p.marca)} · ${escapar(p.tipo)}</span>
          <h2 id="modalTitulo">${escapar(p.nombre)}</h2>
          <div class="modal-specs">${filas}</div>
          <p class="modal-desc"><b>Ficha completa:</b> ${escapar(p.descripcion)}</p>
          <div class="precio-box">${p.precio ? `<span class="prod-precio">${escapar(p.precio)}</span>` : '<span class="precio-consultar"><i class="fas fa-tag me-1"></i>Precio a consultar</span>'}</div>
          <div class="card-acciones mt-3">
            <button class="btn-comprar" type="button" data-agregar="${p.id}"><i class="fas fa-plus"></i> Agregar a cotización</button>
            <a class="btn-icono btn-icono-wa" target="_blank" rel="noopener" href="${linkWA(`Hola, estoy interesado en ${p.nombre} (${p.descripcion})`)}" aria-label="Preguntar por WhatsApp"><i class="fab fa-whatsapp"></i></a>
          </div>
          ${relacionados.length ? `
          <div class="modal-relacionados">
            <span class="filtro-titulo">También te puede interesar</span>
            <div>${relacionados.map((r) => `
              <button type="button" class="mini-producto" data-ver="${r.id}">
                <img src="${imgUrl(r)}" alt="" onerror="this.src='${logoUrl}'">
                <span><b>${escapar(r.nombre)}</b><small>${escapar(resumenCorto(r))}</small></span>
              </button>`).join("")}</div>
          </div>` : ""}
        </div>
      </div>`);
    contarCotizacion();
  }

  /* =========================================================
     COMPARADOR (hasta 3 productos)
  ========================================================= */
  let comparar = [];
  try { comparar = JSON.parse(sessionStorage.getItem("lst_comparar") || "[]").filter((id) => PORID[id]); } catch (e) { comparar = []; }
  const barraComparar = $("#compareBar");

  function pintarComparador() {
    try { sessionStorage.setItem("lst_comparar", JSON.stringify(comparar)); } catch (e) { /* nada */ }
    $$("[data-comparar]").forEach((c) => { c.checked = comparar.includes(c.dataset.comparar); });
    if (!barraComparar) return;
    barraComparar.classList.toggle("visible", comparar.length > 0);
    document.body.classList.toggle("con-comparador", comparar.length > 0);
    $("#compareItems").innerHTML = comparar.map((id) => {
      const p = PORID[id];
      return `<span class="compare-chip"><img src="${imgUrl(p)}" alt="" onerror="this.src='${logoUrl}'">${escapar(p.nombre)}<button type="button" data-quitar-comparar="${id}" aria-label="Quitar">×</button></span>`;
    }).join("") + (comparar.length < 3 ? `<span class="compare-hueco">+ elige ${3 - comparar.length} más</span>` : "");
    $("#compareVer").disabled = comparar.length < 2;
  }

  function alternarComparar(id, marcado) {
    if (marcado) {
      if (comparar.includes(id)) return;
      const cat = PORID[id].categoria;
      if (comparar.length && PORID[comparar[0]].categoria !== cat) {
        aviso('<i class="fas fa-circle-info me-2"></i>Compara productos de la misma categoría.', "info");
      } else if (comparar.length >= 3) {
        aviso('<i class="fas fa-circle-info me-2"></i>Puedes comparar máximo 3 productos.', "info");
      } else {
        comparar.push(id);
      }
    } else {
      comparar = comparar.filter((x) => x !== id);
    }
    pintarComparador();
  }

  function verComparacion() {
    const ps = comparar.map((id) => PORID[id]);
    if (ps.length < 2) return;
    let filas;
    if (ps[0].specs) {
      const mejor = (valores, mayor = true) => {
        const nums = valores.map(Number);
        const top = mayor ? Math.max(...nums) : Math.min(...nums);
        return nums.map((n) => n === top && nums.filter((m) => m === top).length < nums.length);
      };
      const ram = mejor(ps.map((p) => p.specs.ram_gb));
      const cpu = mejor(ps.map((p) => p.specs.nivel_cpu));
      const pant = mejor(ps.map((p) => p.specs.pulgadas));
      filas = [
        ["Marca", ps.map((p) => p.marca)],
        ["Tipo", ps.map((p) => p.tipo)],
        ["Procesador", ps.map((p) => p.specs.cpu), cpu],
        ["RAM", ps.map((p) => p.specs.ram_corta || "—"), ram],
        ["Almacenamiento", ps.map((p) => p.specs.disco_corto || "—")],
        ["Pantalla", ps.map((p) => p.specs.pantalla_corta || "—"), pant],
        ["Gráfica", ps.map((p) => p.specs.grafica_corta || "Integrada"), ps.map((p) => !!p.specs.grafica_corta && ps.some((q) => !q.specs.grafica_corta))],
        ["Precio", ps.map((p) => p.precio || "A consultar")],
      ];
    } else {
      const todas = [...new Set(ps.flatMap((p) => p.funciones || []))];
      filas = [["Marca", ps.map((p) => p.marca)], ["Tipo", ps.map((p) => p.tipo)]]
        .concat(todas.map((f) => [f, ps.map((p) => ((p.funciones || []).includes(f) ? "✓ Sí" : "—"))]))
        .concat([["Precio", ps.map((p) => p.precio || "A consultar")]]);
    }
    abrirModal(`
      <div class="comparacion">
        <span class="section-label">COMPARADOR</span>
        <h2 id="modalTitulo">Comparación lado a lado</h2>
        <p class="sub">Resaltamos en azul el mejor valor de cada fila.</p>
        <div class="tabla-scroll">
          <table class="tabla-comparar">
            <thead><tr><th></th>${ps.map((p) => `
              <th><img src="${imgUrl(p)}" alt="" onerror="this.src='${logoUrl}'"><span>${escapar(p.nombre)}</span></th>`).join("")}</tr></thead>
            <tbody>${filas.map(([k, vals, dest]) => `
              <tr><th>${escapar(k)}</th>${vals.map((v, i) => `<td class="${dest && dest[i] ? "mejor" : ""}">${escapar(v)}</td>`).join("")}</tr>`).join("")}
              <tr><th></th>${ps.map((p) => `<td><button class="btn-comprar" type="button" data-agregar="${p.id}"><i class="fas fa-plus"></i> Agregar</button></td>`).join("")}</tr>
            </tbody>
          </table>
        </div>
      </div>`);
    contarCotizacion();
  }

  $("#compareVer") && $("#compareVer").addEventListener("click", verComparacion);
  $("#compareLimpiar") && $("#compareLimpiar").addEventListener("click", () => { comparar = []; pintarComparador(); });

  /* =========================================================
     CLICS GLOBALES (delegación)
  ========================================================= */
  document.addEventListener("click", (e) => {
    const t = e.target;
    const agregar = t.closest("[data-agregar]");
    if (agregar) { e.preventDefault(); agregarACotizacion(agregar.dataset.agregar, agregar); return; }
    const ver = t.closest("[data-ver]");
    if (ver) { e.preventDefault(); verProducto(ver.dataset.ver); return; }
    if (t.closest("[data-abrir-cotizacion]")) { e.preventDefault(); cerrarModal(); abrirCotizacion(); return; }
    if (t.closest("[data-cerrar-cotizacion]")) { cerrarCotizacion(); return; }
    if (t.closest("[data-cerrar-modal]")) { cerrarModal(); return; }
    const quitarComp = t.closest("[data-quitar-comparar]");
    if (quitarComp) { alternarComparar(quitarComp.dataset.quitarComparar, false); return; }
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-comparar]")) alternarComparar(e.target.dataset.comparar, e.target.checked);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { cerrarModal(); cerrarCotizacion(); }
    const escribiendo = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (e.key === "/" && !escribiendo) {
      const buscador = $("#buscador") || $("#buscadorGlobal");
      if (buscador) { e.preventDefault(); buscador.focus(); buscador.scrollIntoView({ block: "center", behavior: "smooth" }); }
    }
  });

  /* =========================================================
     BUSCADOR GLOBAL DEL INICIO
  ========================================================= */
  const buscadorGlobal = $("#buscadorGlobal");
  const resultados = $("#resultadosGlobal");
  if (buscadorGlobal && resultados) {
    let indice = -1;
    const buscar = () => {
      const q = sinTildes(buscadorGlobal.value.trim());
      indice = -1;
      if (q.length < 2) { resultados.classList.remove("visible"); resultados.innerHTML = ""; return; }
      const palabras = q.split(/\s+/);
      // Primero los que tienen la frase exacta ("ryzen 7"), luego los que tienen todas las palabras
      const puntuados = PRODUCTOS.map((p) => {
        const texto = sinTildes(`${p.nombre} ${p.marca} ${p.tipo} ${p.descripcion} ${p.categoria}`);
        const nombre = sinTildes(p.nombre);
        let s = 0;
        if (palabras.every((w) => texto.includes(w))) s = 1;
        if (texto.includes(q)) s = 3;
        if (nombre.includes(q)) s = 5;
        return { p, s };
      }).filter((x) => x.s > 0);
      const mejor = Math.max(0, ...puntuados.map((x) => x.s));
      const encontrados = puntuados
        .filter((x) => (mejor >= 3 ? x.s >= 3 : true))
        .sort((a, b) => b.s - a.s)
        .map((x) => x.p)
        .slice(0, 6);
      resultados.innerHTML = encontrados.length
        ? encontrados.map((p) => `
            <button type="button" class="resultado" role="option" data-ver="${p.id}">
              <img src="${imgUrl(p)}" alt="" onerror="this.src='${logoUrl}'">
              <span><b>${escapar(p.nombre)}</b><small>${escapar(resumenCorto(p))}</small></span>
              <i class="fas fa-arrow-right"></i>
            </button>`).join("") + `<div class="resultado-pie">${encontrados.length} resultado(s) · Enter para abrir</div>`
        : `<div class="resultado-vacio">No encontramos "${escapar(buscadorGlobal.value)}". <a href="${linkWA("Hola, estoy buscando: " + buscadorGlobal.value)}" target="_blank" rel="noopener">Pregúntanos por WhatsApp</a></div>`;
      resultados.classList.add("visible");
    };
    buscadorGlobal.addEventListener("input", buscar);
    buscadorGlobal.addEventListener("focus", buscar);
    buscadorGlobal.addEventListener("keydown", (e) => {
      const items = $$(".resultado", resultados);
      if (!items.length) return;
      if (e.key === "ArrowDown") { e.preventDefault(); indice = (indice + 1) % items.length; }
      else if (e.key === "ArrowUp") { e.preventDefault(); indice = (indice - 1 + items.length) % items.length; }
      else if (e.key === "Enter") { e.preventDefault(); (items[indice] || items[0]).click(); return; }
      else return;
      items.forEach((it, i) => it.classList.toggle("activo", i === indice));
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#heroBuscador")) resultados.classList.remove("visible");
    });
  }

  /* =========================================================
     PESTAÑAS DEL CATÁLOGO (inicio)
  ========================================================= */
  const tabs = $("#tabsCatalogo");
  const gridInicio = $("#gridInicio");
  if (tabs && gridInicio) {
    const indicador = $(".tab-indicador", tabs);
    const verTodo = $("#verTodoCatalogo");
    const moverIndicador = (btn) => {
      if (!indicador) return;
      indicador.style.width = btn.offsetWidth + "px";
      indicador.style.transform = `translateX(${btn.offsetLeft}px)`;
    };
    const mostrar = (tab) => {
      let n = 0;
      $$(".producto-item", gridInicio).forEach((item) => {
        const coincide =
          tab === "destacados" ? item.dataset.destacado === "si" :
          tab === "impresoras" ? item.dataset.cat === "impresoras" :
          item.dataset.cat === "portatiles" && item.dataset.tipo === tab;
        const visible = coincide && n < 6;
        if (visible) { item.style.setProperty("--orden", n); n++; }
        item.hidden = !visible;
        item.classList.remove("entrando");
        if (visible) { void item.offsetWidth; item.classList.add("entrando"); }
      });
      if (verTodo) {
        const destino = tab === "impresoras" ? "/categoria/impresoras" :
          tab === "Gamer" ? "/categoria/portatiles?tipo=Gamer" :
          tab === "Corporativo" ? "/categoria/portatiles?tipo=Corporativo" : "/categoria/portatiles";
        verTodo.setAttribute("href", destino);
      }
    };
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab-lst");
      if (!btn) return;
      $$(".tab-lst", tabs).forEach((b) => { b.classList.toggle("active", b === btn); b.setAttribute("aria-selected", b === btn); });
      moverIndicador(btn);
      mostrar(btn.dataset.tab);
    });
    mostrar("destacados");
    const activo = $(".tab-lst.active", tabs);
    requestAnimationFrame(() => moverIndicador(activo));
    window.addEventListener("resize", () => moverIndicador($(".tab-lst.active", tabs)));
  }

  /* =========================================================
     ASESOR VIRTUAL (quiz)
  ========================================================= */
  const quiz = $("#quiz");
  if (quiz) {
    const respuestas = {};
    let historial = [];
    const barraQuiz = $("#quizBarra");
    const atras = $("#quizAtras");

    const irA = (paso) => {
      $$(".quiz-paso", quiz).forEach((p) => p.classList.toggle("activo", p.dataset.paso === String(paso)));
      const avance = { 1: 0, 2: 33, 3: 66, resultado: 100 }[paso];
      if (barraQuiz) barraQuiz.style.width = avance + "%";
      if (atras) atras.hidden = paso === 1 || paso === "resultado";
    };

    const prepararPaso2 = () => {
      const impresora = respuestas.uso === "imprimir";
      $("[data-titulo-portatil]", quiz).hidden = impresora;
      $("[data-titulo-impresora]", quiz).hidden = !impresora;
      $("[data-opciones-portatil]", quiz).hidden = impresora;
      $("[data-opciones-impresora]", quiz).hidden = !impresora;
    };
    const prepararPaso3 = () => {
      const cat = respuestas.uso === "imprimir" ? "impresoras" : "portatiles";
      const marcas = [...new Set(PRODUCTOS.filter((p) => p.categoria === cat).map((p) => p.marca))].sort();
      $("#quizMarcas").innerHTML =
        `<button type="button" data-respuesta="marca" data-valor=""><i class="fas fa-shuffle"></i><span>Me da igual</span></button>` +
        marcas.map((m) => `<button type="button" data-respuesta="marca" data-valor="${escapar(m)}"><span class="quiz-marca">${escapar(m)}</span></button>`).join("");
    };

    const puntuar = (p) => {
      let s = 0;
      if (respuestas.uso === "imprimir") {
        if (p.categoria !== "impresoras") return -1;
        if ((p.funciones || []).includes(respuestas.prioridad)) s += 10;
        s += (p.funciones || []).length;
      } else {
        if (p.categoria !== "portatiles") return -1;
        const sp = p.specs;
        if (respuestas.uso === "gaming") s += sp.tiene_grafica ? 20 : -10;
        else s += p.tipo === "Corporativo" ? 6 : 0;
        if (respuestas.uso === "estudio") s += sp.nivel_cpu <= 2 ? 3 : 0;
        switch (respuestas.prioridad) {
          case "precio": s += (5 - sp.nivel_cpu) * 3 + (sp.tiene_grafica ? -4 : 0); break;
          case "rendimiento": s += sp.nivel_cpu * 4 + sp.ram_gb / 4; break;
          case "ram": s += sp.ram_gb; break;
          case "portatil": s += sp.pulgadas && sp.pulgadas <= 14 ? 12 : 0; break;
        }
      }
      if (respuestas.marca && p.marca === respuestas.marca) s += 8;
      return s;
    };

    const razon = (p) => {
      if (p.categoria === "impresoras") {
        return (p.funciones || []).includes(respuestas.prioridad) ? `Tiene ${respuestas.prioridad.toLowerCase()}` : "Buena opción para tu uso";
      }
      const sp = p.specs;
      return {
        precio: sp.nivel_cpu <= 1 ? "La opción más económica" : "Buen equilibrio precio / rendimiento",
        rendimiento: `Procesador de gama ${["", "básica", "media", "alta", "tope"][sp.nivel_cpu]}`,
        ram: `${sp.ram_gb}GB de RAM para multitarea`,
        portatil: sp.pulgadas <= 14 ? `Pantalla de ${sp.pulgadas}" más fácil de llevar` : "Pantalla amplia",
      }[respuestas.prioridad] || "Ideal para lo que necesitas";
    };

    const mostrarResultados = () => {
      const top = PRODUCTOS.map((p) => ({ p, s: puntuar(p) }))
        .filter((x) => x.s >= 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 3);
      $("#quizResultados").innerHTML = top.map(({ p }, i) => `
        <div class="quiz-reco" style="--orden:${i}">
          ${i === 0 ? '<span class="quiz-top">MEJOR OPCIÓN</span>' : ""}
          <img src="${imgUrl(p)}" alt="" onerror="this.src='${logoUrl}'">
          <div class="quiz-reco-info">
            <strong>${escapar(p.nombre)}</strong>
            <small>${escapar(resumenCorto(p))}</small>
            <span class="quiz-razon"><i class="fas fa-circle-check"></i>${escapar(razon(p))}</span>
          </div>
          <div class="quiz-reco-acciones">
            <button type="button" class="btn-icono" data-ver="${p.id}" aria-label="Ver detalles"><i class="fas fa-eye"></i></button>
            <button type="button" class="btn-icono btn-icono-azul" data-agregar-mini="${p.id}" aria-label="Agregar a cotización"><i class="fas fa-plus"></i></button>
          </div>
        </div>`).join("");
      const usos = { estudio: "estudio", oficina: "trabajo de oficina", gaming: "juegos y diseño", imprimir: "imprimir" };
      $("#quizWhatsapp").href = linkWA(
        `Hola, usé el asesor de la página. Busco un equipo para ${usos[respuestas.uso]}. Me recomendó: ${top.map((x) => x.p.nombre).join(", ")}. ¿Me ayudan a elegir?`
      );
    };

    quiz.addEventListener("click", (e) => {
      const mini = e.target.closest("[data-agregar-mini]");
      if (mini) { agregarACotizacion(mini.dataset.agregarMini, mini); mini.innerHTML = '<i class="fas fa-check"></i>'; return; }
      const op = e.target.closest("[data-respuesta]");
      if (!op) return;
      respuestas[op.dataset.respuesta] = op.dataset.valor;
      op.classList.add("elegida");
      setTimeout(() => op.classList.remove("elegida"), 400);
      const pasoActual = op.closest(".quiz-paso").dataset.paso;
      historial.push(pasoActual);
      if (pasoActual === "1") { prepararPaso2(); irA(2); }
      else if (pasoActual === "2") { prepararPaso3(); irA(3); }
      else { mostrarResultados(); irA("resultado"); }
    });
    atras && atras.addEventListener("click", () => {
      const previo = historial.pop();
      if (previo) irA(isNaN(previo) ? previo : Number(previo));
    });
    $("#quizReiniciar") && $("#quizReiniciar").addEventListener("click", () => {
      Object.keys(respuestas).forEach((k) => delete respuestas[k]);
      historial = [];
      irA(1);
    });
    irA(1);
  }

  /* =========================================================
     SERVICIOS (se expanden) Y PREGUNTAS FRECUENTES
  ========================================================= */
  $$(".svc-card").forEach((card) => {
    const alternar = (e) => {
      if (e.target.closest(".svc-solicitar")) return;
      const abierto = card.classList.toggle("abierto");
      card.setAttribute("aria-expanded", abierto);
    };
    card.addEventListener("click", alternar);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); alternar(e); } });
  });

  $$(".faq-pregunta").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const abrir = !item.classList.contains("abierto");
      $$(".faq-item.abierto").forEach((i) => { i.classList.remove("abierto"); $(".faq-pregunta", i).setAttribute("aria-expanded", "false"); });
      if (abrir) { item.classList.add("abierto"); btn.setAttribute("aria-expanded", "true"); }
    });
  });

  // Línea del proceso que se llena al verla
  const proceso = $("#proceso");
  if (proceso) {
    new IntersectionObserver((e, o) => {
      if (e[0].isIntersecting) { proceso.classList.add("activo"); o.disconnect(); }
    }, { threshold: 0.4 }).observe(proceso);
  }

  /* =========================================================
     FILTROS DE LA PÁGINA DE CATEGORÍA
  ========================================================= */
  const grid = $("#gridCategoria");
  if (grid) {
    const items = $$(".producto-item", grid);
    const ordenOriginal = items.slice();
    const buscador = $("#buscador");
    const ordenar = $("#ordenar");
    const ram = $("#filtroRam");
    const RAM_PASOS = [0, 8, 12, 16];
    const estado = { q: "", marcas: new Set(), tipo: "", ram: 0, orden: "relevancia", vista: "grid" };

    // Leer filtros desde la dirección (?marca=HP&tipo=Gamer...)
    const params = new URLSearchParams(location.search);
    estado.q = params.get("q") || "";
    (params.get("marca") || "").split(",").filter(Boolean).forEach((m) => estado.marcas.add(m));
    estado.tipo = params.get("tipo") || "";
    estado.ram = Math.max(0, RAM_PASOS.indexOf(Number(params.get("ram") || 0)));
    estado.orden = params.get("orden") || "relevancia";
    estado.vista = leer("lst_vista", "grid");

    const datos = (item) => $(".producto-premium", item).dataset;

    function aplicar() {
      const palabras = sinTildes(estado.q.trim()).split(/\s+/).filter(Boolean);
      const ramMin = RAM_PASOS[estado.ram];
      let visibles = 0;

      // Ordenar
      const lista = ordenOriginal.slice();
      const cmp = {
        nombre: (a, b) => datos(a).buscar.localeCompare(datos(b).buscar),
        marca: (a, b) => datos(a).marca.localeCompare(datos(b).marca),
        rendimiento: (a, b) => (datos(b).cpu - datos(a).cpu) || (datos(b).ram - datos(a).ram),
        ram: (a, b) => datos(b).ram - datos(a).ram,
        pantalla: (a, b) => datos(b).pulgadas - datos(a).pulgadas,
      }[estado.orden];
      if (cmp) lista.sort(cmp);
      lista.forEach((it) => grid.appendChild(it));

      lista.forEach((item) => {
        const d = datos(item);
        const texto = sinTildes(d.buscar);
        const ok =
          palabras.every((w) => texto.includes(w)) &&
          (!estado.marcas.size || estado.marcas.has(d.marca)) &&
          (!estado.tipo || d.tipo === estado.tipo) &&
          (!ramMin || Number(d.ram || 0) >= ramMin);
        item.hidden = !ok;
        item.classList.remove("entrando");
        if (ok) {
          item.style.setProperty("--orden", Math.min(visibles, 12));
          void item.offsetWidth;
          item.classList.add("entrando");
          visibles++;
        }
      });

      // Interfaz
      $("#contadorResultados").textContent = `${visibles} de ${items.length} productos`;
      $("#sinResultados").hidden = visibles > 0;
      const preguntar = $("#preguntarBusqueda");
      if (preguntar) preguntar.href = linkWA(`Hola, estoy buscando ${estado.q ? '"' + estado.q + '"' : "un producto"} en ${document.title.split(" — ")[0]}. ¿Lo tienen disponible?`);
      $$("[data-filtro-marca]").forEach((b) => b.classList.toggle("active", b.dataset.filtroMarca ? estado.marcas.has(b.dataset.filtroMarca) : !estado.marcas.size));
      $$("[data-filtro-tipo]").forEach((b) => b.classList.toggle("active", b.dataset.filtroTipo === estado.tipo));
      if (ram) { ram.value = estado.ram; $("#ramValor").textContent = ["Cualquiera", "8GB", "12GB", "16GB o más"][estado.ram]; ram.style.setProperty("--pct", (estado.ram / 3) * 100 + "%"); }
      if (ordenar) ordenar.value = estado.orden;
      if (buscador && buscador.value !== estado.q) buscador.value = estado.q;
      grid.classList.toggle("vista-lista", estado.vista === "lista");
      $$("[data-vista]").forEach((b) => b.classList.toggle("active", b.dataset.vista === estado.vista));

      const activos = (estado.q ? 1 : 0) + estado.marcas.size + (estado.tipo ? 1 : 0) + (estado.ram ? 1 : 0);
      $("#limpiarFiltros").hidden = !activos && estado.orden === "relevancia";
      const badge = $("#filtrosActivos");
      if (badge) badge.textContent = activos ? `(${activos})` : "";

      // Guardar en la dirección para poder compartir el enlace
      const p = new URLSearchParams();
      if (estado.q) p.set("q", estado.q);
      if (estado.marcas.size) p.set("marca", [...estado.marcas].join(","));
      if (estado.tipo) p.set("tipo", estado.tipo);
      if (ramMin) p.set("ram", ramMin);
      if (estado.orden !== "relevancia") p.set("orden", estado.orden);
      history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : ""));
    }

    let espera;
    buscador && buscador.addEventListener("input", () => {
      clearTimeout(espera);
      espera = setTimeout(() => { estado.q = buscador.value; aplicar(); }, 150);
    });
    $$("[data-filtro-marca]").forEach((b) => b.addEventListener("click", () => {
      const m = b.dataset.filtroMarca;
      if (!m) estado.marcas.clear();
      else estado.marcas.has(m) ? estado.marcas.delete(m) : estado.marcas.add(m);
      aplicar();
    }));
    $$("[data-filtro-tipo]").forEach((b) => b.addEventListener("click", () => { estado.tipo = b.dataset.filtroTipo; aplicar(); }));
    ram && ram.addEventListener("input", () => { estado.ram = Number(ram.value); aplicar(); });
    ordenar && ordenar.addEventListener("change", () => { estado.orden = ordenar.value; aplicar(); });
    $$("[data-vista]").forEach((b) => b.addEventListener("click", () => { estado.vista = b.dataset.vista; guardar("lst_vista", estado.vista); aplicar(); }));

    const limpiar = () => {
      estado.q = ""; estado.marcas.clear(); estado.tipo = ""; estado.ram = 0; estado.orden = "relevancia";
      aplicar();
    };
    $("#limpiarFiltros").addEventListener("click", limpiar);
    $$("[data-limpiar]").forEach((b) => b.addEventListener("click", limpiar));

    const toggleFiltros = $("#toggleFiltros");
    toggleFiltros && toggleFiltros.addEventListener("click", () => {
      $("#filtrosPanel").classList.toggle("abierto");
      toggleFiltros.classList.toggle("active");
    });

    // Barra de filtros "pegada" con sombra al bajar
    const toolbar = $("#toolbar");
    if (toolbar) {
      const centinela = document.createElement("div");
      toolbar.before(centinela);
      new IntersectionObserver((e) => toolbar.classList.toggle("pegada", !e[0].isIntersecting), { rootMargin: "-80px 0px 0px 0px" })
        .observe(centinela);
    }

    aplicar();
  }

  // ---------- Arranque ----------
  pintarCotizacion();
  pintarComparador();
})();
