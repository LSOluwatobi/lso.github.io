const projectData = {
  "01": {title:"Car Insurance Policy Dashboard", platform:"Excel", domain:"Insurance", img:"assets/excel/Excel Project 1.jpg", focus:"KPI reporting · policy analysis · customer demographics", description:"A dashboard for reviewing policy activity, customer characteristics and key insurance measures.", approach:"KPI reporting, segmentation and visual comparison."},
  "02": {title:"Supply Chain Performance Dashboard", platform:"Excel", domain:"Supply Chain", img:"assets/excel/Excel Project 2b.jpg", focus:"Performance tracking · product analysis · carrier analysis", description:"An operational view of supply-chain performance, product activity and carrier information.", approach:"Performance comparison, trend review and interactive filtering."},
  "03": {title:"Retail Sales Dashboard", platform:"Excel", domain:"Retail", img:"assets/excel/Excel Project 3.jpg", focus:"Revenue analysis · transactions · product performance", description:"A retail reporting view built around revenue, transactions, customers and product performance.", approach:"KPI summaries, product comparison and transaction analysis."},
  "04": {title:"Marketing Performance & ROMI", platform:"Excel", domain:"Marketing", img:"assets/excel/Excel Project 4.jpg", focus:"ROMI · CAC · campaign performance", description:"A marketing performance dashboard linking spend with revenue and campaign-level measures.", approach:"Comparative KPI analysis and campaign performance review."},
  "05": {title:"Investment Preference Engine", platform:"Excel", domain:"Finance", img:"assets/excel/Excel Project 5.jpg", focus:"Preference analysis · segmentation · respondent behaviour", description:"An analytical view of investment preferences and respondent behaviour.", approach:"Segmentation, frequency comparison and preference analysis."},
  "06": {title:"Global Debt Dashboard", platform:"Power BI", domain:"Finance", img:"assets/powerbi/Power BI Project 1.jpg", focus:"Rankings · categories · geographic analysis", description:"A Power BI report for comparing global debt levels, categories and geographic distribution.", approach:"Ranking, category comparison and geographic analysis."},
  "07": {title:"Health Insurance Coverage Dashboard", platform:"Power BI", domain:"Healthcare", img:"assets/powerbi/Power BI Project 2.jpg", focus:"Coverage analysis · demographic context · trend review", description:"A report focused on insurance coverage, public programmes, tax credits and uninsured rates.", approach:"KPI comparison, segmentation and trend analysis."},
  "08": {title:"TATA Online Retail Dashboard", platform:"Power BI", domain:"E-Commerce", img:"assets/powerbi/Power BI Project 3.jpg", focus:"Revenue · orders · customer analysis", description:"An e-commerce performance view covering revenue, orders, customers, countries and products.", approach:"Revenue analysis, customer segmentation and product comparison."},
  "09": {title:"U.S. International Flight Report", platform:"Power BI", domain:"Aviation", img:"assets/powerbi/Power BI Project 4.jpg", focus:"Flight activity · airports · passenger analysis", description:"A report examining flight activity, airports, passengers and flight categories.", approach:"Trend comparison, geographic review and category analysis."},
  "10": {title:"Global Mental Health Analytics", platform:"Power BI", domain:"Healthcare", img:"assets/powerbi/Power BI Project 5 ~ Page 1.jpg", focus:"Four-page report · comparative analysis · demographic patterns", description:"A four-page analytical story covering an overview, disorders, gender and suicide/depression.", approach:"Multi-page report design, comparative analysis and demographic segmentation."},
  "11": {title:"Airplane Crashes & Fatalities", platform:"Power BI", domain:"Aviation", img:"assets/powerbi/Power BI Project 6 ~ Page 1.jpg", focus:"Three-page report · risk analysis · geographic patterns", description:"A three-page report looking at crash patterns through geography, aircraft and military/commercial comparisons.", approach:"Risk-focused comparison, category analysis and geographic exploration."},
  "12": {title:"Amazon Sales Dashboard", platform:"Power BI", domain:"E-Commerce", img:"assets/powerbi/Power BI Project 7.jpg", focus:"Product analysis · ratings · discounts", description:"A product-focused report covering categories, ratings, discounts and engagement measures.", approach:"Product comparison, ranking and category-level analysis."},
  "13": {title:"Hotel Booking Performance", platform:"Power BI", domain:"Hospitality", img:"assets/powerbi/Power BI Project 8 ~ Page 1.jpg", focus:"Executive view · revenue · customer intelligence", description:"A three-page hospitality report moving from executive performance to revenue and customer intelligence.", approach:"Executive KPI reporting, revenue analysis and customer segmentation."},
  "14": {title:"Women's Clothing E-Commerce", platform:"Power BI", domain:"Customer Analytics", img:"assets/powerbi/Power BI Project 9.jpg", focus:"Reviews · ratings · customer behaviour", description:"A customer analytics report examining reviews, ratings, recommendations and positive feedback.", approach:"Customer segmentation, review analysis and comparative scoring."},
  "15": {title:"GHG Emissions Intensity", platform:"Power BI + DAX", domain:"Sustainability", img:"assets/powerbi/Power BI Project 10.jpg", focus:"DAX · benchmarks · rankings · dynamic narrative", description:"An advanced Power BI dashboard using DAX-driven KPI benchmarks, indicators, ranking logic and a responsive insight narrative.", approach:"Filter context, measures, benchmarks, indicators, Top N/Bottom N logic and dynamic narrative."}
};
const cards=[...document.querySelectorAll('.project-card')];
const filters=[...document.querySelectorAll('.filter')];
const search=document.getElementById('project-search');
const count=document.getElementById('project-count');
let activePlatform='all', activeDomain='all';
function applyFilters(){
  const term=(search?.value||'').trim().toLowerCase(); let shown=0;
  cards.forEach(card=>{
    const platformOk=activePlatform==='all'||card.dataset.platform===activePlatform;
    const domainOk=activeDomain==='all'||card.dataset.domain===activeDomain;
    const textOk=!term||card.dataset.title.includes(term);
    const show=platformOk&&domainOk&&textOk; card.classList.toggle('hidden',!show); if(show)shown++;
  });
  count.textContent=`Showing ${shown} of ${cards.length} projects`;
  document.getElementById('no-results').hidden=shown!==0;
}
filters.forEach(btn=>btn.addEventListener('click',()=>{
  const isPlatform=btn.dataset.filter!==undefined;
  if(isPlatform){activePlatform=btn.dataset.filter; filters.filter(x=>x.dataset.filter!==undefined).forEach(x=>x.classList.remove('active'));}
  else {activeDomain=btn.dataset.domain||'all'; filters.filter(x=>x.dataset.domain!==undefined).forEach(x=>x.classList.remove('active'));}
  btn.classList.add('active'); applyFilters();
}));
search?.addEventListener('input',applyFilters); applyFilters();

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const modal=document.getElementById('modal'), modalImg=document.getElementById('modal-img'), modalTitle=document.getElementById('modal-title'), modalCount=document.getElementById('modal-count'), modalFocus=document.getElementById('modal-focus');
let modalId=null;
const visibleIds=()=>cards.filter(c=>!c.classList.contains('hidden')).map(c=>c.dataset.id);
function openModal(id){const p=projectData[id];if(!p)return;modalId=id;modalImg.src=p.img;modalImg.alt=p.title;modalTitle.textContent=p.title;modalFocus.textContent=p.focus;const ids=visibleIds();modalCount.textContent=`${ids.indexOf(id)+1} / ${ids.length}`;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('locked')}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('locked')}
function moveModal(dir){const ids=visibleIds();const i=ids.indexOf(modalId);if(i<0)return;openModal(ids[(i+dir+ids.length)%ids.length])}
document.querySelectorAll('.image-btn,.view-btn').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();openModal(b.dataset.id)}));
document.querySelector('.modal-close').addEventListener('click',closeModal);document.querySelector('.modal-prev').addEventListener('click',()=>moveModal(-1));document.querySelector('.modal-next').addEventListener('click',()=>moveModal(1));modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});

document.querySelectorAll('.case-study-btn').forEach(b=>b.addEventListener('click',()=>openCaseStudy(b.dataset.id)));
const caseModal=document.getElementById('case-modal');
function openCaseStudy(id){const p=projectData[id];if(!p)return;document.getElementById('case-platform').textContent=p.platform;document.getElementById('case-title').textContent=p.title;document.getElementById('case-domain').textContent=p.domain;document.getElementById('case-focus').textContent=p.focus;document.getElementById('case-description').textContent=p.description;document.getElementById('case-approach').textContent=p.approach;document.getElementById('case-view').onclick=()=>{closeCaseStudy();openModal(id)};caseModal.classList.add('open');caseModal.setAttribute('aria-hidden','false');document.body.classList.add('locked')}
function closeCaseStudy(){caseModal.classList.remove('open');caseModal.setAttribute('aria-hidden','true');document.body.classList.remove('locked')}
document.querySelector('.case-close').addEventListener('click',closeCaseStudy);caseModal.addEventListener('click',e=>{if(e.target===caseModal)closeCaseStudy()});

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeCaseStudy()}if(modal.classList.contains('open')&&(e.key==='ArrowRight'||e.key==='ArrowLeft'))moveModal(e.key==='ArrowRight'?1:-1)});

const menu=document.querySelector('.menu-toggle'), mobile=document.querySelector('.mobile-nav');
menu?.addEventListener('click',()=>{const open=mobile.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));mobile.setAttribute('aria-hidden',String(!open))});
mobile?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobile.classList.remove('open');menu.setAttribute('aria-expanded','false');mobile.setAttribute('aria-hidden','true')}));

const nav=document.querySelector('.nav');window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>20),{passive:true});
