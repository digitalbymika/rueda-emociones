(() => {
  'use strict';

  const STORE_KEY = 'rueda-emociones:registros';
  const LIGHT = '#ffffff';
  const DARK = '#101618';

  const view = document.getElementById('view');
  const backBtn = document.getElementById('back');
  const crumbsEl = document.getElementById('crumbs');
  const historyBtn = document.getElementById('historyBtn');
  const toastEl = document.getElementById('toast');

  // basic y mid son objetos de EMOTIONS; precise es un texto o null
  const state = { screen: 'basic', basic: null, mid: null, precise: null, note: '' };

  // ---------- Utilidades ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  function mix(hex, target, amount) {
    const a = parseInt(hex.slice(1), 16);
    const b = parseInt(target.slice(1), 16);
    const ch = (n, s) => (n >> s) & 255;
    const m = (s) => Math.round(ch(a, s) * (1 - amount) + ch(b, s) * amount);
    return '#' + ((1 << 24) | (m(16) << 16) | (m(8) << 8) | m(0)).toString(16).slice(1);
  }

  // Estilo de un botón según el nivel: la básica en su color, los subniveles más claros
  function tone(color, level) {
    const light = [0, 0.45, 0.7][level - 1];
    const dark = [0, 0.2, 0.4][level - 1];
    return `--c:${color};--bg-l:${mix(color, LIGHT, light)};--bg-d:${mix(color, DARK, dark)}`;
  }

  const colorOf = (name) => (EMOTIONS.find((e) => e.name === name) || {}).color || '#7a8a8c';
  const routeOf = (e) => [e.basica, e.intermedia, e.precisa].filter(Boolean).join(' › ');

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // ---------- Almacenamiento ----------
  function loadEntries() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveEntries(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  }

  // ---------- Pantallas ----------
  const screens = {
    basic() {
      return `
        <h1>¿Qué sientes ahora?</h1>
        <p class="hint">Elige la emoción que más se acerque.</p>
        <div class="grid">
          ${EMOTIONS.map((e, i) => `
            <button class="emo lvl1" style="${tone(e.color, 1)}" data-action="basic" data-i="${i}">${esc(e.name)}</button>
          `).join('')}
        </div>`;
    },

    mid() {
      const b = state.basic;
      return `
        <h1>¿Qué tipo de ${esc(b.name.toLowerCase())}?</h1>
        <p class="hint">Afina un poco más.</p>
        <div class="grid">
          ${b.children.map((m, i) => `
            <button class="emo lvl2" style="${tone(b.color, 2)}" data-action="mid" data-i="${i}">${esc(m.name)}</button>
          `).join('')}
        </div>`;
    },

    precise() {
      const b = state.basic;
      const m = state.mid;
      return `
        <h1>¿Y más en concreto?</h1>
        <p class="hint">Te sientes ${esc(m.name.toLowerCase())}, pero ¿cómo exactamente?</p>
        <div class="stack">
          ${m.precise.map((p, i) => `
            <button class="emo lvl3" style="${tone(b.color, 3)}" data-action="precise" data-i="${i}">${esc(p)}</button>
          `).join('')}
          <button class="ghost" style="--c:${b.color}" data-action="keep-mid">Me quedo con ${esc(m.name)}</button>
        </div>`;
    },

    result() {
      const b = state.basic;
      const final = state.precise || state.mid.name;
      return `
        <div class="result" style="--c:${b.color}">
          <p class="path">${esc(routeOf({ basica: b.name, intermedia: state.mid.name, precisa: state.precise }))}</p>
          <p class="name">${esc(final)}</p>
          <label class="field" for="note">¿Qué lo ha provocado?
            <textarea id="note" rows="4" placeholder="Opcional">${esc(state.note)}</textarea>
          </label>
          <div class="actions">
            <button class="btn primary" data-action="save">Guardar</button>
            <button class="btn secondary" data-action="restart">Empezar de nuevo</button>
          </div>
        </div>`;
    },

    history() {
      const entries = loadEntries().sort((a, b) => b.fecha.localeCompare(a.fecha));
      const tools = `
        <div class="tools">
          <button class="btn secondary" data-action="export">Exportar JSON</button>
          <button class="btn secondary" data-action="import">Importar JSON</button>
        </div>
        <input type="file" id="importFile" accept="application/json,.json" hidden>`;

      if (!entries.length) {
        return `<h1>Historial</h1>${tools}<p class="empty">Aún no hay registros.<br>Cuando guardes una emoción aparecerá aquí.</p>`;
      }

      const groups = new Map();
      for (const e of entries) {
        const key = dayKey(new Date(e.fecha));
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(e);
      }

      const timeFmt = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' });
      let html = `<h1>Historial</h1>${tools}`;
      for (const [key, list] of groups) {
        html += `<h2 class="day">${esc(dayLabel(key))}</h2><ul class="entries">`;
        for (const e of list) {
          html += `
            <li class="entry" style="--c:${colorOf(e.basica)}">
              <span class="dot" aria-hidden="true"></span>
              <div class="body">
                <div class="time">${timeFmt.format(new Date(e.fecha))}</div>
                <div class="route">${esc(routeOf(e))}</div>
                ${e.nota ? `<div class="note">${esc(e.nota)}</div>` : ''}
              </div>
              <button class="icon-btn del" data-action="delete" data-id="${esc(e.id)}" aria-label="Borrar registro">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </li>`;
        }
        html += '</ul>';
      }
      return html;
    },
  };

  function dayKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function dayLabel(key) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (key === dayKey(today)) return 'Hoy';
    if (key === dayKey(yesterday)) return 'Ayer';
    const [y, m, d] = key.split('-').map(Number);
    const opts = { weekday: 'long', day: 'numeric', month: 'long' };
    if (y !== today.getFullYear()) opts.year = 'numeric';
    const s = new Intl.DateTimeFormat('es-ES', opts).format(new Date(y, m - 1, d));
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ---------- Navegación ----------
  const parentOf = { mid: 'basic', precise: 'mid', result: 'precise', history: 'basic' };

  function go(screen, dir = 'forward') {
    state.screen = screen;
    view.classList.remove('enter-forward', 'enter-back', 'enter-fade');
    view.innerHTML = screens[screen]();
    void view.offsetWidth; // reinicia la animación
    view.classList.add('enter-' + dir);
    window.scrollTo(0, 0);
    updateTopbar();
  }

  function updateTopbar() {
    const s = state.screen;
    backBtn.hidden = s === 'basic';
    historyBtn.hidden = s !== 'basic';

    let parts = [];
    if (s === 'history') parts = ['Historial'];
    else if (s !== 'basic') {
      parts = [state.basic.name];
      if (s === 'precise' || s === 'result') parts.push(state.mid.name);
      if (s === 'result' && state.precise) parts.push(state.precise);
    }
    crumbsEl.innerHTML = parts
      .map((p, i) => `<span class="${i === parts.length - 1 ? 'cur' : ''}">${esc(p)}</span>`)
      .join('<span class="sep">›</span>');
  }

  function back() {
    if (state.screen === 'result') state.note = (document.getElementById('note') || {}).value || '';
    const parent = parentOf[state.screen];
    if (parent) go(parent, 'back');
  }

  function reset() {
    Object.assign(state, { basic: null, mid: null, precise: null, note: '' });
  }

  // ---------- Exportar / importar ----------
  async function exportJSON() {
    const entries = loadEntries();
    const data = {
      app: 'rueda-emociones',
      version: 1,
      exportado: new Date().toISOString(),
      registros: entries,
    };
    const name = `emociones-${dayKey(new Date())}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

    // En iPhone, la hoja de compartir permite "Guardar en Archivos"
    try {
      const file = new File([blob], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Historial de emociones' });
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function isValidEntry(e) {
    return e && typeof e === 'object'
      && typeof e.id === 'string' && e.id
      && typeof e.fecha === 'string' && !isNaN(Date.parse(e.fecha))
      && typeof e.basica === 'string'
      && typeof e.intermedia === 'string';
  }

  async function importJSON(file) {
    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      toast('El archivo no es un JSON válido');
      return;
    }
    const incoming = Array.isArray(parsed) ? parsed : parsed && parsed.registros;
    if (!Array.isArray(incoming)) {
      toast('No se encontraron registros');
      return;
    }
    const current = loadEntries();
    const ids = new Set(current.map((e) => e.id));
    let added = 0;
    for (const e of incoming) {
      if (!isValidEntry(e) || ids.has(e.id)) continue;
      current.push({
        id: e.id,
        fecha: e.fecha,
        basica: e.basica,
        intermedia: e.intermedia,
        precisa: typeof e.precisa === 'string' && e.precisa ? e.precisa : null,
        nota: typeof e.nota === 'string' ? e.nota : '',
      });
      ids.add(e.id);
      added++;
    }
    saveEntries(current);
    go('history', 'fade');
    toast(added === 1 ? '1 registro importado' : `${added} registros importados`);
  }

  // ---------- Eventos ----------
  view.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-action]');
    if (!btn) return;
    const i = Number(btn.dataset.i);

    switch (btn.dataset.action) {
      case 'basic':
        reset();
        state.basic = EMOTIONS[i];
        go('mid');
        break;
      case 'mid':
        state.mid = state.basic.children[i];
        state.precise = null;
        state.note = '';
        go('precise');
        break;
      case 'precise':
        state.precise = state.mid.precise[i];
        go('result');
        break;
      case 'keep-mid':
        state.precise = null;
        go('result');
        break;
      case 'save': {
        const entries = loadEntries();
        entries.push({
          id: uid(),
          fecha: new Date().toISOString(),
          basica: state.basic.name,
          intermedia: state.mid.name,
          precisa: state.precise,
          nota: document.getElementById('note').value.trim(),
        });
        try {
          saveEntries(entries);
        } catch {
          toast('No se pudo guardar');
          break;
        }
        reset();
        go('basic', 'fade');
        toast('Guardado');
        break;
      }
      case 'restart':
        reset();
        go('basic', 'back');
        break;
      case 'delete': {
        const id = btn.dataset.id;
        const entry = loadEntries().find((e) => e.id === id);
        if (!entry) break;
        if (!confirm(`¿Borrar este registro?\n\n${routeOf(entry)}`)) break;
        saveEntries(loadEntries().filter((e) => e.id !== id));
        go('history', 'fade');
        toast('Registro borrado');
        break;
      }
      case 'export':
        exportJSON();
        break;
      case 'import':
        document.getElementById('importFile').click();
        break;
    }
  });

  view.addEventListener('change', (ev) => {
    if (ev.target.id === 'importFile' && ev.target.files[0]) importJSON(ev.target.files[0]);
  });

  backBtn.addEventListener('click', back);
  historyBtn.addEventListener('click', () => go('history'));

  go('basic', 'fade');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }
})();
