(() => {
  const tools = [
    {name:'GE Tracker',group:'Market tool',description:'Watch prices and flips',file:'osrs-ge-tracker.html',icon:'https://oldschool.runescape.wiki/images/Grand_Exchange_logo.png'},
    {name:'Skill Profits',group:'Market tool',description:'Compare skilling profit',file:'osrs-skill-profit.html',icon:'https://oldschool.runescape.wiki/images/Coins_10000.png'},
    {name:'Construction',group:'Training planner',description:'Levels, materials, cost',file:'osrs-training-planner.html',icon:'https://oldschool.runescape.wiki/images/Construction_icon.png'},
    {name:'Farming',group:'Training planner',description:'Runs, patches, inventory',file:'osrs-farming-planner.html',icon:'https://oldschool.runescape.wiki/images/Farming_icon.png'},
    {name:'Herblore',group:'Training planner',description:'Routes and live costs',file:'osrs-herblore-planner.html',icon:'https://oldschool.runescape.wiki/images/Herblore_icon.png'},
    {name:'Prayer',group:'Training planner',description:'Methods and bone costs',file:'osrs-prayer-planner.html',icon:'https://oldschool.runescape.wiki/images/Prayer_icon.png'}
  ];
  const currentFile=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const currentIndex=tools.findIndex(tool=>tool.file===currentFile);
  if(currentIndex<0) return;
  const current=tools[currentIndex];
  document.body.dataset.suitePage=current.name.toLowerCase().replace(/\s+/g,'-');
  const header=document.querySelector('header');
  const logo=header?.querySelector('.logo');
  if(!header||!logo) return;
  logo.textContent='OSRS Tools';
  const groups=['Market tool','Training planner'];
  const menuHtml=groups.map(group=>`<div class="suite-menu-group"><div class="suite-menu-title">${group==='Market tool'?'Market tools':'Training planners'}</div>${tools.filter(tool=>tool.group===group).map(tool=>`<a class="suite-menu-link${tool.file===currentFile?' current':''}" href="${tool.file}"><img src="${tool.icon}" alt=""><strong>${tool.name}</strong><small>${tool.description}</small></a>`).join('')}</div>`).join('');
  const host=document.createElement('div');
  host.className='suite-switcher-host';
  host.innerHTML=`<a class="suite-cycle" href="${tools[(currentIndex-1+tools.length)%tools.length].file}" aria-label="Previous tool: ${tools[(currentIndex-1+tools.length)%tools.length].name}">‹</a><button class="suite-tool-button" type="button" aria-expanded="false" aria-haspopup="menu"><img class="suite-tool-icon" src="${current.icon}" alt=""><span class="suite-tool-copy"><span class="suite-tool-group">${current.group}</span><span class="suite-tool-name">${current.name}</span></span><span class="suite-tool-chevron">▾</span></button><a class="suite-cycle" href="${tools[(currentIndex+1)%tools.length].file}" aria-label="Next tool: ${tools[(currentIndex+1)%tools.length].name}">›</a><div class="suite-tool-menu" role="menu">${menuHtml}</div>`;
  logo.insertAdjacentElement('afterend',host);
  const button=host.querySelector('.suite-tool-button');
  const menu=host.querySelector('.suite-tool-menu');
  const close=()=>{menu.classList.remove('open');button.setAttribute('aria-expanded','false')};
  button.addEventListener('click',event=>{event.stopPropagation();const open=menu.classList.toggle('open');button.setAttribute('aria-expanded',String(open))});
  document.addEventListener('click',event=>{if(!host.contains(event.target))close()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){close();button.focus()}});
})();
