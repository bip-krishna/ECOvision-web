/* ========================================
   EcoVision Web — Application Logic
   SPA Router + All Business Logic
   ======================================== */
"use strict";

// ==========================================
// DATA / CONSTANTS
// ==========================================

const STORAGE_KEYS = {
  ASSESSMENT: 'ecovision_assessment',
  SCAN_HISTORY: 'ecovision_scan_history',
  ACHIEVEMENTS: 'ecovision_achievements',
  CHALLENGES: 'ecovision_challenges',
  USERNAME: 'ecovision_username',
};

const transportFactors = { bike: 0, public: 1.5, car: 4.2, plane: 6.8 };
const foodFactors = { vegan: 1.5, vegetarian: 2.0, mixed: 3.5, meatHeavy: 5.5 };
const energyFactor = 0.5;
const shoppingFactors = { minimal: 0.5, low: 1.5, medium: 3.0, high: 5.0 };

const categoryColors = {
  'Plastic Waste': '#FF6B6B', 'Paper Waste': '#4ECDC4', 'Glass Waste': '#45B7D1', 'Metal Waste': '#96CEB4',
  'Organic Waste': '#8BC34A', 'Electronic Waste': '#FF9800', 'Textile Waste': '#9C27B0',
  'Hazardous Waste': '#F44336', 'Mixed Waste': '#78909C',
};

const impactColors = {
  critical: '#EF5350', high: '#FF9800', medium: '#FFEB3B', low: '#4CAF50',
};

const defaultChallenges = [
  { id: 'cycle-commuter', title: 'Cycle Commuter', description: 'Cycle to work 3 times this week', points: 50, icon: '🚲', progress: 0 },
  { id: 'plastic-detox', title: 'Plastic Detox', description: 'Avoid single-use plastic for a day', points: 30, icon: '🧴', progress: 0 },
  { id: 'energy-saver', title: 'Energy Saver', description: 'Reduce electricity by 10%', points: 40, icon: '💡', progress: 0 },
  { id: 'green-eater', title: 'Green Eater', description: 'Go meat-free for a week', points: 60, icon: '🥗', progress: 0 },
  { id: 'waste-warrior', title: 'Waste Warrior', description: 'Properly sort all waste for a week', points: 45, icon: '♻️', progress: 0 },
  { id: 'water-guardian', title: 'Water Guardian', description: 'Reduce water usage by 15%', points: 35, icon: '💧', progress: 0 },
  { id: 'tree-hugger', title: 'Tree Hugger', description: 'Plant a tree', points: 100, icon: '🌳', progress: 0 },
];

const mockScanItems = [
  { object: 'bottle', category: 'Plastic Waste', impact: 'Medium', suggestion: 'Recycle in plastic bin', co2Saved: 0.5 },
  { object: 'cardboard box', category: 'Paper Waste', impact: 'Low', suggestion: 'Flatten and recycle', co2Saved: 0.3 },
  { object: 'glass jar', category: 'Glass Waste', impact: 'Low', suggestion: 'Rinse and recycle', co2Saved: 0.4 },
  { object: 'aluminum can', category: 'Metal Waste', impact: 'Medium', suggestion: 'Crush and recycle', co2Saved: 0.6 },
  { object: 'banana peel', category: 'Organic Waste', impact: 'Low', suggestion: 'Compost in green bin', co2Saved: 0.1 },
  { object: 'old phone', category: 'Electronic Waste', impact: 'High', suggestion: 'Take to e-waste center', co2Saved: 1.2 },
  { object: 'paper cup', category: 'Paper Waste', impact: 'Medium', suggestion: 'Use reusable cups instead', co2Saved: 0.2 },
  { object: 'food scraps', category: 'Organic Waste', impact: 'Low', suggestion: 'Start composting at home', co2Saved: 0.15 },
];

const allSuggestions = [
  'Switch to LED bulbs to reduce energy consumption',
  'Start composting kitchen waste',
  'Use reusable shopping bags',
  'Take shorter showers to conserve water',
  'Walk or bike for short trips',
  'Buy local produce to reduce food miles',
  'Use a refillable water bottle instead of buying bottled water',
  'Choose products with minimal packaging',
];

const allTips = [
  'Unplug electronics when not in use',
  'Use a programmable thermostat',
  'Repair instead of replace items',
  'Air-dry clothes instead of using a dryer',
  'Use cold water for washing clothes',
];

const transportOptions = [
  { key: 'bike', label: 'Bike', emoji: '🚲' },
  { key: 'public', label: 'Public Transport', emoji: '🚌' },
  { key: 'car', label: 'Car', emoji: '🚗' },
  { key: 'plane', label: 'Frequent Flyer', emoji: '✈️' },
];

const dietOptions = [
  { key: 'vegan', label: 'Vegan', emoji: '🌱' },
  { key: 'vegetarian', label: 'Vegetarian', emoji: '🥦' },
  { key: 'mixed', label: 'Mixed', emoji: '🍽️' },
  { key: 'meatHeavy', label: 'Meat-heavy', emoji: '🥩' },
];

const shoppingOptions = [
  { key: 'minimal', label: 'Minimal', emoji: '✨' },
  { key: 'low', label: 'Low', emoji: '🛍️' },
  { key: 'medium', label: 'Medium', emoji: '🛒' },
  { key: 'high', label: 'High', emoji: '🛑' },
];

const simOptions = [
  { key: 'bike', label: 'Switch to bike', emoji: '🚲', saving: 6.5 },
  { key: 'vegetarian', label: 'Go vegetarian', emoji: '🥗', saving: 8.0 },
  { key: 'energy', label: 'Reduce energy by 50%', emoji: '💡', saving: 3.5 },
  { key: 'minimal', label: 'Shop minimal', emoji: '✨', saving: 5.0 },
];

// ==========================================
// SECURITY & STORAGE HELPERS
// ==========================================

/**
 * Escapes HTML characters in a string to prevent XSS vulnerabilities.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/**
 * Retrieves and parses JSON data from localStorage.
 * @param {string} key - The localStorage key.
 * @returns {any} The parsed data or null.
 */
function storageGet(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { console.error('Storage error:', e); }
}

// ==========================================
// BUSINESS LOGIC
// ==========================================

/**
 * Calculates the monthly carbon footprint based on user inputs.
 * @param {string} transport - Transport mode.
 * @param {string} food - Diet type.
 * @param {number} energy - Daily energy usage in kWh.
 * @param {string} shopping - Shopping habits.
 * @returns {Object} The calculated score and footprint breakdown.
 */
function calculateFootprint(transport, food, energy, shopping) {
  const transportVal = (transportFactors[transport] || 0) * 2.5;
  const foodVal = (foodFactors[food] || 3.5) * 7;
  const energyVal = energy * energyFactor * 30;
  const shoppingVal = (shoppingFactors[shopping] || 3.0) * 4;

  const breakdown = {
    transport: Math.round(transportVal * 10) / 10,
    food: Math.round(foodVal * 10) / 10,
    energy: Math.round(energyVal * 10) / 10,
    shopping: Math.round(shoppingVal * 10) / 10,
  };

  const footprint = transportVal + foodVal + energyVal + shoppingVal;
  const score = Math.max(0, Math.min(100, Math.round(100 - (footprint / 50) * 100)));

  return { score, footprint: Math.round(footprint * 10) / 10, breakdown };
}

function getLastAssessment() {
  return storageGet(STORAGE_KEYS.ASSESSMENT);
}

function saveAssessment(result) {
  storageSet(STORAGE_KEYS.ASSESSMENT, result);
}

function getScanHistory() {
  return storageGet(STORAGE_KEYS.SCAN_HISTORY) || [];
}

function saveScanResult(result) {
  const history = getScanHistory();
  history.unshift(result);
  storageSet(STORAGE_KEYS.SCAN_HISTORY, history.slice(0, 50));
}

function getChallenges() {
  const saved = storageGet(STORAGE_KEYS.CHALLENGES);
  if (saved) return saved;
  storageSet(STORAGE_KEYS.CHALLENGES, defaultChallenges);
  return [...defaultChallenges];
}

function saveChallenges(challenges) {
  storageSet(STORAGE_KEYS.CHALLENGES, challenges);
}

function getAchievements() {
  return storageGet(STORAGE_KEYS.ACHIEVEMENTS) || [];
}

function saveAchievement(achievement) {
  const current = getAchievements();
  current.unshift(achievement);
  storageSet(STORAGE_KEYS.ACHIEVEMENTS, current.slice(0, 100));
}

function completeChallenge(challengeId) {
  const challenges = getChallenges();
  const challenge = challenges.find(c => c.id === challengeId);
  if (challenge && challenge.progress < 100) {
    const achievement = {
      id: `ach_${challengeId}_${Date.now()}`,
      title: challenge.title,
      description: `Completed: ${challenge.description}`,
      icon: challenge.icon,
      unlocked: true,
      date: new Date().toISOString(),
    };
    saveAchievement(achievement);
  }
  const updated = challenges.map(c =>
    c.id === challengeId ? { ...c, progress: 100 } : c
  );
  saveChallenges(updated);
  return updated;
}

function getTotalPoints() {
  const achievements = getAchievements();
  return achievements.reduce((sum, a) => {
    const challenge = defaultChallenges.find(c => c.title === a.title);
    return sum + (challenge ? challenge.points : 10);
  }, 0);
}

function getUsername() {
  return localStorage.getItem(STORAGE_KEYS.USERNAME) || 'Eco Warrior';
}

function setUsername(name) {
  localStorage.setItem(STORAGE_KEYS.USERNAME, name);
}

function getScoreColor(score) {
  if (score >= 70) return '#4CAF50';
  if (score >= 40) return '#FFEB3B';
  return '#EF5350';
}

function getScoreMessage(score) {
  if (score >= 70) return 'Excellent! You\'re a sustainability champion! 🌟';
  if (score >= 40) return 'Good start! There\'s room to improve. 🌿';
  return 'Time to make some changes! 🌍';
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}

// ==========================================
// ECO SCORE SVG COMPONENT
// ==========================================

function renderEcoScoreRing(score, size = 'large') {
  const diameter = size === 'large' ? 140 : 70;
  const strokeWidth = size === 'large' ? 10 : 6;
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const offset = circumference - (progress / 100) * circumference;
  const color = getScoreColor(progress);

  return `
    <div class="eco-score-ring ${size}">
      <svg width="${diameter}" height="${diameter}" viewBox="0 0 ${diameter} ${diameter}">
        <circle class="score-bg" cx="${diameter/2}" cy="${diameter/2}" r="${radius}"
          stroke-width="${strokeWidth}" fill="none"/>
        <circle class="score-progress" cx="${diameter/2}" cy="${diameter/2}" r="${radius}"
          stroke="${color}" stroke-width="${strokeWidth}" fill="none"
          stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
          stroke-linecap="round"
          transform="rotate(-90, ${diameter/2}, ${diameter/2})"/>
      </svg>
      <span class="score-value" style="color: ${color}">${progress}</span>
    </div>
  `;
}

// ==========================================
// BAR CHART COMPONENT
// ==========================================

function renderBarChart(data, title, color = '#4CAF50') {
  if (!data || data.length === 0) {
    return `<div class="glass-card"><div class="bar-chart-title">${title}</div><p style="color: var(--text-dim); text-align:center; padding: 20px 0;">No data available</p></div>`;
  }
  const maxVal = Math.max(...data.map(d => d.value), 1);

  const bars = data.map(d => {
    const heightPct = Math.max(2, (d.value / maxVal) * 100);
    return `
      <div class="bar-chart-item">
        <div class="bar-chart-bar" style="height: ${heightPct}%; background: linear-gradient(180deg, ${color}, ${color}88);"
          data-value="${d.value}"></div>
        <span class="bar-chart-label">${d.label}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="glass-card">
      <div class="bar-chart-title">${title}</div>
      <div class="bar-chart">${bars}</div>
    </div>
  `;
}

// ==========================================
// SPA ROUTER
// ==========================================

const pages = ['home', 'assessment', 'scan', 'coach', 'simulator', 'profile'];
let currentPage = 'home';

/**
 * Navigates to a specific page by updating the URL hash and DOM classes.
 * @param {string} page - The name of the page to navigate to.
 */
function navigateTo(page) {
  if (!pages.includes(page)) page = 'home';
  currentPage = page;
  window.location.hash = page;

  // Update nav active states
  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  // Show/hide pages
  document.querySelectorAll('.page').forEach(el => {
    el.classList.toggle('active', el.id === `page-${page}`);
  });

  // Render page content
  renderPage(page);
}

function renderPage(page) {
  switch (page) {
    case 'home': renderHome(); break;
    case 'assessment': renderAssessment(); break;
    case 'scan': renderScanner(); break;
    case 'coach': renderCoach(); break;
    case 'simulator': renderSimulator(); break;
    case 'profile': renderProfile(); break;
  }
}

// ==========================================
// PAGE: HOME
// ==========================================

function renderHome() {
  const container = document.getElementById('page-home');
  const assessment = getLastAssessment();

  if (!assessment) {
    container.innerHTML = `
      <div class="glass-card welcome-card">
        <span class="welcome-emoji">🌍</span>
        <h2>Welcome to EcoVision</h2>
        <p>Track your carbon footprint, scan waste, and get AI-powered tips to live more sustainably.</p>
        <div class="btn-row" style="justify-content: center; max-width: 400px; margin: 0 auto;">
          <button class="btn btn-primary" onclick="navigateTo('assessment')">
            <span class="btn-icon">📋</span> Start Assessment
          </button>
          <button class="btn btn-secondary" onclick="navigateTo('scan')">
            <span class="btn-icon">📸</span> Scan Waste
          </button>
        </div>
      </div>
    `;
    return;
  }

  const challenges = getChallenges();
  const achievements = getAchievements();
  const activeChallenge = challenges.find(c => c.progress < 100) || null;
  const latestAchievement = achievements.length > 0 ? achievements[0] : null;

  let challengeHtml = '';
  if (activeChallenge) {
    challengeHtml = `
      <div class="mt-24">
        <div class="section-title">🎯 Active Challenge</div>
        ${renderChallengeCard(activeChallenge)}
      </div>
    `;
  }

  let achievementHtml = '';
  if (latestAchievement) {
    achievementHtml = `
      <div class="mt-24">
        <div class="section-title">🏆 Latest Achievement</div>
        ${renderAchievementCard(latestAchievement)}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="page-header">
      <h1>Your Dashboard</h1>
      <p>Welcome back! Here's your sustainability snapshot</p>
    </div>

    <div class="eco-score-container mb-20">
      ${renderEcoScoreRing(assessment.score, 'large')}
      <span class="eco-score-label">
        ${assessment.score >= 70 ? 'Great job! 🌱' : assessment.score >= 40 ? 'Room for improvement 🌿' : "Let's get started! 🌍"}
      </span>
    </div>

    <div class="glass-card carbon-card mb-20">
      <div class="carbon-title">Carbon Footprint</div>
      <div>
        <span class="carbon-value" style="color: var(--green-vivid)">${assessment.footprint}</span>
        <span class="carbon-unit" style="color: var(--green-vivid)">kg CO₂/month</span>
      </div>
    </div>

    <div class="btn-row mb-20">
      <button class="btn btn-primary" onclick="navigateTo('assessment')">
        <span class="btn-icon">📋</span> Assess Again
      </button>
      <button class="btn btn-secondary" onclick="navigateTo('scan')">
        <span class="btn-icon">📸</span> Scan Waste
      </button>
    </div>

    ${challengeHtml}
    ${achievementHtml}
  `;
}

// ==========================================
// PAGE: ASSESSMENT
// ==========================================

let assessmentState = {
  step: 1,
  transport: 'bike',
  diet: 'mixed',
  energy: 10,
  shopping: 'medium',
  result: null,
  calculating: false,
};

function resetAssessment() {
  assessmentState = {
    step: 1, transport: 'bike', diet: 'mixed',
    energy: 10, shopping: 'medium', result: null, calculating: false,
  };
}

function renderAssessment() {
  const container = document.getElementById('page-assessment');
  const s = assessmentState;

  if (s.result) {
    renderAssessmentResult(container);
    return;
  }

  const TOTAL_STEPS = 4;

  // Step indicator
  let stepsHtml = '';
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const cls = i === s.step ? 'active' : (i < s.step ? 'completed' : '');
    stepsHtml += `<div class="step-dot ${cls}">${i}</div>`;
    if (i < TOTAL_STEPS) {
      stepsHtml += `<div class="step-line ${i < s.step ? 'active' : ''}"></div>`;
    }
  }

  let stepContent = '';

  if (s.step === 1) {
    stepContent = `
      <div class="question-text">How do you usually travel?</div>
      <div class="option-grid">
        ${transportOptions.map(o => `
          <div class="option-card ${s.transport === o.key ? 'selected' : ''}" onclick="assessmentSelect('transport', '${o.key}')">
            <span class="option-emoji">${o.emoji}</span>
            <span class="option-label">${o.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (s.step === 2) {
    stepContent = `
      <div class="question-text">What's your diet like?</div>
      <div class="option-grid">
        ${dietOptions.map(o => `
          <div class="option-card ${s.diet === o.key ? 'selected' : ''}" onclick="assessmentSelect('diet', '${o.key}')">
            <span class="option-emoji">${o.emoji}</span>
            <span class="option-label">${o.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else if (s.step === 3) {
    stepContent = `
      <div class="question-text">Daily energy usage (kWh)</div>
      <div class="energy-display">${s.energy} kWh/day</div>
      <div class="energy-controls">
        <button class="energy-btn" onclick="adjustEnergy(-1)">−</button>
        <div class="energy-bar-container">
          <div class="energy-bar-fill" style="width: ${(s.energy / 20) * 100}%"></div>
        </div>
        <button class="energy-btn" onclick="adjustEnergy(1)">+</button>
      </div>
      <div class="energy-labels">
        <span>Low (1 kWh)</span>
        <span>High (20 kWh)</span>
      </div>
      <div class="energy-presets">
        ${[3, 6, 10, 15].map(v => `
          <button class="preset-chip ${s.energy === v ? 'active' : ''}" onclick="setEnergy(${v})">${v}</button>
        `).join('')}
      </div>
    `;
  } else if (s.step === 4) {
    stepContent = `
      <div class="question-text">How much do you shop?</div>
      <div class="option-grid">
        ${shoppingOptions.map(o => `
          <div class="option-card ${s.shopping === o.key ? 'selected' : ''}" onclick="assessmentSelect('shopping', '${o.key}')">
            <span class="option-emoji">${o.emoji}</span>
            <span class="option-label">${o.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  let navButtons = '';
  if (s.step > 1) {
    navButtons += `<button class="btn btn-secondary" onclick="assessmentBack()">Back</button>`;
  }
  if (s.step < TOTAL_STEPS) {
    navButtons += `<button class="btn btn-primary" onclick="assessmentNext()">Next</button>`;
  } else {
    navButtons += `<button class="btn btn-primary" onclick="assessmentCalculate()" ${s.calculating ? 'disabled' : ''}>
      ${s.calculating ? '<span class="spinner"></span>' : 'Calculate'}
    </button>`;
  }

  container.innerHTML = `
    <div class="page-header">
      <h1>Carbon Assessment</h1>
      <p>Answer 4 questions to calculate your footprint</p>
    </div>
    <div class="step-indicator">${stepsHtml}</div>
    <div class="step-label">Step ${s.step}/${TOTAL_STEPS}</div>
    <div class="glass-card mb-20">${stepContent}</div>
    <div class="btn-row">${navButtons}</div>
  `;
}

function renderAssessmentResult(container) {
  const r = assessmentState.result;
  const chartData = [
    { label: 'Transport', value: r.breakdown.transport },
    { label: 'Food', value: r.breakdown.food },
    { label: 'Energy', value: r.breakdown.energy },
    { label: 'Shopping', value: r.breakdown.shopping },
  ];

  let suggestionsHtml = '';
  if (r.suggestions && r.suggestions.length > 0) {
    suggestionsHtml = `
      <div class="glass-card suggestions-card mt-20">
        <h3>💡 Tips to Improve</h3>
        ${r.suggestions.map(s => `
          <div class="suggestion-item">
            <span class="suggestion-icon">•</span>
            <span class="suggestion-text">${s}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="glass-card result-card">
      <h2>Your Results</h2>
      ${renderEcoScoreRing(r.score, 'large')}
      <div class="result-message">${getScoreMessage(r.score)}</div>
      <div class="result-footprint">${r.footprint} kg CO₂ / month</div>
    </div>

    ${renderBarChart(chartData, 'Footprint Breakdown (kg CO₂)')}

    ${suggestionsHtml}

    <div class="mt-20">
      <button class="btn btn-primary btn-full" onclick="assessmentSaveAndHome()">
        Save & Go Home
      </button>
    </div>
    <div class="mt-16">
      <button class="btn btn-secondary btn-full" onclick="assessmentRetake()">
        Retake Assessment
      </button>
    </div>
  `;
}

function assessmentSelect(field, value) {
  assessmentState[field] = value;
  renderAssessment();
}

function assessmentNext() {
  if (assessmentState.step < 4) {
    assessmentState.step++;
    renderAssessment();
  }
}

function assessmentBack() {
  if (assessmentState.step > 1) {
    assessmentState.step--;
    renderAssessment();
  }
}

function adjustEnergy(delta) {
  assessmentState.energy = Math.max(1, Math.min(20, assessmentState.energy + delta));
  renderAssessment();
}

function setEnergy(val) {
  assessmentState.energy = val;
  renderAssessment();
}

async function assessmentCalculate() {
  const s = assessmentState;
  s.calculating = true;
  renderAssessment();

  await delay(800);

  const result = calculateFootprint(s.transport, s.diet, s.energy, s.shopping);
  s.result = {
    ...result,
    date: new Date().toISOString(),
    suggestions: [
      'Consider using public transport more often',
      'Reduce meat consumption to lower your food footprint',
      'Switch to energy-efficient appliances',
      'Buy second-hand items to reduce shopping impact',
    ],
  };
  s.calculating = false;
  renderAssessment();
}

function assessmentSaveAndHome() {
  if (assessmentState.result) {
    saveAssessment(assessmentState.result);
    showToast('Assessment saved! 🌱');
  }
  resetAssessment();
  navigateTo('home');
}

function assessmentRetake() {
  resetAssessment();
  renderAssessment();
}

// ==========================================
// PAGE: SCANNER
// ==========================================

let scannerState = {
  imageDataUrl: null,
  scanning: false,
  result: null,
};

function renderScanner() {
  const container = document.getElementById('page-scan');
  const s = scannerState;
  const history = getScanHistory();

  let previewHtml = '';
  if (s.imageDataUrl) {
    previewHtml = `
      <img src="${s.imageDataUrl}" alt="Uploaded image preview" class="preview-image"/>
      <button class="btn btn-primary btn-full" onclick="handleScan()" ${s.scanning ? 'disabled' : ''}>
        ${s.scanning ? '<span class="spinner"></span> Analyzing...' : '🔬 Analyze Waste'}
      </button>
    `;
  }

  let resultHtml = '';
  if (s.result) {
    const catColor = categoryColors[s.result.category] || '#78909C';
    const impColor = impactColors[s.result.impact.toLowerCase()] || '#999';

    resultHtml = `
      <div class="glass-card mt-20">
        <div class="section-title">Scan Result</div>
        <div class="scan-result-grid">
          <div class="scan-result-row">
            <span class="scan-label">Object:</span>
            <span class="scan-value">${escapeHTML(s.result.object)}</span>
          </div>
          <div class="scan-result-row">
            <span class="scan-label">Category:</span>
            <span class="category-badge" style="background: ${catColor}20; color: ${catColor}">
              <span class="category-dot" style="background: ${catColor}"></span>
              ${escapeHTML(s.result.category)}
            </span>
          </div>
          <div class="scan-result-row">
            <span class="scan-label">Impact:</span>
            <span class="impact-badge" style="color: ${impColor}">${s.result.impact}</span>
          </div>
          <div class="scan-result-row">
            <span class="scan-label">CO₂ Saved:</span>
            <span class="scan-value" style="color: var(--green-vivid); font-weight: 800">${s.result.co2Saved} kg</span>
          </div>
        </div>
        <div class="scan-suggestion-box">
          <span class="suggestion-icon">💡</span>
          <span class="suggestion-text">${escapeHTML(s.result.suggestion)}</span>
        </div>
      </div>
    `;
  }

  let historyHtml = '';
  if (history.length > 0) {
    historyHtml = `
      <div class="mt-24">
        <div class="section-title">📋 Scan History</div>
        <div class="history-list">
          ${history.map(item => {
            const dotColor = categoryColors[item.category] || '#78909C';
            return `
              <div class="history-item">
                <span class="history-dot" style="background: ${dotColor}"></span>
                <div class="history-content">
                  <div class="history-object">${escapeHTML(item.object)}</div>
                  <div class="history-date">${formatDateShort(item.date)}</div>
                </div>
                <span class="history-co2">${item.co2Saved} kg</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="page-header">
      <h1>Waste Scanner</h1>
      <p>Upload an image to classify waste and learn how to recycle</p>
    </div>

    <div class="upload-zone" id="upload-zone" role="button" tabindex="0" aria-label="Upload Waste Image" onclick="document.getElementById('file-input').click()" onkeydown="if(event.key==='Enter'||event.key===' ') { event.preventDefault(); document.getElementById('file-input').click(); }">
      <span class="upload-icon" aria-hidden="true">📸</span>
      <div class="upload-text">Click to upload or drag & drop</div>
      <div class="upload-hint">Supports JPG, PNG, WEBP</div>
    </div>
    <input type="file" id="file-input" accept="image/*" style="display: none" onchange="handleFileSelect(event)"/>

    ${previewHtml}
    ${resultHtml}
    ${historyHtml}
  `;

  // Setup drag and drop
  setTimeout(() => {
    const zone = document.getElementById('upload-zone');
    if (zone) {
      zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', () => { zone.classList.remove('dragover'); });
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
          processFile(e.dataTransfer.files[0]);
        }
      });
    }
  }, 0);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    scannerState.imageDataUrl = e.target.result;
    scannerState.result = null;
    renderScanner();
  };
  reader.readAsDataURL(file);
}

async function handleScan() {
  if (!scannerState.imageDataUrl) return;
  scannerState.scanning = true;
  renderScanner();

  await delay(1200);

  const mockResult = mockScanItems[Math.floor(Math.random() * mockScanItems.length)];
  const result = {
    id: Date.now().toString(),
    ...mockResult,
    date: new Date().toISOString(),
  };

  saveScanResult(result);
  scannerState.result = result;
  scannerState.scanning = false;
  renderScanner();
  showToast('Waste classified! ♻️');
}

// ==========================================
// PAGE: COACH
// ==========================================

let coachState = {
  suggestions: [],
  tips: [],
  adviceLoaded: false,
  loading: false,
};

function renderCoach() {
  const container = document.getElementById('page-coach');
  const assessment = getLastAssessment();
  const score = assessment ? assessment.score : 50;
  const challenges = getChallenges();
  const achievements = getAchievements();

  let adviceSection = '';
  if (!coachState.adviceLoaded) {
    adviceSection = `
      <button class="btn btn-primary btn-full mb-20" onclick="getCoachAdvice()" ${coachState.loading ? 'disabled' : ''}>
        ${coachState.loading ? '<span class="spinner"></span>' : '<span class="btn-icon">🧠</span> Get AI Advice'}
      </button>
    `;
  } else {
    adviceSection = `
      <button class="btn btn-secondary btn-full mb-20" onclick="getCoachAdvice()" ${coachState.loading ? 'disabled' : ''}>
        ${coachState.loading ? 'Loading...' : '🔄 Refresh Advice'}
      </button>
    `;
  }

  let suggestionsHtml = '';
  if (coachState.suggestions.length > 0) {
    suggestionsHtml = `
      <div class="mb-20">
        <div class="section-title">💡 Suggestions</div>
        ${coachState.suggestions.map(s => `
          <div class="glass-card-sm suggestion-item" style="margin-bottom: 8px;">
            <span class="suggestion-icon">💡</span>
            <span class="suggestion-text">${s}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  let tipsHtml = '';
  if (coachState.tips.length > 0) {
    tipsHtml = `
      <div class="mb-20">
        <div class="section-title">📝 Quick Tips</div>
        ${coachState.tips.map(t => `
          <div class="suggestion-item" style="margin-bottom: 6px; padding: 8px 12px;">
            <span class="suggestion-icon" style="color: var(--green-vivid)">•</span>
            <span class="suggestion-text">${t}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  let challengesHtml = '';
  if (challenges.length > 0) {
    challengesHtml = `
      <div class="mb-20">
        <div class="section-title">🎯 Eco Challenges</div>
        ${challenges.map(c => renderChallengeCard(c, true)).join('')}
      </div>
    `;
  }

  let achievementsHtml = '';
  if (achievements.length > 0) {
    achievementsHtml = `
      <div class="mb-20">
        <div class="section-title">🏆 Achievements</div>
        ${achievements.map(a => renderAchievementCard(a)).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="page-header">
      <h1>AI Eco Coach</h1>
      <p>Your personal sustainability guide</p>
    </div>

    <div class="eco-score-container mb-20">
      ${renderEcoScoreRing(score, 'large')}
      <span class="eco-score-label">Current Eco Score</span>
    </div>

    ${adviceSection}
    ${suggestionsHtml}
    ${tipsHtml}
    ${challengesHtml}
    ${achievementsHtml}
  `;
}

async function getCoachAdvice() {
  coachState.loading = true;
  renderCoach();

  await delay(800);

  coachState.suggestions = shuffleArray(allSuggestions).slice(0, 4);
  coachState.tips = shuffleArray(allTips).slice(0, 3);
  coachState.adviceLoaded = true;
  coachState.loading = false;
  renderCoach();
  showToast('AI advice generated! 🧠');
}

function handleCompleteChallenge(challengeId) {
  completeChallenge(challengeId);
  renderCoach();
  showToast('Challenge completed! 🎉');
}

// ==========================================
// PAGE: SIMULATOR
// ==========================================

let simToggles = { bike: false, vegetarian: false, energy: false, minimal: false };

function renderSimulator() {
  const container = document.getElementById('page-simulator');
  const assessment = getLastAssessment();
  const currentFootprint = assessment ? assessment.footprint : 30;
  const currentScore = assessment ? assessment.score : 50;

  const totalSavings = simOptions
    .filter(o => simToggles[o.key])
    .reduce((sum, o) => sum + o.saving, 0);

  const projectedFootprint = Math.max(0, currentFootprint - totalSavings);
  const projectedScore = Math.min(100, Math.round(currentScore + (totalSavings / Math.max(1, currentFootprint)) * 100 * 0.8));

  const beforeAfter = [
    { label: 'Current', value: currentFootprint },
    { label: 'Projected', value: projectedFootprint },
  ];

  const footprintColor = projectedFootprint < currentFootprint ? 'var(--green-vivid)' : 'var(--text-muted)';

  container.innerHTML = `
    <div class="page-header">
      <h1>🌱 Carbon Simulator</h1>
      <p>See how green choices reduce your footprint</p>
    </div>

    <div class="glass-card carbon-card mb-20">
      <div class="carbon-title">Current Footprint</div>
      <div>
        <span class="carbon-value" style="color: var(--accent-orange)">${currentFootprint}</span>
        <span class="carbon-unit" style="color: var(--accent-orange)">kg CO₂/month</span>
      </div>
    </div>

    <div class="section-title">Toggle Improvements</div>
    <div class="sim-options">
      ${simOptions.map(o => `
        <div class="sim-option">
          <span class="sim-emoji">${o.emoji}</span>
          <div class="sim-info">
            <div class="sim-label">${o.label}</div>
            <div class="sim-saving">Saves ${o.saving} kg</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${simToggles[o.key] ? 'checked' : ''} onchange="toggleSim('${o.key}')"/>
            <span class="toggle-slider"></span>
          </label>
        </div>
      `).join('')}
    </div>

    <div class="glass-card carbon-card mt-20 mb-20">
      <div class="carbon-title">Projected Footprint</div>
      <div>
        <span class="carbon-value" style="color: ${footprintColor}">${projectedFootprint}</span>
        <span class="carbon-unit" style="color: ${footprintColor}">kg CO₂/month</span>
      </div>
    </div>

    ${renderBarChart(beforeAfter, 'Before vs After (kg CO₂)', '#4CAF50')}

    <div class="eco-score-container mt-24">
      <div class="section-title" style="justify-content: center;">Projected Eco Score</div>
      ${renderEcoScoreRing(projectedScore, 'large')}
      <div class="score-change ${projectedScore > currentScore ? 'positive' : ''}">
        ${projectedScore > currentScore
          ? `+${projectedScore - currentScore} point improvement! 🎉`
          : 'Toggle options above to see improvement'}
      </div>
    </div>
  `;
}

function toggleSim(key) {
  simToggles[key] = !simToggles[key];
  renderSimulator();
}

// ==========================================
// PAGE: PROFILE
// ==========================================

let profileEditMode = false;

function renderProfile() {
  const container = document.getElementById('page-profile');
  const username = getUsername();
  const firstLetter = username.charAt(0).toUpperCase();
  const totalPoints = getTotalPoints();
  const scanCount = getScanHistory().length;
  const assessment = getLastAssessment();
  const score = assessment ? assessment.score : 0;
  const assessmentCount = assessment ? 1 : 0;
  const achievements = getAchievements();

  let usernameHtml = '';
  if (profileEditMode) {
    usernameHtml = `
      <div class="username-edit-row">
        <input type="text" class="username-input" id="username-input" value="${escapeHTML(username)}" placeholder="Enter username" aria-label="Username"/>
        <button class="username-save-btn" onclick="saveProfileUsername()">Save</button>
      </div>
    `;
  } else {
    usernameHtml = `<div class="username-display" role="button" tabindex="0" onclick="startEditUsername()" onkeydown="if(event.key==='Enter'||event.key===' ')startEditUsername()">${escapeHTML(username)} ✏️</div>`;
  }

  let achievementsHtml = '';
  if (achievements.length > 0) {
    achievementsHtml = `
      <div class="mt-24">
        <div class="section-title">🏅 Badges & Achievements</div>
        ${achievements.map(a => renderAchievementCard(a)).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="profile-header">
      <div class="avatar">
        <span class="avatar-text">${firstLetter}</span>
      </div>
      ${usernameHtml}
    </div>

    <div class="stats-grid">
      <div class="glass-card-sm stat-card">
        <span class="stat-emoji">🏆</span>
        <div class="stat-value">${totalPoints}</div>
        <div class="stat-label">Eco Points</div>
      </div>
      <div class="glass-card-sm stat-card">
        <span class="stat-emoji">📸</span>
        <div class="stat-value">${scanCount}</div>
        <div class="stat-label">Scans</div>
      </div>
      <div class="glass-card-sm stat-card">
        <span class="stat-emoji">📋</span>
        <div class="stat-value">${assessmentCount}</div>
        <div class="stat-label">Assessments</div>
      </div>
      <div class="glass-card-sm stat-card">
        <span class="stat-emoji">🎯</span>
        <div class="stat-value">${achievements.length}</div>
        <div class="stat-label">Badges</div>
      </div>
    </div>

    <div class="eco-score-container mt-24 mb-20">
      <div class="section-title" style="justify-content: center;">Your Eco Score</div>
      ${renderEcoScoreRing(score, 'large')}
    </div>

    ${achievementsHtml}

    <div class="mt-24">
      <button class="btn btn-danger btn-full" onclick="showClearDataModal()">
        Clear All Data
      </button>
    </div>
  `;

  if (profileEditMode) {
    setTimeout(() => {
      const input = document.getElementById('username-input');
      if (input) input.focus();
    }, 0);
  }
}

function startEditUsername() {
  profileEditMode = true;
  renderProfile();
}

function saveProfileUsername() {
  const input = document.getElementById('username-input');
  const name = input ? input.value.trim() : '';
  setUsername(name || 'Eco Warrior');
  profileEditMode = false;
  renderProfile();
  showToast('Username updated! 👤');
}

let lastFocusedElement = null;

/**
 * Shows the clear data confirmation modal and traps focus.
 */
function showClearDataModal() {
  lastFocusedElement = document.activeElement;
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  
  // Focus the first button in the modal
  const firstBtn = overlay.querySelector('.btn-secondary');
  if (firstBtn) firstBtn.focus();
}

/**
 * Hides the clear data confirmation modal and restores focus.
 */
function hideClearDataModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  
  // Restore focus
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

/**
 * Confirms and clears all user data from localStorage.
 */
function confirmClearData() {
  localStorage.removeItem(STORAGE_KEYS.ASSESSMENT);
  localStorage.removeItem(STORAGE_KEYS.SCAN_HISTORY);
  localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
  localStorage.removeItem(STORAGE_KEYS.CHALLENGES);
  hideClearDataModal();
  renderProfile();
  showToast('Data cleared successfully 🗑️');
}

// ==========================================
// SHARED CARD RENDERERS
// ==========================================

function renderChallengeCard(challenge, showComplete = false) {
  const isCompleted = challenge.progress >= 100;
  return `
    <div class="glass-card-sm challenge-card ${isCompleted ? 'completed' : ''}">
      <div class="challenge-header">
        <span class="challenge-icon">${challenge.icon}</span>
        <div class="challenge-info">
          <div class="challenge-title">${challenge.title}</div>
          <div class="challenge-desc">${challenge.description}</div>
        </div>
        <span class="challenge-points">${challenge.points}pts</span>
      </div>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${challenge.progress}%"></div>
        </div>
        <span class="progress-text">${challenge.progress}%</span>
      </div>
      ${!isCompleted && showComplete ? `
        <button class="challenge-complete-btn" onclick="handleCompleteChallenge('${challenge.id}')">
          Mark Complete
        </button>
      ` : ''}
      ${isCompleted ? '<div class="challenge-completed-badge">✓ Completed</div>' : ''}
    </div>
  `;
}

function renderAchievementCard(achievement) {
  const isUnlocked = achievement.unlocked;
  return `
    <div class="glass-card-sm achievement-card ${!isUnlocked ? 'locked' : ''}">
      <span class="achievement-icon">${isUnlocked ? achievement.icon : '🔒'}</span>
      <div class="achievement-content">
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-desc">${achievement.description}</div>
        ${isUnlocked && achievement.date ? `<div class="achievement-date">${formatDate(achievement.date)}</div>` : ''}
      </div>
      ${isUnlocked ? '<div class="achievement-badge">✓</div>' : ''}
    </div>
  `;
}

// ==========================================
// TOAST
// ==========================================

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ==========================================
// LEAF PARTICLES
// ==========================================

function createLeafParticles() {
  const container = document.querySelector('.leaf-particles');
  if (!container) return;
  const leaves = ['🍃', '🌿', '🍂', '🌱'];
  for (let i = 0; i < 12; i++) {
    const leaf = document.createElement('span');
    leaf.className = 'leaf';
    leaf.textContent = leaves[Math.floor(Math.random() * leaves.length)];
    leaf.style.left = `${Math.random() * 100}%`;
    leaf.style.animationDuration = `${12 + Math.random() * 18}s`;
    leaf.style.animationDelay = `${Math.random() * 20}s`;
    leaf.style.fontSize = `${14 + Math.random() * 10}px`;
    container.appendChild(leaf);
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Create leaf particles
  createLeafParticles();

  // Setup navigation
  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  // Handle hash routing
  const hash = window.location.hash.replace('#', '') || 'home';
  navigateTo(hash);

  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '') || 'home';
    if (h !== currentPage) navigateTo(h);
  });
});

// Export for Jest Testing
if (typeof module !== 'undefined') {
  module.exports = {
    calculateFootprint,
    getScoreColor,
    getScoreMessage,
    escapeHTML,
    storageGet,
    storageSet,
    getChallenges,
    saveChallenges,
    getScanHistory,
    saveScanResult,
    completeChallenge,
    getTotalPoints,
    getUsername,
    setUsername,
    getAchievements
  };
}
