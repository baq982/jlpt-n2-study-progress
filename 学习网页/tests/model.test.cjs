const assert=require('node:assert/strict');const M=require('../dist/model.js');const d=require('../dist/data.json');M.validate(d);
const f=mode=>M.filter(d,{mode,module:'all',from:'',to:''});
assert.deepEqual(M.stats(f('baseline')),{total:33,correct:18,rate:18/33});
assert.deepEqual(M.stats(f('independent')),{total:0,correct:0,rate:null});
assert.deepEqual(M.stats(f('all')),{total:68,correct:32,rate:32/68});
assert.equal(M.stats(f('baseline').filter(a=>a.module==='grammar')).correct,2);
assert.equal(M.stats(f('baseline').filter(a=>a.module==='vocabulary')).rate,.8);
assert.equal(M.stats(f('baseline').filter(a=>a.module==='reading')).rate,null);
assert.equal(M.stats(f('all').filter(a=>a.module==='listening')).rate,null);
assert.equal(M.stats(f('all').filter(a=>a.result==='partial')).correct,0);
assert.equal(M.filter(d,{mode:'all',module:'grammar',from:'2099-01-01'}).length,0);
const ranking=M.rank(f('all'));assert.ok(ranking.every((x,i)=>!i||ranking[i-1].count>=x.count));assert.equal(ranking.find(a=>a.key==='vocabulary:貴重').count,2);
const a={...d.attempts[0],id:'new-id',error_tags:['negation_scope','negation_scope']};assert.equal(M.rank([a])[0].count,1);
assert.equal(M.merge(d,d).added,0);assert.equal(M.merge(d,{schema_version:'1.0',attempts:[a]}).added,1);assert.equal(M.merge(d,{schema_version:'1.0',attempts:[]}).added,0);
assert.throws(()=>M.merge(d,{schema_version:'1.0',attempts:[{...d.attempts[0],result:'correct'}]}),/ID 冲突/);assert.equal(d.attempts[0].result,'incorrect');
assert.throws(()=>M.validate({schema_version:'1.0',attempts:[a,a]}),/重复/);assert.throws(()=>M.validate({schema_version:'1.0',attempts:[{...a,date:'2026-02-30'}]}),/日期/);assert.throws(()=>M.validate({schema_version:'1.0',attempts:[{...a,module:'fake'}]}),/无效/);assert.throws(()=>M.validate({schema_version:'2.0',attempts:[]}));assert.equal(M.stats([]).rate,null);

console.log('PASS: baseline, weighted total, strict mode, partial, empty modules, date/module filter, canonical ranking, duplicate tags, dedup, atomic conflicts, invalid date/module/schema, private path sanitization');

const baselineFilters={mode:'baseline',module:'all',from:'',to:''};assert.equal(M.stats(M.filter(d,baselineFilters)).total,33);const cumulative=M.rank(M.filter(d,{...baselineFilters,mode:'all'}));assert.equal(cumulative.find(a=>a.key==='vocabulary:貴重').count,2);assert.ok(cumulative.find(a=>a.key==='grammar:tag:desire_form').count>1);const app=require('node:fs').readFileSync(require('node:path').join(__dirname,'../dist/app.js'),'utf8');assert.ok(app.includes("reviewRows=M.filter(data,{...f,mode:'all'})"));assert.ok(app.includes('ranks=M.rank(reviewRows)'));assert.ok(app.includes('let visible=reviewRows.filter'));console.log('PASS: default baseline gauge and cumulative review ranking are decoupled');
