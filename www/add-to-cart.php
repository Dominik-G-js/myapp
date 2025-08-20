<?php
// Simple add-to-cart fallback endpoint (standalone, outside Nette)
session_start();

$id = isset($_POST['id']) ? (int) $_POST['id'] : (isset($_REQUEST['id']) ? (int) $_REQUEST['id'] : null);
$qty = isset($_POST['qty']) ? max(1, (int) $_POST['qty']) : (isset($_REQUEST['qty']) ? max(1, (int) $_REQUEST['qty']) : 1);

if ($id === null || $id <= 0) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'Missing id']);
    exit;
}

$cart = &$_SESSION['cart']['products'];
if (!is_array($cart)) $cart = [];
$cart[$id] = ($cart[$id] ?? 0) + $qty;

$count = array_sum($cart);
header('Content-Type: application/json');
echo json_encode(['success' => true, 'count' => $count]);


