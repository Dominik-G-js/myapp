<?php
declare(strict_types=1);

namespace App\Presentation\Eshop\Cart;

use Nette\Application\UI\Presenter;

final class CartPresenter extends Presenter
{
    private function loadProducts(): array
    {
        $path = __DIR__ . '/../../../../data/products.php';
        if (!file_exists($path)) {
            return [];
        }
        return require $path;
    }

    public function renderDefault(): void
    {
        $section = $this->getSession()->getSection('cart');
        $cart = $section->products ?? [];

        $products = $this->loadProducts();
        $items = [];
        foreach ($products as $product) {
            $id = (int) $product['id'];
            if (isset($cart[$id]) && $cart[$id] > 0) {
                $items[] = ['product' => $product, 'qty' => $cart[$id]];
            }
        }
        $this->template->items = $items;
    }

    public function actionRemove(?int $id = null): void
    {
        // try to get id from POST data first, then from URL parameter
        $id = $id ?? $this->getRequest()->getPost('id') ?? $this->getParameter('id');
        $id = $id !== null ? (int) $id : null;

        $section = $this->getSession()->getSection('cart');
        $products = $section->products ?? [];

        if ($id === null) {
            if ($this->isAjax()) {
                $this->sendJson(['success' => false, 'message' => 'Missing id']);
            }
            $this->flashMessage('Chybný požadavek: chybí id.', 'error');
            $this->redirect('default');
            return;
        }

        if (isset($products[$id])) {
            unset($products[$id]);
            $section->products = $products;
        }

        // respond with JSON for AJAX
        if ($this->isAjax()) {
            // build summary
            $all = $this->loadProducts();
            $items = [];
            $total = 0;
            foreach ($all as $p) {
                $pid = (int) $p['id'];
                if (isset($products[$pid]) && $products[$pid] > 0) {
                    $qty = $products[$pid];
                    $sum = $p['price'] * $qty;
                    $items[] = ['id' => $pid, 'name' => $p['name'], 'price' => $p['price'], 'qty' => $qty, 'sum' => $sum];
                    $total += $sum;
                }
            }
            $count = array_sum($products);
            $this->sendJson(['success' => true, 'count' => $count, 'total' => $total, 'items' => $items]);
            return;
        }

        $this->flashMessage('Produkt odstraněn z košíku.');
        $this->redirect('default');
    }

    public function actionSummary(): void
    {
        $section = $this->getSession()->getSection('cart');
        $cart = $section->products ?? [];

        $products = $this->loadProducts();
        $items = [];
        $total = 0;
        foreach ($products as $product) {
            $id = (int) $product['id'];
            if (isset($cart[$id]) && $cart[$id] > 0) {
                $qty = $cart[$id];
                $sum = $product['price'] * $qty;
                $items[] = ['id' => $id, 'name' => $product['name'], 'price' => $product['price'], 'qty' => $qty, 'sum' => $sum];
                $total += $sum;
            }
        }

        $this->sendJson(['items' => $items, 'total' => $total]);
    }
}


