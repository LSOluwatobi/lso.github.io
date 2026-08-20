/* ===== Setup & shared state ===== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalCounter = document.getElementById('modal-counter');
const modalPrev = document.getElementById('modal-prev');
const modalNext = document.getElementById('modal-next');
const cards = [...document.querySelectorAll('.project-card')];
const portfolioButtons = [...document.querySelectorAll('.portfolio-filter')];
const platformButtons = [...document.querySelectorAll('.platform-filter')];
const domainButtons = [...document.querySelectorAll('.domain-filter')];
const filterStatus = document.getElementById('filter-status');
const searchInput = document.getElementById('project-search');
const caseModal = document.getElementById('case-modal');
const quickModal = document.getElementById('quick-modal');

let activePortfolio = 'all';
let activeFocus = 'all';
let activeDomain = 'all';
let searchTerm = '';
let modalIndex = 0;

/* ===== Filtering (existing analytics + data science structure, preserved) ===== */
function visibleCards() { return cards.filter(card => !card.classList.contains('hidden')); }
function setActive(buttons, value, attr) { buttons.forEach(b => b.classList.toggle('active', b.dataset[attr] === value)); }
function titleCase(value) { return value.replace(/\b\w/g, c => c.toUpperCase()); }
function resetFocusAndDomain() {
  activeFocus = 'all'; activeDomain = 'all';
  setActive(platformButtons, 'all', 'platformFilter');
  setActive(domainButtons, 'all', 'domainFilter');
}
function applyFilters() {
  let count = 0;
  cards.forEach(card => {
    const portfolio = card.dataset.portfolio || 'analytics';
    const method = card.dataset.method || card.dataset.platform || '';
    const domain = card.dataset.domain || '';
    const text = `${card.textContent} ${card.dataset.title || ''} ${method} ${domain}`.toLowerCase();
    const portfolioMatch = activePortfolio === 'all' || portfolio === activePortfolio;
    const focusMatch = activeFocus === 'all' || method === activeFocus;
    const domainMatch = activeDomain === 'all' || domain === activeDomain;
    const searchMatch = !searchTerm || text.includes(searchTerm);
    const show = portfolioMatch && focusMatch && domainMatch && searchMatch;
    card.classList.toggle('hidden', !show);
    if (show) count++;
  });
  let description = activePortfolio === 'all' ? 'all work' : activePortfolio === 'analytics' ? 'analytics' : 'data science';
  if (activeFocus !== 'all') description += ` · ${titleCase(activeFocus === 'power' ? 'Power BI' : activeFocus)}`;
  if (activeDomain !== 'all') description += ` · ${titleCase(activeDomain)}`;
  if (searchTerm) description += ` · "${searchTerm}"`;
  filterStatus.textContent = `Showing ${count} project${count === 1 ? '' : 's'} — ${description}`;
}

portfolioButtons.forEach(button => button.addEventListener('click', () => {
  activePortfolio = button.dataset.portfolioFilter;
  setActive(portfolioButtons, activePortfolio, 'portfolioFilter');
  if (activePortfolio === 'datascience') {
    activeFocus = 'all'; activeDomain = 'all';
    setActive(platformButtons, 'all', 'platformFilter');
    setActive(domainButtons, 'all', 'domainFilter');
  } else if (activePortfolio === 'analytics' || activePortfolio === 'all') {
    activeDomain = 'all';
    setActive(domainButtons, 'all', 'domainFilter');
    if (activePortfolio === 'all') resetFocusAndDomain();
  }
  applyFilters();
}));
platformButtons.forEach(button => button.addEventListener('click', () => {
  activeFocus = button.dataset.platformFilter;
  setActive(platformButtons, activeFocus, 'platformFilter');
  if (activeFocus === 'regression' || activeFocus === 'classification') {
    activePortfolio = 'datascience'; activeDomain = 'all';
    setActive(portfolioButtons, 'datascience', 'portfolioFilter');
    setActive(domainButtons, 'all', 'domainFilter');
  } else if (activeFocus === 'excel' || activeFocus === 'power') {
    activePortfolio = 'analytics'; activeDomain = 'all';
    setActive(portfolioButtons, 'analytics', 'portfolioFilter');
    setActive(domainButtons, 'all', 'domainFilter');
  } else {
    activePortfolio = 'all'; activeDomain = 'all';
    setActive(portfolioButtons, 'all', 'portfolioFilter');
    setActive(domainButtons, 'all', 'domainFilter');
  }
  applyFilters();
}));
domainButtons.forEach(button => button.addEventListener('click', () => {
  activeDomain = button.dataset.domainFilter;
  setActive(domainButtons, activeDomain, 'domainFilter');
  applyFilters();
}));
if (searchInput) searchInput.addEventListener('input', () => { searchTerm = searchInput.value.trim().toLowerCase(); applyFilters(); });

/* ===== Fullscreen dashboard modal ===== */
function openDashboard(cardIndex) {
  const currentCards = visibleCards(); if (!currentCards.length) return;
  modalIndex = Math.max(0, Math.min(cardIndex, currentCards.length - 1));
  const button = currentCards[modalIndex].querySelector('.image-btn');
  modalImg.src = button.dataset.img; modalImg.alt = button.querySelector('img')?.alt || button.dataset.title;
  modalTitle.textContent = button.dataset.title; modalCounter.textContent = `${modalIndex + 1} / ${currentCards.length}`;
  modalPrev.disabled = currentCards.length < 2; modalNext.disabled = currentCards.length < 2;
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
}
function closeDashboard() { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
function moveDashboard(step) { const currentCards=visibleCards(); if(currentCards.length<2)return; modalIndex=(modalIndex+step+currentCards.length)%currentCards.length; openDashboard(modalIndex); }
document.querySelectorAll('.image-btn').forEach(button => button.addEventListener('click', () => openDashboard(visibleCards().indexOf(button.closest('.project-card')))));
document.querySelectorAll('.view-btn').forEach(button => button.addEventListener('click', () => openDashboard(visibleCards().indexOf(button.closest('.project-card')))));
document.querySelector('.modal-close').addEventListener('click', closeDashboard);
modalPrev.addEventListener('click',()=>moveDashboard(-1)); modalNext.addEventListener('click',()=>moveDashboard(1));
modal.addEventListener('click',e=>{if(e.target===modal)closeDashboard();});

/* ===== Quick View ===== */
function openQuickView(card){
  const imgBtn = card.querySelector('.image-btn');
  const quickImg = document.getElementById('quick-img');
  quickImg.src = imgBtn.dataset.img;
  quickImg.alt = imgBtn.querySelector('img')?.alt || imgBtn.dataset.title;
  document.getElementById('quick-title').textContent = imgBtn.dataset.title;
  document.getElementById('quick-meta').innerHTML = card.querySelector('.meta')?.innerHTML || '';
  const insightEl = card.querySelector('.insight-overlay p');
  document.getElementById('quick-insight').textContent = insightEl ? insightEl.textContent : '';
  const badgeSource = card.querySelector('.tech-badges, .method-badges');
  document.getElementById('quick-badges').innerHTML = badgeSource ? badgeSource.innerHTML : '';

  const actions = document.getElementById('quick-actions');
  const caseKey = card.dataset.case;
  actions.innerHTML = caseKey
    ? '<button class="btn primary" id="quick-case-btn">Explore Case Study ↗</button><button class="btn ghost" id="quick-full-btn">View Fullscreen</button>'
    : '<button class="btn primary" id="quick-full-btn">View Fullscreen</button>';
  document.getElementById('quick-full-btn').addEventListener('click', ()=>{ closeQuickView(); openDashboard(visibleCards().indexOf(card)); });
  if (caseKey) document.getElementById('quick-case-btn').addEventListener('click', ()=>{ closeQuickView(); openCase(caseKey); });

  quickModal.classList.add('open'); quickModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
}
function closeQuickView(){ quickModal.classList.remove('open'); quickModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
document.querySelectorAll('.quick-btn').forEach(btn=>btn.addEventListener('click', ()=>openQuickView(btn.closest('.project-card'))));
document.getElementById('quick-close').addEventListener('click', closeQuickView);
quickModal.addEventListener('click', e=>{ if(e.target===quickModal) closeQuickView(); });

/* ===== Case study data (figures reused verbatim from the source write-ups) ===== */
const caseData = {
 'real-estate': {
  kicker:'DATA SCIENCE · REGRESSION', title:'Real Estate Property Value Prediction', summary:'A machine learning pipeline comparing OLS, Ridge and Lasso regression to estimate residential sale price and identify the strongest drivers of property value.', hero:'assets/datascience/real-estate-drivers.png',
  badges:['OLS','Ridge','Lasso','R'],
  sections:[
   ['The Problem','Estimate residential sale price and identify which property characteristics most influence value, comparing a baseline linear model against two regularised alternatives.'],
   ['The Data','Property sales data including living area, grade, condition, latitude/longitude, waterfront status, bedrooms, bathrooms and construction year.'],
   ['The Machine Learning Pipeline','Three algorithms were compared: OLS Linear as the standard statistical baseline; Ridge, using L₂ regularisation to handle high multicollinearity between features like bedrooms and bathrooms; and Lasso, using L₁ regularisation to perform automated feature selection and surface the most critical value drivers. Raw construction years were transformed into "House Age," with binary indicators engineered for renovation status.'],
   ['Model Performance','Models were evaluated on RMSE (average dollar error) and adjusted R², to check accuracy without over-fitting from unnecessary complexity. Results were close across all three: Lasso posted the highest adjusted R² (0.7109) with RMSE $196,340 and MAE $123,694; OLS Linear posted RMSE $196,337 and MAE $123,900 with adjusted R² 0.7108; Ridge posted the lowest MAE ($122,646), RMSE $197,099 and adjusted R² 0.7101. Lasso was selected as the preferred model — while accuracy was comparable to OLS, its ability to mathematically simplify the model by penalising low-impact variables makes it the more robust tool for investment forecasting.'],
   ['Investment Insights: The ROI Drivers','The Lasso model\u2019s standardised coefficients map out where location and scarcity outweigh sheer size: latitude had the highest positive impact (~$560k), highlighting specific high-value corridors; a waterfront view added an average of $557,562 to property value, the single largest physical feature driver; and construction grade and quality significantly outperformed total bedrooms in value contribution — adding bedrooms without increasing overall quality showed a negative coefficient (‑$33k), suggesting an "over-crowding" penalty in high-end markets.'],
   ['Limitations','The model predicts sale price and value drivers, not a full investment-return calculation. A true ROI model would additionally require purchase cost, financing, holding period, cash-flow and exit-value assumptions.']
  ],
  comparison:{
   metrics:['RMSE ($)','MAE ($)','Adjusted R²'],
   best:{'RMSE ($)':'OLS Linear','MAE ($)':'Ridge Regression','Adjusted R²':'Lasso Regression'},
   data:{
     'Lasso Regression':{'RMSE ($)':196340,'MAE ($)':123694,'Adjusted R²':0.7109},
     'OLS Linear':{'RMSE ($)':196337,'MAE ($)':123900,'Adjusted R²':0.7108},
     'Ridge Regression':{'RMSE ($)':197099,'MAE ($)':122646,'Adjusted R²':0.7101}
   },
   note:'All three models perform within a narrow band of each other; Lasso is preferred for its built-in feature selection rather than a decisive accuracy gap.'
  },
  demonstrates:[
   'Comparing a baseline (OLS) against L\u2082-regularised (Ridge) and L\u2081-regularised (Lasso) regression',
   'Feature engineering from raw fields (House Age, renovation indicators)',
   'Evaluating models on RMSE and adjusted R\u00b2 together to guard against over-fitting',
   'Reading standardised coefficients as a map of investment drivers (location, scarcity, quality vs. quantity)',
   'Being explicit about what the model can and cannot claim (value drivers vs. full ROI)'
  ]
 },
 'heart-disease': {
  kicker:'DATA SCIENCE · CLASSIFICATION', title:'Heart Disease Risk Prediction', summary:'A comparative classification pipeline using Logistic Regression, LDA and Naive Bayes on the UCI Cleveland Heart Disease dataset.', hero:'assets/datascience/heart-roc-comparison.png',
  badges:['Logistic Regression','LDA','Naive Bayes','R'],
  sections:[
   ['The Problem','Compare three classification approaches on a public clinical dataset to distinguish patients with and without heart disease. This is an academic predictive-modelling exercise, not a validated medical diagnostic system.'],
   ['The Data','The Cleveland dataset contains clinical measurements including age, sex, chest-pain type, resting blood pressure, cholesterol, maximum heart rate, exercise-induced angina, ST depression, major vessel count (ca) and thalassemia status (thal).'],
   ['1. Data Cleaning & Transformation','Missing values in ca and thal were handled with median imputation to preserve a full clinical record. The original 0–4 severity scale was re-coded into a binary target: disease presence vs. absence. Categorical variables were converted with full-rank dummy encoding to avoid the "dummy variable trap" and keep the models stable.'],
   ['2. Statistical Diagnostics','Z-score standardisation was applied to all numeric features so scale-sensitive models like LDA aren\u2019t biased by features with larger ranges (e.g. cholesterol vs. oldpeak). Multicollinearity was checked with VIF; all variables came in below 3.2, confirming a healthy, non-redundant feature set for the parametric models.'],
   ['3. Model Comparison & Results','Metrics were calculated on an 80/20 train-test split. LDA led on Accuracy (84.75%), ROC-AUC (0.9491) and F1-Score (0.8475). Logistic Regression and Naive Bayes both landed at 79.66% accuracy; Naive Bayes matched LDA\u2019s top Recall of 92.59%, while Logistic Regression led neither metric outright but stayed competitive across the board.'],
   ['Clinical Insights','The Logistic Regression model identified several statistically significant predictors (p < 0.05): major vessel count (ca) was the strongest predictor (p < 0.001) — more vessels coloured by fluoroscopy correlates significantly with disease presence; resting blood pressure showed a significant positive correlation with heart disease risk; male patients showed higher log-odds of heart disease than female patients in this clinical sample; and asymptomatic chest pain (cp.4) was a statistically significant indicator of underlying cardiovascular issues.'],
   ['Limitations','The sample is relatively small and drawn from a specific clinical cohort. External validation, calibration, threshold analysis and clinical review would be required before any real-world medical application.']
  ],
  comparison:{
   metrics:['Accuracy (%)','ROC-AUC','Precision (%)','Recall (%)','F1-Score'],
   best:{'Accuracy (%)':'LDA','ROC-AUC':'LDA','Precision (%)':'LDA','Recall (%)':'LDA','F1-Score':'LDA'},
   data:{
     'LDA':{'Accuracy (%)':84.75,'ROC-AUC':0.9491,'Precision (%)':78.13,'Recall (%)':92.59,'F1-Score':0.8475},
     'Logistic Regression':{'Accuracy (%)':79.66,'ROC-AUC':0.9167,'Precision (%)':72.73,'Recall (%)':88.89,'F1-Score':0.8000},
     'Naive Bayes':{'Accuracy (%)':79.66,'ROC-AUC':0.9144,'Precision (%)':71.43,'Recall (%)':92.59,'F1-Score':0.8065}
   },
   note:'LDA leads on Accuracy, ROC-AUC and F1-Score; Naive Bayes matches LDA\u2019s top Recall (92.59%) despite lower overall accuracy.'
  },
  demonstrates:[
   'Data cleaning: median imputation of missing clinical values',
   'Encoding categorical predictors and standardising numeric features',
   'Multicollinearity diagnostics using VIF before modelling',
   'Comparative evaluation across accuracy, ROC-AUC and recall — not one metric alone',
   'Clear, explicit boundaries around real-world clinical applicability'
  ]
 }
};

const caseTitle=document.getElementById('case-title'); const caseSummary=document.getElementById('case-summary'); const caseHero=document.getElementById('case-hero-img'); const caseKicker=document.getElementById('case-kicker'); const caseBadges=document.getElementById('case-badges'); const caseBody=document.getElementById('case-body'); const caseProgressFill=document.getElementById('case-progress-fill');

function renderComparison(container, comp){
  if(!container){ return; }
  if(!comp){ container.innerHTML=''; return; }
  const metrics = comp.metrics;
  let active = metrics[0];
  function bars(){
    const rows = Object.keys(comp.data).map(model => ({ model, val: comp.data[model][active] }));
    const present = rows.filter(r => r.val !== undefined);
    const isPercent = /%/.test(active);
    const isMoney = /\$/.test(active);
    const maxVal = present.length ? Math.max(...present.map(r => r.val)) : 1;
    return rows.map(r=>{
      let width, label;
      if (r.val === undefined) { width = 0; label = 'Not reported'; }
      else if (isPercent) { width = Math.min(r.val, 100); label = `${r.val}%`; }
      else if (isMoney) { width = Math.min((r.val/(maxVal*1.15))*100, 100); label = `$${r.val.toLocaleString()}`; }
      else { width = Math.min(r.val*100, 100); label = r.val.toFixed(4); }
      const isBest = comp.best && comp.best[active] === r.model;
      return `<div class="mc-row${isBest?' mc-best':''}"><span class="mc-model">${r.model}${isBest?' <em>Best reported</em>':''}</span><div class="mc-track"><div class="mc-fill" style="width:${width}%"></div></div><span class="mc-value">${label}</span></div>`;
    }).join('');
  }
  function render(){
    container.innerHTML = `
      <div class="mc-tabs" role="tablist">${metrics.map(m=>`<button class="mc-tab${m===active?' active':''}" data-metric="${m}">${m}</button>`).join('')}</div>
      <div class="mc-bars">${bars()}</div>
      <p class="mc-note">${comp.note||''}</p>`;
    container.querySelectorAll('.mc-tab').forEach(btn=>btn.addEventListener('click', ()=>{ active = btn.dataset.metric; render(); }));
  }
  render();
}

function openCase(key){
  const d = caseData[key]; if(!d) return;
  caseKicker.textContent = d.kicker; caseTitle.textContent = d.title; caseSummary.textContent = d.summary;
  caseHero.src = d.hero; caseHero.alt = d.title;
  caseBadges.innerHTML = d.badges.map(x=>`<span>${x}</span>`).join('');
  const sectionsHtml = d.sections.map((s,i)=>`<section class="case-section"><div class="case-num">${String(i+1).padStart(2,'0')}</div><div><h3>${s[0]}</h3><p>${s[1]}</p></div></section>`).join('');
  const comparisonHtml = d.comparison ? `<section class="case-section case-comparison-section"><div class="case-num">＃</div><div><h3>Model Comparison</h3><div id="case-comparison" class="model-comparison"></div></div></section>` : '';
  const demonstratesHtml = d.demonstrates ? `<section class="case-section case-demonstrates-section"><div class="case-num">✓</div><div><h3>What This Project Demonstrates</h3><ul class="demonstrates-list">${d.demonstrates.map(x=>`<li>${x}</li>`).join('')}</ul></div></section>` : '';
  caseBody.innerHTML = sectionsHtml + comparisonHtml + demonstratesHtml;
  renderComparison(document.getElementById('case-comparison'), d.comparison);
  if (caseProgressFill) caseProgressFill.style.width = '0%';
  caseModal.scrollTop = 0;
  caseModal.classList.add('open'); caseModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
}
function closeCase(){ caseModal.classList.remove('open'); caseModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
document.querySelectorAll('.case-btn').forEach(b=>b.addEventListener('click', ()=>openCase(b.dataset.case)));
document.getElementById('case-close').addEventListener('click', closeCase);
caseModal.addEventListener('click', e=>{ if(e.target===caseModal) closeCase(); });
caseModal.addEventListener('scroll', () => {
  if (!caseProgressFill) return;
  const max = caseModal.scrollHeight - caseModal.clientHeight;
  const pct = max > 0 ? (caseModal.scrollTop/max)*100 : 0;
  caseProgressFill.style.width = `${pct}%`;
});

/* ===== Mobile section menu ===== */
const navToggle = document.getElementById('nav-toggle');
const mobileNav = document.getElementById('mobile-nav');
const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
function setMobileNav(open){
  mobileNav.classList.toggle('open', open);
  mobileNavBackdrop.classList.toggle('open', open);
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  mobileNav.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
}
if (navToggle) {
  navToggle.addEventListener('click', () => setMobileNav(!mobileNav.classList.contains('open')));
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMobileNav(false)));
  mobileNavBackdrop.addEventListener('click', () => setMobileNav(false));
}

/* ===== Sticky / active navigation (scroll spy) ===== */
const navLinks = [...document.querySelectorAll('#primary-nav a, .mobile-nav a[href^="#"]')];
const navSectionIds = ['work','about','skills','datascience','contact'];
const navSections = navSectionIds.map(id => document.getElementById(id)).filter(Boolean);
function setActiveNavLink(id){
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
}
if ('IntersectionObserver' in window && navSections.length) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) setActiveNavLink(entry.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  navSections.forEach(sec => navObserver.observe(sec));
}

/* ===== Reveal-on-scroll (respects reduced motion) ===== */
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

/* ===== Keyboard controls ===== */
document.addEventListener('keydown', e => {
  const tag = document.activeElement ? document.activeElement.tagName : '';
  const typing = tag === 'INPUT' || tag === 'TEXTAREA';

  if (modal.classList.contains('open')) {
    if (e.key === 'Escape') closeDashboard();
    if (e.key === 'ArrowLeft') moveDashboard(-1);
    if (e.key === 'ArrowRight') moveDashboard(1);
    return;
  }
  if (caseModal.classList.contains('open')) {
    if (e.key === 'Escape') closeCase();
    if (e.key === 'ArrowDown') { e.preventDefault(); caseModal.scrollBy({ top: 220, behavior: scrollBehavior }); }
    if (e.key === 'ArrowUp') { e.preventDefault(); caseModal.scrollBy({ top: -220, behavior: scrollBehavior }); }
    return;
  }
  if (quickModal.classList.contains('open')) {
    if (e.key === 'Escape') closeQuickView();
    return;
  }
  if (e.key === '/' && !typing) {
    e.preventDefault();
    if (searchInput) searchInput.focus();
  }
  if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) {
    setMobileNav(false);
  }
});

applyFilters();
