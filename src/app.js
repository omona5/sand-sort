import {copy,pour,solved,generate,validSave} from './engine.js';
const $=id=>document.getElementById(id),palette=['sand','coral','sage','blue','lilac'];
const names=['골드','코랄','세이지','블루','라일락'];
let state={level:1,difficulty:'easy',board:[],moves:0,elapsed:0},selected=null,history=[],busy=false,sound=false,audio,hintWorker,hintGeneration=0,timerAnchor=Date.now(),active=false;
try{const saved=JSON.parse(localStorage.getItem('sand-sort-v1'));if(validSave(saved))state=saved;sound=localStorage.getItem('sand-sort-sound')==='true';}catch{}
if(!state.board.length)state.board=generate(state.level,state.difficulty).board;
active=state.moves>0&&!solved(state.board);
function elapsed(){return state.elapsed+(active?Math.floor((Date.now()-timerAnchor)/1000):0);}
function save(){try{localStorage.setItem('sand-sort-v1',JSON.stringify({...state,elapsed:elapsed()}));$('save-status').innerHTML='자동 저장됨 <i></i>';}catch{$('save-status').textContent='저장 불가 · 현재 창에서 플레이';}}
function clock(){const t=elapsed();$('timer').textContent=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;}
function message(text){$('status').textContent=text;}
function cancelHint(){hintGeneration++;hintWorker?.terminate();hintWorker=null;$('hint').disabled=false;}
function render(){
 $('board').replaceChildren();
 state.board.forEach((tube,i)=>{
  const button=document.createElement('button');button.className='tube-button';button.dataset.index=i;
  button.setAttribute('aria-label',`${i+1}번 병, ${tube.length?`아래부터 ${tube.map(c=>names[c]).join(', ')}`:'비어 있음'}`);
  button.setAttribute('aria-pressed',String(selected===i));
  if(selected===i)button.classList.add('selected');
  const complete=tube.length===4&&tube.every(c=>c===tube[0]);if(complete)button.classList.add('complete');
  const glass=document.createElement('span');glass.className='tube';const stack=document.createElement('span');stack.className='sand-stack';
  tube.forEach(c=>{const layer=document.createElement('span');layer.className='sand-layer';layer.style.setProperty('--color',`var(--${palette[c]})`);stack.append(layer);});
  glass.append(stack);const number=document.createElement('span');number.className='tube-number';number.textContent=String(i+1).padStart(2,'0');
  button.append(glass,number);button.onclick=()=>choose(i);$('board').append(button);
 });
 $('level').textContent=String(state.level).padStart(2,'0');$('moves').textContent=state.moves;$('difficulty').value=state.difficulty;
 $('level-chip').textContent=state.level===1?'첫 번째 숨 고르기':`${state.level}번째 작은 여유`;
 $('undo').disabled=!history.length||busy;const won=solved(state.board);document.querySelector('.game').classList.toggle('won',won);$('next').hidden=!won;$('progress-note').hidden=won;clock();
 if(won)message(`완성! ${state.moves}번의 움직임으로 모든 색을 모았어요.`);
}
function tone(color){if(!sound)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=440+color*80;g.gain.setValueAtTime(.045,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.25);o.connect(g).connect(audio.destination);o.start();o.stop(audio.currentTime+.26);}catch{}}
async function choose(index){
 if(busy||solved(state.board))return;cancelHint();
 if(selected===null){if(!state.board[index].length){message('모래가 담긴 병을 먼저 골라주세요.');return;}selected=index;message('같은 색이 맨 위에 있는 병이나 빈 병을 골라주세요.');render();return;}
 if(selected===index){selected=null;render();message('옮길 병을 고른 다음, 담을 병을 눌러주세요.');return;}
 const from=selected,result=pour(state.board,from,index);
 if(!result){const b=$('board').children[index];b.classList.add('invalid');setTimeout(()=>b.classList.remove('invalid'),350);message('같은 색 위나 빈 병에만 담을 수 있어요. 공간도 확인해보세요.');return;}
 history.push(copy(state.board));selected=null;busy=true;
 if(!active){active=true;timerAnchor=Date.now();}
 const a=$('board').children[from].querySelector('.tube').getBoundingClientRect(),b=$('board').children[index].querySelector('.tube').getBoundingClientRect(),r=document.querySelector('.play-area').getBoundingClientRect();
 const stream=$('stream'),x=a.left+a.width/2,y=a.top+5,dx=b.left+b.width/2-x,dy=b.top+12-y;
 stream.style.cssText=`left:${x-r.left}px;top:${y-r.top}px;width:${Math.hypot(dx,dy)}px;transform:rotate(${Math.atan2(dy,dx)}rad);--color:var(--${palette[result.color]})`;stream.classList.add('active');tone(result.color);
 await new Promise(resolve=>setTimeout(resolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:330));stream.classList.remove('active');
 state.board=result.board;state.moves++;busy=false;
 if(solved(state.board)){state.elapsed=elapsed();active=false;}
 render();save();if(!solved(state.board))message(`${names[result.color]} 모래를 옮겼어요. 다음 병을 골라주세요.`);
}
function start(level,difficulty){if(busy)return;cancelHint();state={level,difficulty,board:generate(level,difficulty).board,moves:0,elapsed:0};active=false;timerAnchor=Date.now();history=[];selected=null;render();save();message('옮길 병을 고른 다음, 담을 병을 눌러주세요.');}
$('undo').onclick=()=>{if(busy||!history.length)return;cancelHint();state.board=history.pop();state.moves--;selected=null;if(!active&&state.moves){active=true;timerAnchor=Date.now();}render();save();message('한 수 되돌렸어요. 천천히 다시 생각해보세요.');};
$('restart').onclick=()=>{if(!busy)$('restart-dialog').showModal();};
$('restart-dialog').addEventListener('close',()=>{if($('restart-dialog').returnValue==='restart')start(state.level,state.difficulty);});
$('difficulty').onchange=e=>{if(busy){e.target.value=state.difficulty;return;}start(1,e.target.value);};
$('next').onclick=()=>start(state.level+1,state.difficulty);
$('hint').onclick=()=>{
 if(busy||solved(state.board))return;cancelHint();selected=null;render();const generation=hintGeneration;
 $('hint').disabled=true;message('모래의 길을 찾고 있어요…');
 try{hintWorker=new Worker(new URL('./hint-worker.js',import.meta.url),{type:'module'});
 hintWorker.onmessage=({data:path})=>{if(generation!==hintGeneration)return;cancelHint();if(path?.length){const [a,b]=path[0];$('board').children[a].classList.add('hinted');$('board').children[b].classList.add('hinted');message(`${a+1}번 병에서 ${b+1}번 병으로 옮겨보세요.`);}else message('이 상태에서 해결 경로를 찾지 못했어요. 되돌리기나 다시 하기를 이용해보세요.');};
 hintWorker.onerror=()=>{cancelHint();message('힌트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');};hintWorker.postMessage(state.board);
 }catch{cancelHint();message('이 브라우저에서는 힌트를 지원하지 않아요.');}
};
function renderSound(){$('sound').classList.toggle('sound-on',sound);$('sound').setAttribute('aria-label',sound?'효과음 끄기':'효과음 켜기');$('sound').title=sound?'효과음 끄기':'효과음 켜기';}
$('sound').onclick=()=>{sound=!sound;renderSound();try{localStorage.setItem('sand-sort-sound',String(sound));}catch{}if(sound)tone(1);};
document.addEventListener('visibilitychange',()=>{if(document.hidden){state.elapsed=elapsed();active=false;save();}else if(state.moves&&!solved(state.board)){timerAnchor=Date.now();active=true;}});
window.addEventListener('pagehide',save);setInterval(()=>{clock();if(active)save();},1000);renderSound();render();save();
