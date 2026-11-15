import {test} from 'node:test';
import assert from 'node:assert/strict';
import {operationalError,balanceFor,budgetTotal,csvRows} from '../src/domain';
test('inventory rejects negative, decimal and empty quantities',()=>{
 for(const quantity of ['-1','1.5','','Infinity','NaN'])assert.ok(operationalError('inventario',{sku:'QA',quantity,minimum:'0'},[]));
 assert.equal(operationalError('inventario',{sku:'QA',quantity:'0',minimum:'0'},[]),'');
});
test('resource reservations reject overlapping times but allow adjacent reservations',()=>{
 const records=[{id:'r1',module:'agenda',title:'QA',created_at:'',details:{date:'2026-11-14',time:'10:00',end_time:'11:00',resource:'room1'}}];
 assert.ok(operationalError('agenda',{date:'2026-11-14',time:'10:30',end_time:'11:30',resource:'room1'},records));
 assert.equal(operationalError('agenda',{date:'2026-11-14',time:'11:00',end_time:'12:00',resource:'room1'},records),'');
 assert.equal(operationalError('agenda',{date:'2026-11-14',time:'10:00',end_time:'11:00',resource:'room1'},records,'r1'),'');
});
test('budget arithmetic keeps cents and matches recorded payments',()=>{
 const b={id:'b',service_id:'s',subtotal_mxn:1000,discount_mxn:100,tax_mxn:144,status:'draft'};
 assert.equal(budgetTotal(b),1044);
 assert.equal(balanceFor(b,[{id:'p',budget_id:'b',amount_mxn:100,method:'efectivo',reference:null}]),944);
});
test('CSV quotes commas/newlines and neutralizes spreadsheet formulas',()=>{
 assert.equal(csvRows([['a,b','line\n"quote"','=1+1']]),'\uFEFF"a,b","line\n""quote""","\'=1+1"');
});
