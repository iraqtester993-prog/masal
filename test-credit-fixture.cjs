const M=require('./engine.js');
function seed(){const s=M.seed(),e=new M.Engine(s);e.operations();for(const [from,to,amount]of [['A1','POS1',150000],['A1','POS2',150000],['A2','POS3',150000]])e.fund(from,to,amount,'voucher','fixture-'+to,e.authorizeFunding(from,'تهيئة اختبار الصلاحيات والبيع').id);return s;}
class Engine extends M.Engine{constructor(s=seed(),user='U1'){super(s,user)}}
module.exports={...M,Engine,seed};
