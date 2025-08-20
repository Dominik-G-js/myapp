<?php
declare(strict_types=1);

namespace App\Presentation\Eshop;

use Nette\Application\UI\Presenter;

final class CartPresenter extends Presenter
{
    private function loadProducts(): array
    {
        $path = __DIR__ . '/../../../data/products.php';
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

    public function actionRemove(int $id): void
    {
        $section = $this->getSession()->getSection('cart');
        $products = $section->products ?? [];
        unset($products[$id]);
        $section->products = $products;
        $this->flashMessage('Produkt odstraněn z košíku.');
        $this->redirect('default');
    }
}


