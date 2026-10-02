<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');
ini_set('display_errors','0');
session_set_cookie_params(['httponly'=>true,'samesite'=>'Strict','secure'=>(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off'),'path'=>rtrim(dirname($_SERVER['SCRIPT_NAME']),'/').'/']);session_start();
require __DIR__.'/seed.php';
function output($data,int $status=200): never {http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function fail(string $message,int $status=422): never {output(['error'=>$message],$status);}
function text_value($value,int $limit=200): string {$text=trim((string)$value);if(strlen($text)>$limit*4)fail('النص أطول من الحد المسموح');return $text;}
function amount($value): int {if(!is_numeric($value)||$value<0||$value>100000000||floor((float)$value)!=(float)$value)fail('أدخل مبلغًا صحيحًا');return (int)$value;}
function find_index(array $items,string $id): int {foreach($items as $i=>$item)if($item['id']===$id)return $i;fail('السجل غير موجود',404);}
function public_order(array $order): array {unset($order['cost'],$order['customer'],$order['requestId']);return $order;}
function image_value($value): string {$v=(string)$value;if($v!==''&&!preg_match('/^media\/[a-f0-9]{32}\.(png|jpg|webp)$/',$v))fail('الصورة غير صالحة');return $v;}
function link_value($value): string {$v=text_value($value,1000);if($v==='')return '';if(!filter_var($v,FILTER_VALIDATE_URL)||!in_array(strtolower((string)parse_url($v,PHP_URL_SCHEME)),['http','https'],true)||parse_url($v,PHP_URL_USER)!==null||parse_url($v,PHP_URL_PASS)!==null)fail('أدخل رابطًا يبدأ بـ https:// أو http://');return $v;}
function slide_value(array $slide): array {$title=text_value($slide['title']??'',100);$image=image_value($slide['image']??'');$description=text_value($slide['description']??'',300);if($title===''&&$image===''&&$description==='')fail('أضف عنوانًا أو صورة للإعلان');$id=text_value($slide['id']??'s-'.bin2hex(random_bytes(6)),80);if(!preg_match('/^[a-zA-Z0-9-]{1,80}$/',$id))fail('معرف الإعلان غير صالح');return ['id'=>$id,'title'=>$title,'description'=>$description,'image'=>$image,'link'=>link_value($slide['link']??''),'active'=>(bool)($slide['active']??true)];}
function product_metadata(array $body): array {
  $cities=['بغداد','البصرة','نينوى','أربيل','السليمانية','دهوك','حلبجة','كركوك','ديالى','الأنبار','صلاح الدين','بابل','كربلاء','النجف','واسط','ميسان','ذي قار','المثنى','القادسية'];$allowed=$body['allowedCities']??[];if(!is_array($allowed)||array_diff($allowed,$cities))fail('المحافظات غير صالحة');
  $policy=[];foreach(['pin','expiry','serial','cvc','reference'] as $key){$v=(string)($body['fieldPolicy'][$key]??(in_array($key,['pin','expiry'],true)?'required':'unused'));if(!in_array($v,['required','unused'],true))fail('حالة حقل البطاقة غير صالحة');$policy[$key]=in_array($key,['pin','expiry'],true)?'required':$v;}
  $extra=$body['extraFields']??[];if(!is_array($extra)||count($extra)>10)fail('الحد الأعلى 10 حقول إضافية');$fields=[];foreach($extra as $f){$label=text_value($f['label']??'',60);if($label==='')fail('أدخل اسم الحقل الإضافي');$fields[]=['label'=>$label,'required'=>(bool)($f['required']??false)];}
  return ['allowedCities'=>array_values(array_unique($allowed)),'fieldPolicy'=>$policy,'extraFields'=>$fields];
}
$action=$_GET['action']??'catalog';$post=$_SERVER['REQUEST_METHOD']==='POST';
if($post){
  if(!str_contains($_SERVER['CONTENT_TYPE']??'','application/json'))fail('صيغة الطلب غير مقبولة',415);
  if((int)($_SERVER['CONTENT_LENGTH']??0)>3000000)fail('الطلب أكبر من الحد المسموح',413);
  $origin=$_SERVER['HTTP_ORIGIN']??'';if($origin!==''&&parse_url($origin,PHP_URL_HOST)!==explode(':',$_SERVER['HTTP_HOST'])[0])fail('مصدر الطلب غير مقبول',403);
  $body=json_decode(file_get_contents('php://input'),true);if(!is_array($body))fail('بيانات الطلب غير صالحة');
}else{$body=[];}
$writeActions=['login','logout','company-save','product-save','product-toggle','import','settings-save','appearance-save','slide-save','purchase','image-upload','support-send','support-reply','support-status'];
if(in_array($action,$writeActions,true)&&!$post)fail('طريقة الطلب غير مسموحة',405);
// This published code is a DEMO access code, never a production credential.
if($action==='login'){
  if(($_SESSION['attempts']??0)>=8&&time()-($_SESSION['lastAttempt']??0)<300)fail('انتظر خمس دقائق ثم حاول مجددًا',429);
  $_SESSION['lastAttempt']=time();
  if(($body['username']??'')!=='admin'||!hash_equals(hash('sha256','123456789'),hash('sha256',(string)($body['password']??'')))){$_SESSION['attempts']=($_SESSION['attempts']??0)+1;fail('اسم المستخدم أو كلمة المرور غير صحيحة',401);}
  session_regenerate_id(true);$_SESSION['admin']=true;$_SESSION['attempts']=0;output(['ok'=>true]);
}
if($action==='logout'){$_SESSION=[];session_destroy();output(['ok'=>true]);}
if($action==='session')output(['admin'=>(bool)($_SESSION['admin']??false)]);
$adminActions=['admin-state','company-save','product-save','product-toggle','import','settings-save','appearance-save','slide-save','image-upload','support-reply','support-status'];
if(in_array($action,$adminActions,true)&&empty($_SESSION['admin']))fail('سجل الدخول إلى لوحة التحكم',401);
$customer=$_SERVER['HTTP_X_DEMO_CUSTOMER']??'';
if(in_array($action,['purchase','my-orders','support-send','my-support'],true)&&!preg_match('/^[a-zA-Z0-9-]{20,80}$/',$customer))fail('معرّف التجربة غير صالح',400);
session_write_close();
if($action==='image-upload'){
  $encoded=(string)($body['image']??'');if(!preg_match('/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+\/=]+)$/',$encoded,$m))fail('اختر صورة PNG أو JPG أو WebP');
  $bytes=base64_decode($m[2],true);if($bytes===false||strlen($bytes)>2000000)fail('حجم الصورة يجب أن لا يتجاوز 2 MB');
  $info=@getimagesizefromstring($bytes);$ext=[IMAGETYPE_PNG=>'png',IMAGETYPE_JPEG=>'jpg',IMAGETYPE_WEBP=>'webp'];if(!$info||!isset($ext[$info[2]])||$info[0]>4096||$info[1]>4096)fail('الصورة غير صالحة أو أبعادها أكبر من 4096');
  $folder=dirname(__DIR__).'/media';if(!is_dir($folder)&&!mkdir($folder,0755,true))fail('تعذر رفع الصورة',500);
  $path='media/'.bin2hex(random_bytes(16)).'.'.$ext[$info[2]];if(file_put_contents(dirname(__DIR__).'/'.$path,$bytes)===false)fail('تعذر حفظ الصورة',500);output(['image'=>$path]);
}
$directory=getenv('DANANEER_DATA_DIR')?:dirname(__DIR__,3).'/dananeer-demo-data';
if(!is_dir($directory)&&!mkdir($directory,0700,true)&&!is_dir($directory))fail('تعذر تهيئة بيانات التجربة',500);
$handle=fopen($directory.'/state.json','c+');if(!$handle||!flock($handle,LOCK_EX))fail('تعذر قراءة بيانات المتجر',503);
function unlock_write($handle,array $state,bool $changed):void{
  if($changed){$state['version']++;$json=json_encode($state,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);rewind($handle);ftruncate($handle,0);if(fwrite($handle,$json)!==strlen($json))throw new RuntimeException('save');fflush($handle);}
  flock($handle,LOCK_UN);fclose($handle);
}
try{
  $raw=stream_get_contents($handle);$state=$raw!==''?json_decode($raw,true,512,JSON_THROW_ON_ERROR):demo_seed();$changed=$raw==='';$result=['ok'=>true];
  $state['tickets']=$state['tickets']??[];
  foreach($state['settings']['slides']??[] as $i=>$slide){if(empty($slide['id']))$state['settings']['slides'][$i]['id']='slide-'.($i+1);$state['settings']['slides'][$i]['active']=$slide['active']??true;$state['settings']['slides'][$i]['description']=$slide['description']??'';$state['settings']['slides'][$i]['link']=$slide['link']??'';}
  switch($action){
    case 'catalog':
      $companies=array_values(array_filter($state['companies'],fn($c)=>$c['active']));$ids=array_column($companies,'id');
      foreach($companies as &$c)unset($c['supplier'],$c['connection']);unset($c);
      $products=array_values(array_filter($state['products'],fn($p)=>$p['active']&&in_array($p['companyId'],$ids,true)));
      foreach($products as &$product)unset($product['cost']);unset($product);
      $result=['version'=>$state['version'],'companies'=>$companies,'products'=>$products,'settings'=>$state['settings']];break;
    case 'admin-state':$result=$state;break;
    case 'company-save':
      $name=text_value($body['name']??'',60);if($name==='')fail('أدخل اسم الشركة');
      $color=(string)($body['color']??'#6446dc');if(!preg_match('/^#[a-fA-F0-9]{6}$/',$color))fail('اللون غير صالح');
      $id=(string)($body['id']??'');$index=$id!==''?find_index($state['companies'],$id):count($state['companies']);
      foreach($state['companies'] as $c)if($c['name']===$name&&$c['id']!==$id)fail('اسم الشركة موجود مسبقًا');
      $state['companies'][$index]=['id'=>$id!==''?$id:'c-'.bin2hex(random_bytes(6)),'name'=>$name,'subtitle'=>text_value($body['subtitle']??'',100),'supplier'=>text_value($body['supplier']??'',80),'connection'=>text_value($body['connection']??'مخزون',40),'logo'=>image_value($body['logo']??''),'color'=>$color,'symbol'=>text_value($body['symbol']??'D',4),'type'=>text_value($body['type']??'اتصالات',30),'active'=>(bool)($body['active']??true)];$changed=true;break;
    case 'product-save':
      $companyId=(string)($body['companyId']??'');find_index($state['companies'],$companyId);$name=text_value($body['name']??'',80);if($name==='')fail('أدخل اسم الفئة');
      $id=(string)($body['id']??'');$index=$id!==''?find_index($state['products'],$id):count($state['products']);$price=amount($body['price']??0);$face=amount($body['face']??0);if($price<1||$face<1)fail('القيمة وسعر البيع يجب أن يكونا أكبر من صفر');
      $metadata=product_metadata($body);$min=amount($body['min']??0);if($price<$min)fail('سعر البيع أقل من الحد المسموح');$currency=(string)($body['currency']??'IQD');if(!in_array($currency,['IQD','USD','EUR'],true))fail('العملة غير صالحة');
      $state['products'][$index]=['id'=>$id!==''?$id:'p-'.bin2hex(random_bytes(6)),'companyId'=>$companyId,'name'=>$name,'face'=>$face,'price'=>$price,'cost'=>amount($body['cost']??0),'stock'=>$id!==''?$state['products'][$index]['stock']:0,'description'=>text_value($body['description']??'',600),'image'=>image_value($body['image']??''),'kind'=>text_value($body['kind']??'بطاقة شحن',40),'currency'=>$currency,'min'=>$min,'dailyQty'=>amount($body['dailyQty']??0),'dailyAmount'=>amount($body['dailyAmount']??0),'sort'=>amount($body['sort']??0),'receiptWidth'=>in_array((int)($body['receiptWidth']??80),[58,80],true)?(int)($body['receiptWidth']??80):80,'receiptLanguage'=>text_value($body['receiptLanguage']??'العربية',30),'receiptHeader'=>text_value($body['receiptHeader']??'',200),'receiptFooter'=>text_value($body['receiptFooter']??'',200),'active'=>(bool)($body['active']??true),'featured'=>(bool)($body['featured']??false)]+$metadata;$changed=true;break;
    case 'product-toggle':$index=find_index($state['products'],(string)($body['id']??''));$state['products'][$index]['active']=!$state['products'][$index]['active'];$changed=true;break;
    case 'import':
      $uploads=$body['lines']??[$body];if(!is_array($uploads)||!count($uploads)||count($uploads)>30)fail('أضف من 1 إلى 30 ملفًا');$checked=[];$allCodes=[];$companyIds=[];
      foreach($uploads as $upload){$index=find_index($state['products'],(string)($upload['productId']??''));$lines=preg_split('/\r?\n/',trim((string)($upload['codes']??'')));$lines=array_values(array_filter(array_map('trim',$lines),fn($v)=>$v!==''));if(!count($lines))fail('يوجد ملف بلا بطاقات');foreach($lines as $line)if(!preg_match('/^DEMO-[A-Z0-9-]{3,80}$/i',$line))fail('استخدم رموزًا وهمية تبدأ بـ DEMO- فقط');$allCodes=array_merge($allCodes,$lines);$companyIds[]=$state['products'][$index]['companyId'];$checked[]=['index'=>$index,'codes'=>$lines,'cost'=>amount($upload['unitCost']??$state['products'][$index]['cost']),'filename'=>text_value($upload['filename']??'',150)];}
      if(count($allCodes)>5000)fail('الحد الأعلى 5000 بطاقة للطلبية');if(count(array_unique($allCodes))!==count($allCodes))fail('توجد رموز مكررة بين ملفات الطلبية');foreach($state['batches'] as $b)if(array_intersect($allCodes,$b['codes']))fail('يوجد رمز سبق رفعه');
      if(isset($body['lines'])&&count(array_unique($companyIds))!==1)fail('اختر فئات من شركة واحدة للطلبية');if(isset($body['categoryCount'])&&amount($body['categoryCount'])!==count(array_unique(array_column($uploads,'productId'))))fail('عدد الفئات لا يطابق ملفات الطلبية');
      $orderId='PO-'.strtoupper(bin2hex(random_bytes(5)));foreach($checked as $file){$index=$file['index'];$state['products'][$index]['stock']+=count($file['codes']);$state['batches'][]=['id'=>'B-'.bin2hex(random_bytes(5)),'orderId'=>$orderId,'productId'=>$state['products'][$index]['id'],'count'=>count($file['codes']),'codes'=>$file['codes'],'date'=>gmdate('c'),'supplier'=>text_value($body['supplier']??'مجهز تجريبي',80),'source'=>text_value($body['source']??'',80),'city'=>text_value($body['city']??'',30),'reference'=>text_value($body['reference']??'',80),'notes'=>text_value($body['notes']??'',500),'unitCost'=>$file['cost'],'filename'=>$file['filename']];}$changed=true;$result=['id'=>$orderId];break;
    case 'appearance-save':
      $appearance=(string)($body['appearanceStyle']??'');if(!in_array($appearance,['G','H','J','K','L','M'],true))fail('اختر نمطًا صالحًا');$state['settings']['appearanceStyle']=$appearance;$changed=true;$result=['appearanceStyle'=>$appearance];break;
    case 'settings-save':
      $settings=$state['settings'];if(array_key_exists('referenceHero',$body)){if(!is_bool($body['referenceHero']))fail('إعداد الإعلان غير صالح');$settings['referenceHero']=$body['referenceHero'];}foreach(['heroTitle','heroText','support'] as $field)if(isset($body[$field]))$settings[$field]=text_value($body[$field],300);
      if(isset($body['slides'])){if(!is_array($body['slides'])||count($body['slides'])>10)fail('الحد الأعلى 10 إعلانات');$slides=array_map('slide_value',$body['slides']);if(count(array_unique(array_column($slides,'id')))!==count($slides))fail('معرف الإعلان مكرر');$settings['slides']=$slides;}
      if(isset($body['sections'])){if(!is_array($body['sections'])||count($body['sections'])>10)fail('الحد الأعلى 10 أقسام');$sections=[];$sectionIds=[];foreach($body['sections'] as $section){$id=text_value($section['id']??'',80);if(!preg_match('/^[a-zA-Z0-9-]{1,80}$/',$id)||in_array($id,$sectionIds,true))fail('معرّف القسم غير صالح');$sectionIds[]=$id;$title=text_value($section['title']??'',80);if($title==='')fail('أدخل عنوان القسم');$selection=(string)($section['selection']??'featured');if(!in_array($selection,['featured','all','company','manual'],true))fail('اختيار القسم غير صالح');$companyId=(string)($section['companyId']??'');if($selection==='company')find_index($state['companies'],$companyId);$productIds=$section['productIds']??[];if(!is_array($productIds)||count($productIds)>200)fail('فئات القسم غير صالحة');foreach($productIds as $pid)find_index($state['products'],(string)$pid);$sections[]=['id'=>$id,'title'=>$title,'selection'=>$selection,'companyId'=>$companyId,'productIds'=>array_values(array_unique($productIds)),'active'=>(bool)($section['active']??true)];}$settings['sections']=$sections;}
      $state['settings']=$settings;$changed=true;break;
    case 'slide-save':$slide=slide_value($body);$state['settings']['slides']=$state['settings']['slides']??[];$index=null;foreach($state['settings']['slides'] as $i=>$existing)if($existing['id']===$slide['id'])$index=$i;if($index===null){if(count($state['settings']['slides'])>=10)fail('الحد الأعلى 10 إعلانات');$state['settings']['slides'][]=$slide;}else $state['settings']['slides'][$index]=$slide;$changed=true;$result=['slide'=>$slide];break;
    case 'my-support':$result=['tickets'=>array_values(array_filter(array_reverse($state['tickets']),fn($t)=>$t['customer']===$customer))];foreach($result['tickets'] as &$ticket)unset($ticket['customer']);unset($ticket);break;
    case 'support-send':
      $message=text_value($body['message']??'',1500);if($message==='')fail('اكتب الرسالة');
      $sent=0;foreach($state['tickets'] as $ticket)if($ticket['customer']===$customer)foreach($ticket['messages'] as $m)if($m['sender']==='customer'&&strtotime($m['date'])>time()-3600)$sent++;if($sent>=30)fail('وصلت للحد المسموح. حاول لاحقًا',429);
      $id=(string)($body['id']??'');if($id!==''){$i=find_index($state['tickets'],$id);if($state['tickets'][$i]['customer']!==$customer)fail('المحادثة غير موجودة',404);if($state['tickets'][$i]['status']==='closed')fail('المحادثة مغلقة');}
      else{$subject=text_value($body['subject']??'',100);if($subject==='')fail('اكتب عنوان الرسالة');$i=count($state['tickets']);$state['tickets'][]=['id'=>'T-'.strtoupper(bin2hex(random_bytes(5))),'customer'=>$customer,'subject'=>$subject,'date'=>gmdate('c'),'status'=>'open','messages'=>[]];}
      $t=&$state['tickets'][$i];$last=end($t['messages']);if($last&&$last['sender']==='customer'&&strtotime($last['date'])>time()-5)fail('انتظر قليلًا قبل إرسال رسالة أخرى',429);
      if(count($t['messages'])>=100)fail('أنشئ محادثة جديدة');$t['messages'][]=['sender'=>'customer','text'=>$message,'date'=>gmdate('c')];$t['status']='open';$changed=true;$result=['id'=>$t['id']];unset($t);break;
    case 'support-reply':
      $i=find_index($state['tickets'],(string)($body['id']??''));$message=text_value($body['message']??'',1500);if($message==='')fail('اكتب الرد');if(count($state['tickets'][$i]['messages'])>=100)fail('المحادثة ممتلئة');$state['tickets'][$i]['messages'][]=['sender'=>'support','text'=>$message,'date'=>gmdate('c')];$state['tickets'][$i]['status']='replied';$changed=true;break;
    case 'support-status':$i=find_index($state['tickets'],(string)($body['id']??''));$status=(string)($body['status']??'');if(!in_array($status,['closed','open'],true))fail('الحالة غير صالحة');$state['tickets'][$i]['status']=$status;$changed=true;break;
    case 'my-orders':$result=['orders'=>array_map('public_order',array_values(array_filter(array_reverse($state['orders']),fn($o)=>$o['customer']===$customer)))];break;
    case 'purchase':
      $request=(string)($body['requestId']??'');if(!preg_match('/^[a-zA-Z0-9-]{20,80}$/',$request))fail('معرّف الطلب غير صالح');
      foreach($state['orders'] as $order)if($order['customer']===$customer&&$order['requestId']===$request){$result=['order'=>public_order($order)];break 2;}
      $index=find_index($state['products'],(string)($body['productId']??''));$product=$state['products'][$index];$company=$state['companies'][find_index($state['companies'],$product['companyId'])];if(!$product['active']||!$company['active'])fail('الفئة غير متاحة');
      $quantity=amount($body['quantity']??1);if($quantity<1||$quantity>10||$quantity>$product['stock'])fail('الكمية المطلوبة غير متوفرة');
      $city=text_value($body['city']??'',30);if(!empty($product['allowedCities'])&&!in_array($city,$product['allowedCities'],true))fail('اختر محافظة مسموحة لهذه الفئة');
      $day=(new DateTimeImmutable('now',new DateTimeZone('Asia/Baghdad')))->format('Y-m-d');$daily=array_filter($state['orders'],fn($o)=>$o['customer']===$customer&&$o['productId']===$product['id']&&(new DateTimeImmutable($o['date']))->setTimezone(new DateTimeZone('Asia/Baghdad'))->format('Y-m-d')===$day);if(($product['dailyQty']??0)>0&&array_sum(array_column($daily,'quantity'))+$quantity>$product['dailyQty'])fail('تجاوزت حد الكمية اليومي لهذه الفئة');if(($product['dailyAmount']??0)>0&&array_sum(array_column($daily,'total'))+$quantity*$product['price']>$product['dailyAmount'])fail('تجاوزت الحد المالي اليومي لهذه الفئة');
      if(amount($body['expectedPrice']??0)!==$product['price'])fail('تم تحديث السعر. أغلق النافذة وحدّث المتجر ثم حاول مجددًا',409);
      if(count(array_filter($state['orders'],fn($o)=>$o['customer']===$customer&&strtotime($o['date'])>time()-60))>=12)fail('انتظر قليلًا قبل إنشاء طلب جديد',429);
      $codes=[];for($i=0;$i<$quantity;$i++)$codes[]='DEMO-'.strtoupper(bin2hex(random_bytes(6)));
      $order=['id'=>'DN-'.strtoupper(bin2hex(random_bytes(5))),'requestId'=>$request,'customer'=>$customer,'productId'=>$product['id'],'company'=>$company['name'],'name'=>$product['name'],'face'=>$product['face'],'currency'=>$product['currency']??'IQD','quantity'=>$quantity,'total'=>$quantity*$product['price'],'cost'=>$quantity*$product['cost'],'date'=>gmdate('c'),'codes'=>$codes,'status'=>'delivered'];
      $state['products'][$index]['stock']-=$quantity;$state['orders'][]=$order;$changed=true;$result=['order'=>public_order($order)];break;
    default:fail('الخدمة غير موجودة',404);
  }
  unlock_write($handle,$state,$changed);output($result);
}catch(Throwable $error){if(is_resource($handle)){flock($handle,LOCK_UN);fclose($handle);}error_log('Dananeer demo: '.$error->getMessage());fail('تعذر إكمال العملية. حاول مرة أخرى.',500);}


