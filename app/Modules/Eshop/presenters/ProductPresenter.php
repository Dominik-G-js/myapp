<?php

declare(strict_types=1);

namespace App\Modules\Eshop\Presenters;

use Nette\Application\UI\Presenter;

final class ProductPresenter extends Presenter
{
    private function loadProducts(): array
    {
        $path = __DIR__ . '/../../../data/products.php';
        if (!file_exists($path)) {
            return [];
        }
        return require $path;
    }

    public function renderList(): void
    {
        $this->template->products = $this->loadProducts();
    }

    public function renderDetail(int $id): void
    {
        $products = $this->loadProducts();
        foreach ($products as $product) {
            if ((int) $product['id'] === $id) {
                $this->template->product = $product;
                return;
            }
        }
        $this->error('Produkt nenalezen', 404);
    }

    public function actionAdd(int $id): void
    {
        $section = $this->getSession()->getSection('cart');
        $products = $section->products ?? [];
        $products[$id] = ($products[$id] ?? 0) + 1;
        $section->products = $products;
        $this->flashMessage('Produkt přidán do košíku.');
        $this->redirect('Cart:default');
    }
}


