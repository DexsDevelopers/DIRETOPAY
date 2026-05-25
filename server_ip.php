<?php
// Descobre o IP público de saída do servidor
$ip = @file_get_contents('https://api.ipify.org') 
   ?: @file_get_contents('https://checkip.amazonaws.com')
   ?: $_SERVER['SERVER_ADDR'];
echo '<b>IP público do servidor:</b> ' . htmlspecialchars(trim($ip));
@unlink(__FILE__);
echo '<br><i>Arquivo deletado.</i>';
