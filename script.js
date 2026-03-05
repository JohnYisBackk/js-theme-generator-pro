// ===============================
// 1. GET ELEMENTS FROM DOM
// ===============================

const primaryColor = document.getElementById("primaryColor");
const bgColor = document.getElementById("bgColor");
const textColor = document.getElementById("textColor");
const cardColor = document.getElementById("cardColor");

const radiusValue = document.getElementById("radiusValue");
const radiusRange = document.getElementById("radiusRange");
const shadowValue = document.getElementById("shadowValue");
const shadowRange = document.getElementById("shadowRange");

const randomBtn = document.getElementById("randomBtn");
const resetBtn = document.getElementById("resetBtn");
const copyCssBtn = document.getElementById("copyCssBtn");
const saveBtn = document.getElementById("saveBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

const themeNameInput = document.getElementById("themeName");
const statusText = document.getElementById("statusText");
const themesList = document.getElementById("themesList");

const year = document.getElementById("year");

// ===============================
// 2. DEFAULT THEME OBJECT
// ===============================

const DEFAULT_THEME = {
  primary: "#7c3aed",
  bg: "#0b1220",
  text: "#ffffff",
  card: "#111827",
  radius: 16,
  shadow: 40,
};

// ===============================
// 3. HELPER FUNCTIONS
// ===============================

function setStatus(message) {
  statusText.textContent = message;

  setTimeout(() => {
    statusText.textContent = "";
  }, 2000);
}

function setCSSVar(name, value) {
  document.documentElement.style.setProperty(name, value);
}

function createShadow(intensity) {
  const blur = 20 + intensity;
  const alpha = Math.min(0.75, 0.25 + intensity / 160);

  return `0 20px ${blur}px rgba(0,0,0,${alpha})`;
}

// ===============================
// 4. APPLY THEME
// ===============================

function applyTheme(theme) {
  setCSSVar("--primary", theme.primary);
  setCSSVar("--bg", theme.bg);
  setCSSVar("--text", theme.text);
  setCSSVar("--card", theme.card);

  setCSSVar("--radius", `${theme.radius}px`);
  setCSSVar("--shadow", createShadow(theme.shadow));

  primaryColor.value = theme.primary;
  bgColor.value = theme.bg;
  textColor.value = theme.text;
  cardColor.value = theme.card;

  radiusRange.value = String(theme.radius);
  radiusValue.textContent = String(theme.radius);

  shadowRange.value = String(theme.shadow);
  shadowValue.textContent = String(theme.shadow);
}

// ===============================
// 5. GET THEME FROM UI
// ===============================

function getThemeFromUI() {
  return {
    primary: primaryColor.value,
    bg: bgColor.value,
    text: textColor.value,
    card: cardColor.value,
    radius: Number(radiusRange.value),
    shadow: Number(shadowRange.value),
  };
}

// ===============================
// 6. RANDOM THEME GENERATOR
// ===============================

function randomHex() {
  const chars = "0123456789abcdef";
  let color = "#";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    color += chars[randomIndex];
  }

  return color;
}

function randomTheme() {
  return {
    primary: randomHex(),
    bg: randomHex(),
    text: randomHex(),
    card: randomHex(),
    radius: Math.floor(6 + Math.random() * 23),
    shadow: Math.floor(Math.random() * 81),
  };
}

// ===============================
// 7. LOCAL STORAGE
// ===============================

const STORAGE_KEY = "theme_generator_pro_themes";

function loadThemes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveThemes(themes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
}

// ===============================
// 8. RENDER SAVED THEMES
// ===============================

function renderThemes() {
  const themes = loadThemes();
  themesList.innerHTML = "";

  if (themes.length === 0) {
    themesList.innerHTML = `
      <li class="theme-item">
        <div class="theme-meta">
          <div class="theme-name">No saved themes</div>
          <div class="theme-vars">Save one to see it here.</div>
        </div>
      </li>
    `;
    return;
  }

  themes.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "theme-item";

    const meta = document.createElement("div");
    meta.className = "theme-meta";

    const name = document.createElement("div");
    name.className = "theme-name";
    name.textContent = item.name;

    const vars = document.createElement("div");
    vars.className = "theme-vars";
    vars.textContent = `primary ${item.theme.primary} | bg ${item.theme.bg} | radius ${item.theme.radius}px`;

    const actions = document.createElement("div");
    actions.className = "theme-actions";

    const applyBtn = document.createElement("button");
    applyBtn.className = "btn btn-secondary";
    applyBtn.dataset.action = "apply";
    applyBtn.dataset.index = String(index);
    applyBtn.textContent = "Apply";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-ghost";
    deleteBtn.dataset.action = "delete";
    deleteBtn.dataset.index = String(index);
    deleteBtn.textContent = "Delete";

    meta.append(name, vars);
    actions.append(applyBtn, deleteBtn);
    li.append(meta, actions);

    themesList.appendChild(li);
  });
}

themesList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const index = Number(btn.dataset.index);

  const themes = loadThemes();
  const item = themes[index];
  if (!item) return;

  if (action === "apply") {
    applyTheme(item.theme);
    setStatus(`Applied: ${item.name}`);
  }

  if (action === "delete") {
    themes.splice(index, 1);
    saveThemes(themes);
    renderThemes();
    setStatus("Theme deleted");
  }
});

// ===============================
// 9. SAVE THEME
// ===============================

function addTheme(name, theme) {
  const themes = loadThemes();

  themes.unshift({
    name,
    theme,
    createdAt: Date.now(),
  });

  saveThemes(themes);
}

saveBtn.addEventListener("click", () => {
  const name = themeNameInput.value.trim();

  if (!name) {
    setStatus("Enter a theme name");
    return;
  }

  addTheme(name, getThemeFromUI());
  themeNameInput.value = "";

  renderThemes();
  setStatus("Theme saved");
});

// ===============================
// 10. COPY CSS VARIABLES
// ===============================

function themeToCSS(theme) {
  return `:root {
  --primary: ${theme.primary};
  --bg: ${theme.bg};
  --text: ${theme.text};
  --card: ${theme.card};
  --radius: ${theme.radius}px;
  --shadow: ${createShadow(theme.shadow)};
}`;
}

function copyCSS() {
  const theme = getThemeFromUI();
  const css = themeToCSS(theme);

  navigator.clipboard
    .writeText(css)
    .then(() => setStatus("CSS copied"))
    .catch(() => setStatus("Copy failed"));
}

copyCssBtn.addEventListener("click", copyCSS);

// ===============================
// 11. RANDOM BUTTON
// ===============================

randomBtn.addEventListener("click", () => {
  const theme = randomTheme();
  applyTheme(theme);
});

// ===============================
// 12. RESET BUTTON
// ===============================

resetBtn.addEventListener("click", () => {
  applyTheme(DEFAULT_THEME);
});

// ===============================
// 13. CLEAR ALL THEMES
// ===============================

clearAllBtn.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderThemes();
  setStatus("All themes cleared");
});

// ===============================
// 14. RANGE SLIDERS
// ===============================

radiusRange.addEventListener("input", () => {
  radiusValue.textContent = radiusRange.value;
  applyTheme(getThemeFromUI());
});

shadowRange.addEventListener("input", () => {
  shadowValue.textContent = shadowRange.value;
  applyTheme(getThemeFromUI());
});

// ===============================
// 15. COLOR PICKERS
// ===============================

primaryColor.addEventListener("input", () => {
  applyTheme(getThemeFromUI());
});

bgColor.addEventListener("input", () => {
  applyTheme(getThemeFromUI());
});

textColor.addEventListener("input", () => {
  applyTheme(getThemeFromUI());
});

cardColor.addEventListener("input", () => {
  applyTheme(getThemeFromUI());
});

// ===============================
// 16. YEAR IN FOOTER
// ===============================

year.textContent = new Date().getFullYear();

// ===============================
// 17. INIT
// ===============================

applyTheme(DEFAULT_THEME);
renderThemes();

