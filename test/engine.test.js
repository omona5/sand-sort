import test from 'node:test';import assert from 'node:assert/strict';
import {generate,pour,solved,solve,validSave} from '../src/engine.js';
test('pour enforces color, capacity, whole top group, and immutability',()=>{
 const b=[[0,1,1],[1,1,1],[],[2]];assert.equal(pour(b,0,3),null);assert.equal(pour(b,0,0),null);
 const r=pour(b,0,1);assert.deepEqual(r.board,[[0,1],[1,1,1,1],[],[2]]);assert.equal(b[0].length,3);
 assert.deepEqual(pour(b,0,2).board,[[0],[1,1,1],[1,1],[2]]);
});
test('generated levels conserve all sand and have solutions',()=>{
 for(const difficulty of ['easy','normal','hard','extreme'])for(let level=1;level<=15;level++){
  const {board}=generate(level,difficulty);assert.equal(solved(board),false);
  assert.ok(validSave({board,level,difficulty,moves:0,elapsed:0}));
  const path=solve(board);assert.ok(path,`${difficulty} level ${level} must be solvable`);
  let current=board;for(const [a,b]of path){const move=pour(current,a,b);assert.ok(move);current=move.board;}assert.ok(solved(current));
 }
});
test('extreme has fifteen bottles, thirteen colors, and a legal reverse solution',()=>{
 for(let level=1;level<=15;level++){
  const {board,reverse}=generate(level,'extreme');assert.equal(board.length,15);
  assert.equal(new Set(board.flat()).size,13);assert.equal(board.flat().length,52);
  for(let color=0;color<13;color++)assert.equal(board.flat().filter(c=>c===color).length,4);
  let current=board;for(const [a,b]of reverse){const result=pour(current,a,b);assert.ok(result);current=result.board;}assert.ok(solved(current));
  assert.deepEqual(generate(level,'extreme').board,board);
 }
});
test('save validation rejects corrupt and mismatched data',()=>{
 assert.equal(validSave(null),false);assert.equal(validSave({board:[[9]],level:1,difficulty:'easy',moves:0,elapsed:0}),false);
 const save={board:generate().board,level:1,difficulty:'easy',moves:0,elapsed:0};assert.ok(validSave(save));assert.equal(validSave({...save,moves:-1}),false);assert.equal(validSave({...save,difficulty:'hard'}),false);
});
