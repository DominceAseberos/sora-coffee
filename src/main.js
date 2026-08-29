import './style.css';

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
