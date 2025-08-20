<?php
declare(strict_types=1);

namespace App\Presentation\Eshop;

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

    public function renderDetail(?int $id = null): void
    {
        $id = $id ?? $this->getParameter('id');
        $id = $id !== null ? (int) $id : null;
        
        if ($id === null || $id <= 0) {
            $this->flashMessage('Chybný požadavek: chybí id produktu.', 'error');
            $this->redirect('list');
            return;
        }
        
        $products = $this->loadProducts();
        if (isset($products[$id])) {
            $this->template->product = $products[$id];
            return;
        }
        
        $this->flashMessage('Produkt nenalezen.', 'error');
        $this->redirect('list');
    }

    public function actionAdd(?int $id = null): void
    {
        $id = $id ?? $this->getRequest()->getPost('id') ?? $this->getParameter('id');
        $id = $id !== null ? (int) $id : null;
        
        if ($id === null || $id <= 0) {
            if ($this->isAjax()) {
                $this->sendJson(['success' => false, 'message' => 'Missing id']);
            }
            $this->flashMessage('Chybný požadavek: chybí id.', 'error');
            $this->redirect('list');
            return;
        }

        $section = $this->getSession()->getSection('cart');
        $products = $section->products ?? [];
        $products[$id] = ($products[$id] ?? 0) + 1;
        $section->products = $products;

        if ($this->isAjax()) {
            $count = array_sum($products);
            $this->sendJson(['success' => true, 'count' => $count]);
            return;
        }

        $this->flashMessage('Produkt přidán do košíku.');
        $this->redirect('Cart:default');
    }
}


