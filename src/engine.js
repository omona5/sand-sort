export const CAPACITY=4;
export const COLOR_COUNTS={easy:3,normal:4,hard:5,extreme:13};
export const copy=board=>board.map(t=>[...t]);
export const solved=board=>board.every(t=>!t.length||(t.length===CAPACITY&&t.every(c=>c===t[0])));
export function pour(board,from,to){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from===to||!board[from]||!board[to])return null;
 const a=board[from],b=board[to],color=a.at(-1);
 if(!a.length||b.length===CAPACITY||(b.length&&b.at(-1)!==color))return null;
 let count=1;while(count<a.length&&a[a.length-1-count]===color)count++;
 count=Math.min(count,CAPACITY-b.length);const next=copy(board);next[from].splice(-count);next[to].push(...Array(count).fill(color));
 return {board:next,count,color};
}
export function generate(level=1,difficulty='easy'){
 const colors=COLOR_COUNTS[difficulty]??3;
 if(difficulty==='extreme')return generateExtreme(level);
 let seed=level*7591+colors*7919;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const board=Array.from({length:colors+2},(_,i)=>i<colors?Array(4).fill(i):[]);
 const reverse=[];let last=[];
 // Reverse single-grain moves preserve a known forward solution. A move back
 // is legal only if the donor retains the same top color or becomes empty.
 for(let step=0;step<100+Math.min(level,50)*8;step++){
  const options=[];
  for(let a=0;a<board.length;a++)for(let b=0;b<board.length;b++){
   const t=board[a];if(a===b||!t.length||board[b].length===4||(a===last[1]&&b===last[0]))continue;
   if(t.length>1&&t.at(-2)!==t.at(-1))continue;
   options.push([a,b]);
  }
  if(!options.length)break;
  const [a,b]=options[Math.floor(random()*options.length)];board[b].push(board[a].pop());reverse.push([b,a]);last=[a,b];
 }
 if(solved(board))return generate(level+100,difficulty);
 return {board,reverse:reverse.reverse()};
}
const key=b=>b.map(t=>t.join(',')).sort().join('|');
function generateExtreme(level){
 let seed=(level*7591+13*7919)>>>0;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const board=Array.from({length:15},(_,i)=>i<13?Array(4).fill(i):[]),reverse=[];
 let last=[];
 for(let step=0;step<650+Math.min(level,50)*12;step++){
  const options=[];
  for(let a=0;a<15;a++){
   const source=board[a];if(!source.length)continue;
   const color=source.at(-1);let run=1;while(run<source.length&&source.at(-1-run)===color)run++;
   for(let b=0;b<15;b++){
    if(a===b||board[b].length===4||board[b].at(-1)===color||(a===last[1]&&b===last[0]))continue;
    for(let n=1;n<=Math.min(run,4-board[b].length);n++){
     // Undoing this transfer must pour exactly n grains under the normal rules.
     if(n===run&&n!==source.length)continue;
     options.push([a,b,n]);
    }
   }
  }
  if(!options.length)break;
  const [a,b,n]=options[Math.floor(random()*options.length)];board[b].push(...board[a].splice(-n));reverse.push([b,a]);last=[a,b];
 }
 return {board,reverse:reverse.reverse()};
}
// A small binary heap keeps the 15-bottle search bounded without freezing the UI.
class MinHeap{
 data=[];
 push(node){const a=this.data;let i=a.length;a.push(node);while(i){const p=(i-1)>>1;if(a[p].score<=node.score)break;a[i]=a[p];i=p;}a[i]=node;}
 pop(){const a=this.data,top=a[0],end=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&a[c+1].score<a[c].score)c++;if(a[c].score>=end.score)break;a[i]=a[c];i=c;}a[i]=end;}return top;}
}
function disorder(board){let runs=0;const colors=new Set();for(const t of board)for(let i=0;i<t.length;i++){colors.add(t[i]);if(i===0||t[i]!==t[i-1])runs++;}return runs-colors.size;}
function solveLarge(board,limit){
 const queue=new MinHeap(),seen=new Map(),start={b:board,parent:null,move:null,g:0,score:disorder(board)*4};queue.push(start);seen.set(key(board),0);
 for(let visited=0;queue.data.length&&visited<limit;visited++){
  const current=queue.pop();if(current.g!==seen.get(key(current.b)))continue;
  if(solved(current.b)){const path=[];for(let n=current;n.parent;n=n.parent)path.push(n.move);return path.reverse();}
  for(let a=0;a<board.length;a++){
   const source=current.b[a];if(!source.length||source.length===4&&source.every(c=>c===source[0]))continue;
   let usedEmpty=false;
   for(let b=0;b<board.length;b++){
    const target=current.b[b];if(!target.length){if(usedEmpty||source.every(c=>c===source[0]))continue;usedEmpty=true;}
    const result=pour(current.b,a,b);if(!result)continue;
    const k=key(result.board),g=current.g+1;if((seen.get(k)??Infinity)<=g)continue;
    seen.set(k,g);queue.push({b:result.board,parent:current,move:[a,b],g,score:g+disorder(result.board)*4});
   }
  }
  if(seen.size>limit*3)break;
 }
 return null;
}
export function solve(board,limit=60000){
 if(solved(board))return [];
 if(board.length>7)return solveLarge(board,limit);
 const nodes=[{b:board,parent:-1,move:null}],seen=new Set([key(board)]);
 for(let i=0;i<nodes.length&&i<limit;i++){
  const current=nodes[i];
  for(let a=0;a<board.length;a++)for(let b=0;b<board.length;b++){
   if(!current.b[b].length&&current.b[a].every(c=>c===current.b[a][0]))continue;
   const result=pour(current.b,a,b);if(!result)continue;
   const k=key(result.board);if(seen.has(k))continue;seen.add(k);
   const node={b:result.board,parent:i,move:[a,b]};nodes.push(node);
   if(solved(node.b)){const path=[];let n=nodes.length-1;while(nodes[n].parent!==-1){path.push(nodes[n].move);n=nodes[n].parent;}return path.reverse();}
  }
  // Canonical board keys already eliminate interchangeable empty bottles.
  if(nodes.length>limit*3)break;
 }
 return null;
}
export function validSave(s){
 if(!s||!Number.isInteger(s.level)||s.level<1||s.level>100000||!Object.hasOwn(COLOR_COUNTS,s.difficulty)||!Number.isInteger(s.moves)||s.moves<0||!Number.isFinite(s.elapsed)||s.elapsed<0)return false;
 const colors=COLOR_COUNTS[s.difficulty];
 if(!Array.isArray(s.board)||s.board.length!==colors+2)return false;
 const counts=Array(colors).fill(0);
 for(const t of s.board){if(!Array.isArray(t)||t.length>4)return false;for(const c of t){if(!Number.isInteger(c)||c<0||c>=colors)return false;counts[c]++;}}
 return counts.every(n=>n===4);
}
