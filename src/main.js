import './style.css';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 0.85,
  smoothWheel: true,
  syncTouch: false,
  anchors: true,
  allowNestedScroll: true,
  stopInertiaOnNavigate: true,
});
const tickSmoothScroll = (time) => lenis.raf(time * 1000);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(tickSmoothScroll);
gsap.ticker.lagSmoothing(0);

const drawer = document.querySelector('#drawer');
const shade = document.querySelector('#shade');
const cartEl = document.querySelector('#cart');
const empty = document.querySelector('#empty');
const count = document.querySelector('#bag-count');
const total = document.querySelector('#total');
const success = document.querySelector('#order-success');
const copy = document.querySelector('#order-copy');
const customer = document.querySelector('#customer');
const pickup = document.querySelector('#pickup-time');
const topbar = document.querySelector('.topbar');
let cart = [];

function syncTopbar(){topbar?.classList.toggle('is-scrolled',window.scrollY>24)}
syncTopbar();
window.addEventListener('scroll',syncTopbar,{passive:true});

function initRevealMotion(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  const revealWithin=(triggerSelector,targetSelector,stagger=.05)=>{
    const trigger=document.querySelector(triggerSelector);
    const targets=trigger?.querySelectorAll(targetSelector);
    if(!trigger||!targets?.length)return;
    gsap.from(targets,{y:17,autoAlpha:0,duration:.55,stagger,ease:'power2.out',scrollTrigger:{trigger,start:'top 86%',once:true}});
  };

  gsap.timeline({defaults:{ease:'power2.out'}})
    .from('.topbar > *',{y:-7,autoAlpha:0,duration:.4,stagger:.035})
    .from('.hero-copy > .micro',{y:10,autoAlpha:0,duration:.36},'-=.16')
    .from('.hero-copy h1',{y:20,autoAlpha:0,duration:.56},'-=.16')
    .from('.intro, .hero-offers, .hero-actions',{y:14,autoAlpha:0,duration:.46,stagger:.055},'-=.26')
    .from('.roast-note',{y:9,autoAlpha:0,duration:.42},'-=.22')
    .from('.photo-tag',{autoAlpha:0,duration:.38},'-=.28');

  gsap.from('.hero-photo',{autoAlpha:0,duration:.72,ease:'power1.out',clearProps:'opacity,visibility'});
  revealWithin('.menu','.menu-head > *, .menu-group',.055);
  revealWithin('.story','.story > *',.06);
  revealWithin('.visit','.visit-dark > *, .visit-note > *',.055);
}

initRevealMotion();

function money(value){return `₱${value.toLocaleString('en-PH')}`}
function openDrawer(){drawer.classList.add('is-open');shade.classList.add('is-open');drawer.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeDrawer(){drawer.classList.remove('is-open');shade.classList.remove('is-open');drawer.setAttribute('aria-hidden','true');document.body.style.overflow=''}
function render(){
  cartEl.innerHTML='';
  cart.forEach((item,index)=>{
    const row=document.createElement('div');
    row.className='cart-row';
    row.innerHTML=`<div><strong>${item.name}</strong><small>${money(item.price)}</small></div><span>1×</span><button aria-label="Remove ${item.name}">Remove</button>`;
    row.querySelector('button').addEventListener('click',()=>{cart.splice(index,1);render()});
    cartEl.appendChild(row);
  });
  const sum=cart.reduce((acc,item)=>acc+item.price,0);
  count.textContent=cart.length;
  total.textContent=money(sum);
  empty.style.display=cart.length?'none':'block';
}

document.querySelectorAll('.menu-item').forEach(button=>button.addEventListener('click',()=>{
  cart.push({name:button.dataset.name,price:Number(button.dataset.price)});
  render();openDrawer();
}));
['#bag-button','#quick-order','#visit-order'].forEach(id=>document.querySelector(id).addEventListener('click',openDrawer));
document.querySelector('#drawer-close').addEventListener('click',closeDrawer);
shade.addEventListener('click',closeDrawer);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});

document.querySelector('#checkout').addEventListener('click',()=>{
  if(!cart.length){document.querySelector('#menu').scrollIntoView({behavior:'smooth'});closeDrawer();return}
  const name=customer.value.trim()||'Guest';
  const order={name,pickup:pickup.value,items:cart,total:cart.reduce((a,b)=>a+b.price,0)};
  const history=JSON.parse(localStorage.getItem('sora-orders')||'[]');
  localStorage.setItem('sora-orders',JSON.stringify([order,...history]));
  copy.textContent=`Thanks, ${name}. Your ${cart.length}-item pickup order is set for ${pickup.value.toLowerCase()}.`;
  success.classList.add('is-visible');
});

document.querySelector('#new-order').addEventListener('click',()=>{cart=[];customer.value='';success.classList.remove('is-visible');render()});
render();
