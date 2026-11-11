export const CAPACITY=4;
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
 const colors={easy:3,normal:4,hard:5}[difficulty]??3;
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
const key=b=>b.map(t=>t.join('')).sort().join('|');
export function solve(board,limit=60000){
 if(solved(board))return [];
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
 if(!s||!Number.isInteger(s.level)||s.level<1||s.level>100000||!['easy','normal','hard'].includes(s.difficulty)||!Number.isInteger(s.moves)||s.moves<0||!Number.isFinite(s.elapsed)||s.elapsed<0)return false;
 const colors={easy:3,normal:4,hard:5}[s.difficulty];
 if(!Array.isArray(s.board)||s.board.length!==colors+2)return false;
 const counts=Array(colors).fill(0);
 for(const t of s.board){if(!Array.isArray(t)||t.length>4)return false;for(const c of t){if(!Number.isInteger(c)||c<0||c>=colors)return false;counts[c]++;}}
 return counts.every(n=>n===4);
}
