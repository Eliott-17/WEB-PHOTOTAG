<?php

require_once($_SERVER['DOCUMENT_ROOT'].'/core/easypdodev.php');

$structureversion=1;

$_SESSION["USER"] = hash('sha256', "eliott.trotebas@gmail.com" . "salt_to_generate");
$_SESSION["DB"] = 'sqlite:'.$_SERVER['DOCUMENT_ROOT'].'/multimedia/'.$_SESSION["USER"].'.'.$structureversion.'.db';

$EasyPDO = new EasyPDO($_SESSION['DB']);

$EasyPDO->setDebug();

echo "TEST1: UPDATE table SET column1 = :set_column1 WHERE column2 = :condition;<br>";
$EasyPDO->addFields('column1',123);	
$EasyPDO->addConditionalData('condition',123);	
echo print_r($EasyPDO->update('table', 'column2 = :condition'),true);

echo "<br><br>";
echo "TEST2: UPDATE table SET column1 = :set_column1 WHERE column2 = :condition1 AND column3 = :condition2;<br>";
$EasyPDO->addFields('column1',123);	
$EasyPDO->addConditionalData('condition1',123);
$EasyPDO->addConditionalData('condition2',123);	
echo print_r($EasyPDO->update('table', 'column2 = :condition1 AND column3 = :condition2'),true);

echo "<br><br>";
echo "TEST3: UPDATE table SET column1 = :set_column1 WHERE column2 = :condition AND id IN (:in_0, :in_1, :in_2);<br>";
$EasyPDO->addFields('column1',123);	
$EasyPDO->addConditionalData('condition',123);
echo print_r($EasyPDO->update('table', 'column2 = :condition AND id IN', [123,122,123]),true);

echo "<br><br>";
echo "TEST4: UPDATE table SET column1 = :set_column1 WHERE (column2 = :condition1 AND column3 = :condition2) AND id IN (:in_0, :in_1, :in_2);<br>";
$EasyPDO->addFields('column1',123);	
$EasyPDO->addConditionalData('condition1',123);
$EasyPDO->addConditionalData('condition2',123);	
echo print_r($EasyPDO->update('table', '(column2 = :condition1 AND column3 = :condition2) AND id IN', [123,122,123]),true);

echo "<br><br>";
echo "TEST5: UPDATE table SET column1 = :set_column1 WHERE id IN (:in_0, :in_1, :in_2);<br>";
$EasyPDO->addFields('column1',123);		
echo print_r($EasyPDO->update('table', 'id IN', [123,122,123]),true);	

echo "<br><br>";
echo "TEST6: SELECT a,b,c FROM table WHERE column = :value;<br>";
$EasyPDO->addFields('a');	
$EasyPDO->addFields('b');
$EasyPDO->addFields('c');
$EasyPDO->addConditionalData('value',123);
echo print_r($EasyPDO->select('table', 'column = :value', []),true);

echo "<br><br>";
echo "TEST7: SELECT d,e,f FROM table WHERE column1 = :value1 AND column2 = :value2;<br>";
$EasyPDO->addFields('d');	
$EasyPDO->addFields('e');
$EasyPDO->addFields('f');
$EasyPDO->addConditionalData('value1',123);
$EasyPDO->addConditionalData('value2',123);
echo print_r($EasyPDO->select('table', 'column1 = :value1 AND column2 = :value2', []),true);

echo "<br><br>";
echo "TEST8: SELECT g,h,i FROM table WHERE column = :value AND id IN (:in_0, :in_1, :in_2);<br>";
$EasyPDO->addFields('g');	
$EasyPDO->addFields('h');
$EasyPDO->addFields('i');
$EasyPDO->addConditionalData('value',123);
echo print_r($EasyPDO->select('table', 'column = :value AND id IN', [123,123,123]),true);


echo "<br><br>";
echo "TEST9: SELECT j,k,l FROM table WHERE (column1 = :value1 AND column2 = :value2) AND id IN (:in_0, :in_1, :in_2);<br>";
$EasyPDO->addFields('j');	
$EasyPDO->addFields('k');
$EasyPDO->addFields('l');
$EasyPDO->addConditionalData('value1',123);
$EasyPDO->addConditionalData('value2',123);
echo print_r($EasyPDO->select('table', '(column1 = :value1 AND column2 = :value2) AND id IN', [123,123,123]),true);

echo "<br><br>";
echo "TEST10: SELECT * FROM table WHERE id IN (:in_0, :in_1, :in_2);<br>";
$EasyPDO->addFields('*',true);	
echo print_r($EasyPDO->select('table', 'id IN', [123,123,123]),true);

echo "<br><br>";
echo "TEST11:DELETE FROM table WHERE column = :value;<br>";
$EasyPDO->addConditionalData('value',123);
echo print_r($EasyPDO->supress('table', 'column = :value'),true);

echo "<br><br>";
echo "TEST12:DELETE FROM table WHERE column1 = :value1 AND column2 = :value2;<br>";
$EasyPDO->addConditionalData('value1',123);
$EasyPDO->addConditionalData('value2',123);
echo print_r($EasyPDO->supress('table', 'column1 = :value1 AND column2 = :value2'),true);

echo "<br><br>";
echo "TEST13:DELETE FROM table WHERE column = :value AND id IN (:in_0, :in_1, :in_2);<br>";
$EasyPDO->addConditionalData('value',123);

echo print_r($EasyPDO->supress('table', 'column = :value AND id IN', [123,123,123]),true);

echo "<br><br>";
echo "TEST14:DELETE FROM table WHERE (column1 = :value1 AND column2 = :value2) AND id IN (:in_0, :in_1, :in_2);<br>";
$EasyPDO->addConditionalData('value1',123);
$EasyPDO->addConditionalData('value2',123);
echo print_r($EasyPDO->supress('table', '(column1 = :value1 AND column2 = :value2) AND id IN', [123,123,123]),true);

echo "<br><br>";
echo "TEST15:DELETE FROM table WHERE id IN (:in_0, :in_1, :in_2);<br>";
echo print_r($EasyPDO->supress('table', 'id IN', [123,123,123]),true);


?>