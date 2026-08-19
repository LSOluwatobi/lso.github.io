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

let activePortfolio = 'all';
let activeFocus = 'all';
let activeDomain = 'all';
let searchTerm = '';
let modalIndex = 0;

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
  if (searchTerm) description += ` · “${searchTerm}”`;
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

const caseData = {
 'real-estate': {
  kicker:'DATA SCIENCE · REGRESSION', title:'Real Estate Property Value Prediction', summary:'A predictive modelling study using the King County housing dataset to estimate residential sale price and examine variables associated with property value.', hero:'assets/datascience/real-estate-drivers.png',
  badges:['OLS','Ridge','Lasso','R'],
  sections:[
   ['The Problem','Estimate residential sale price and compare baseline and regularised regression approaches without overstating the analysis as a direct ROI calculation.'],
   ['The Data','The supplied dataset contains more than 21,000 property sales. Variables include living area, grade, condition, latitude/longitude, waterfront status, bedrooms, bathrooms and engineered house age.'],
   ['Analytical Approach','House age and renovation indicators are engineered, while ID, date and ZIP code are excluded from the modelling matrix. OLS provides the baseline; Ridge and Lasso add regularisation for correlated predictors and feature selection.'],
   ['Model Comparison','Reported results are close: Lasso has the highest reported adjusted R² (0.7109), OLS the lowest RMSE ($196,337), and Ridge the lowest MAE ($122,646). No single model is presented as an unconditional winner.'],
   ['Key Insight','Latitude, waterfront status and construction quality are highlighted among variables associated with higher property values in the fitted model. These are model associations, not causal effects or direct ROI measures.'],
   ['Limitations','The supplied analysis predicts sale price rather than realised investment return. A true ROI model would require investment cost, financing, holding period, cash-flow and exit-value assumptions.']
  ]
 },
 'heart-disease': {
  kicker:'DATA SCIENCE · CLASSIFICATION', title:'Heart Disease Risk Prediction', summary:'A comparative predictive-modelling exercise using the UCI Cleveland Heart Disease dataset to distinguish observations with and without heart disease.', hero:'assets/datascience/heart-roc-comparison.png',
  badges:['Logistic Regression','LDA','Naive Bayes','R'],
  sections:[
   ['The Problem','Compare three classification approaches on a public clinical dataset and examine how well they distinguish observations with and without heart disease. This is an academic predictive-modelling exercise, not a validated medical diagnostic system.'],
   ['The Data','The Cleveland dataset contains clinical measurements including age, sex, chest-pain type, resting blood pressure, cholesterol, maximum heart rate, exercise-induced angina, ST depression, vessel count and thalassemia-related information.'],
   ['Analytical Approach','Missing values are median-imputed, the multi-level target is converted to a binary outcome, categorical variables are dummy encoded, predictors are standardised, VIF is used as a multicollinearity diagnostic, and the data are split into training and test sets.'],
   ['Model Comparison','The supplied run reports LDA with the strongest Accuracy (84.75%) and ROC-AUC (0.9491). LDA and Naive Bayes share the highest reported Recall (92.59%). These figures are retained from the supplied project version and should be regenerated after rerunning the corrected workflow.'],
   ['Key Insight','The supplied Logistic Regression analysis identifies vessel count, resting blood pressure, sex and chest-pain categories as important predictors within this sample. These are fitted-model associations, not clinical causation.'],
   ['Limitations','The sample is relatively small and comes from a specific clinical cohort. External validation, calibration, threshold analysis and clinical review would be required before any real-world medical application.']
  ]
 }
};
const caseModal=document.getElementById('case-modal'); const caseTitle=document.getElementById('case-title'); const caseSummary=document.getElementById('case-summary'); const caseHero=document.getElementById('case-hero-img'); const caseKicker=document.getElementById('case-kicker'); const caseBadges=document.getElementById('case-badges'); const caseBody=document.getElementById('case-body');
function openCase(key){const d=caseData[key]; if(!d)return; caseKicker.textContent=d.kicker; caseTitle.textContent=d.title; caseSummary.textContent=d.summary; caseHero.src=d.hero; caseHero.alt=d.title; caseBadges.innerHTML=d.badges.map(x=>`<span>${x}</span>`).join(''); caseBody.innerHTML=d.sections.map((s,i)=>`<section class="case-section"><div class="case-num">${String(i+1).padStart(2,'0')}</div><div><h3>${s[0]}</h3><p>${s[1]}</p></div></section>`).join(''); caseModal.classList.add('open'); caseModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';}
function closeCase(){caseModal.classList.remove('open'); caseModal.setAttribute('aria-hidden','true'); document.body.style.overflow='';}
document.querySelectorAll('.case-btn').forEach(b=>b.addEventListener('click',()=>openCase(b.dataset.case)));
document.getElementById('case-close').addEventListener('click',closeCase); caseModal.addEventListener('click',e=>{if(e.target===caseModal)closeCase();});

document.addEventListener('keydown',e=>{if(modal.classList.contains('open')){if(e.key==='Escape')closeDashboard(); if(e.key==='ArrowLeft')moveDashboard(-1); if(e.key==='ArrowRight')moveDashboard(1);} else if(caseModal.classList.contains('open')&&e.key==='Escape'){closeCase();}});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)entry.target.classList.add('visible');}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
applyFilters();
