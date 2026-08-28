<?php

/** @var modx $modx */

/*
 * Всего будет 7 уведомлений. С момента первого и до момента последнего уведомления пройдет 24 часа.
 * Текущие интервалы уведомлений в секундах: 10, 42, 84, 168, 672, 5376, 86016 секунд.
 *
 * https://yookassa.ru/developers/using-api/webhooks
*/

define('MODX_API_MODE', true);
define('MODX_REQP', false);

$path = __DIR__;
while (!file_exists($path . '/index.php') and (strlen($path) > 1)) {
    $path = dirname($path);
}
/** @noinspection PhpIncludeInspection */
require_once $path . '/index.php';
if (!defined('MODX_CORE_PATH')) {
    exit('Core not found');
}

$modx->getService('error', 'error.modError');
$modx->setLogLevel(modX::LOG_LEVEL_ERROR);
$modx->setLogTarget('FILE');

/** @var mspYooKassa $mspYooKassa */
$fqn = $modx->getOption('mspyookassa_class', null, 'mspyookassa.mspYooKassa', true);
$path = $modx->getOption('mspyookassa_core_path', null, $modx->getOption('core_path', null, MODX_CORE_PATH) . 'components/mspyookassa/');
if (!$mspYooKassa = $modx->getService($fqn, '', $path . 'model/', ['core_path' => $path])) {
    exit('mspYooKassa not load');
}

$data = json_decode(trim(file_get_contents('php://input')), true);
if ($mspYooKassa->getOption('payment_show_log', null)) {
    $mspYooKassa->log(['notification', __LINE__, 'data' => $data], true);
}

//if (!$mspYooKassa->checkCallbackIpAddress()) {
//    header('HTTP/1.1 503 Service Unavailable');
//    exit('Wrong client IP');
//}

/** @var msPaymentInterface|mspYooKassaPaymentHandler $handler */
$handler = null;
if ($data and $notification = $mspYooKassa->getNotification($data)) {
    $payment = $notification->getObject();
    $metadata = $payment->getMetadata()->toArray();
    $id = isset($metadata['msorder']) ? (int)$metadata['msorder'] : 0;
    /** @var msOrder $order */
    if ($id and $order = $modx->getObject('msOrder', $id)) {
        $modx->switchContext($order->get('context'));
    }
    /** @var msPayment $payment */
    if ($order and $payment = $order->getOne('Payment') and $payment->loadHandler()) {
        $handler = $payment->handler;
    }
}

if ($handler and method_exists($handler, 'notifyPayment') and $handler->notifyPayment($order, $notification)) {
    header('HTTP/1.1 200 Ok');
    exit('success');
}

header('HTTP/1.1 500 Service Unavailable...');
exit('failure');