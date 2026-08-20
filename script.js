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
  kicker:'DATA SCIENCE · REGRESSION', title:'Real Estate Property Value Prediction', summary:'A predictive modelling study using the King County housing dataset to estimate residential sale price and examine variables associated with property value.', hero:'assets/datascience/real-estate-drivers.png',
  badges:['OLS','Ridge','Lasso','R'],
  sections:[
   ['The Problem','Estimate residential sale price and compare baseline and regularised regression approaches without overstating the analysis as a direct ROI calculation.'],
   ['The Data','The supplied dataset contains more than 21,000 property sales. Variables include living area, grade, condition, latitude/longitude, waterfront status, bedrooms, bathrooms and engineered house age.'],
   ['Analytical Approach','House age and renovation indicators are engineered, while ID, date and ZIP code are excluded from the modelling matrix. OLS provides the baseline; Ridge and Lasso add regularisation for correlated predictors and feature selection.'],
   ['Model Comparison','Reported results are close: Lasso has the highest reported adjusted R² (0.7109), OLS the lowest RMSE ($196,337), and Ridge the lowest MAE ($122,646). No single model is presented as an unconditional winner — use the panel below to compare the reported headline metric for each model.'],
   ['Key Insight','Latitude, waterfront status and construction quality are highlighted among variables associated with higher property values in the fitted model. These are model associations, not causal effects or direct ROI measures.'],
   ['Limitations','The supplied analysis predicts sale price rather than realised investment return. A true ROI model would require investment cost, financing, holding period, cash-flow and exit-value assumptions.']
  ],
  comparison:{
   metrics:['Adjusted R²','RMSE ($)','MAE ($)'],
   best:{'Adjusted R²':'Lasso','RMSE ($)':'OLS','MAE ($)':'Ridge'},
   data:{OLS:{'RMSE ($)':196337}, Ridge:{'MAE ($)':122646}, Lasso:{'Adjusted R²':0.7109}},
   note:'Only the reported headline metric is available for each model in the supplied case write-up.'
  },
  demonstrates:[
   'Feature engineering from raw fields (house age, renovation indicators)',
   'Regularisation trade-offs across OLS, Ridge and Lasso',
   'Model evaluation using adjusted R², RMSE and MAE together, not a single number',
   'Translating regression coefficients into plain-language, non-causal insight',
   'Being explicit about what the model can and cannot claim (price vs. ROI)'
  ]
 },
 'heart-disease': {
  kicker:'DATA SCIENCE · CLASSIFICATION', title:'Heart Disease Risk Prediction', summary:'A comparative predictive-modelling exercise using the UCI Cleveland Heart Disease dataset to distinguish observations with and without heart disease.', hero:'assets/datascience/heart-roc-comparison.png',
  badges:['Logistic Regression','LDA','Naive Bayes','R'],
  sections:[
   ['The Problem','Compare three classification approaches on a public clinical dataset and examine how well they distinguish observations with and without heart disease. This is an academic predictive-modelling exercise, not a validated medical diagnostic system.'],
   ['The Data','The Cleveland dataset contains clinical measurements including age, sex, chest-pain type, resting blood pressure, cholesterol, maximum heart rate, exercise-induced angina, ST depression, vessel count and thalassemia-related information.'],
   ['Analytical Approach','Missing values are median-imputed, the multi-level target is converted to a binary outcome, categorical variables are dummy encoded, predictors are standardised, VIF is used as a multicollinearity diagnostic, and the data are split into training and test sets.'],
   ['Model Comparison','The supplied run reports LDA with the strongest Accuracy (84.75%) and ROC-AUC (0.9491). LDA and Naive Bayes share the highest reported Recall (92.59%). These figures are retained from the supplied project version — use the panel below to compare models metric by metric.'],
   ['Key Insight','The supplied Logistic Regression analysis identifies vessel count, resting blood pressure, sex and chest-pain categories as important predictors within this sample. These are fitted-model associations, not clinical causation.'],
   ['Limitations','The sample is relatively small and comes from a specific clinical cohort. External validation, calibration, threshold analysis and clinical review would be required before any real-world medical application.']
  ],
  comparison:{
   metrics:['Accuracy (%)','ROC-AUC','Recall (%)'],
   best:{'Accuracy (%)':'LDA','ROC-AUC':'LDA','Recall (%)':'LDA'},
   data:{LDA:{'Accuracy (%)':84.75,'ROC-AUC':0.9491,'Recall (%)':92.59}, 'Naive Bayes':{'Recall (%)':92.59}, Logistic:{}},
   note:'Logistic Regression\u2019s headline accuracy/ROC-AUC/recall were not reported alongside LDA and Naive Bayes in the supplied case write-up.'
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
