<?php
function demo_seed(): array {
  $companies = [
    ['id'=>'asia','name'=>'آسياسيل','subtitle'=>'ابقَ على اتصال','color'=>'#e64538','symbol'=>'A','type'=>'اتصالات','active'=>true],
    ['id'=>'zain','name'=>'زين العراق','subtitle'=>'عالم جميل','color'=>'#25252b','symbol'=>'Z','type'=>'اتصالات','active'=>true],
    ['id'=>'korek','name'=>'كورك','subtitle'=>'أقرب إليك','color'=>'#1688da','symbol'=>'K','type'=>'اتصالات','active'=>true],
    ['id'=>'play','name'=>'PlayStation','subtitle'=>'اللعب بلا حدود','color'=>'#2257c6','symbol'=>'PS','type'=>'ألعاب','active'=>true],
    ['id'=>'steam','name'=>'Steam','subtitle'=>'عالم من الألعاب','color'=>'#293b54','symbol'=>'S','type'=>'ألعاب','active'=>true],
    ['id'=>'apple','name'=>'Apple','subtitle'=>'كل ما تحب','color'=>'#647087','symbol'=>'a','type'=>'تطبيقات','active'=>true]
  ];
  $products=[];
  foreach ([['asia',5000,5250,24],['zain',10000,10500,18],['korek',5000,5200,32],['asia',25000,25800,9],['zain',5000,5250,15],['korek',10000,10400,0],['play',25000,27000,12],['steam',10000,11500,17],['apple',15000,16250,8]] as $i=>$r) $products[]=['id'=>'p'.($i+1),'companyId'=>$r[0],'name'=>in_array($r[0],['play','steam','apple'])?'بطاقة رقمية':'بطاقة شحن','face'=>$r[1],'price'=>$r[2],'cost'=>round($r[2]*.91),'stock'=>$r[3],'description'=>'بطاقة رقمية تجريبية لاستعراض تجربة الشراء. الرموز غير صالحة للاستخدام.','active'=>true,'featured'=>$i<4];
  return ['version'=>1,'companies'=>$companies,'products'=>$products,'orders'=>[],'batches'=>[],'settings'=>['heroTitle'=>'كل بطاقاتك. بمكان واحد.','heroText'=>'اختار اللي تحتاجه، وخلّي الباقي علينا. تجربة شراء سهلة وتسليم بلحظتها.','support'=>'فريق دنارير موجود لمساعدتك. هذه نسخة عرض تجريبية.']];
}
