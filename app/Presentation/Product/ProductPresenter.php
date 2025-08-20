<?php
declare(strict_types=1);

namespace App\Presentation\Product;

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

    public function renderList(?int $page = null, ?string $q = null): void
    {
        $page = $page ?? (int) $this->getParameter('page');
        $page = $page && $page > 0 ? $page : 1;
        $q = $q ?? $this->getParameter('q') ?? '';

        $products = $this->loadProducts();
        if ($q !== '') {
            $products = array_values(array_filter($products, function ($p) use ($q) {
                return stripos((string) $p['name'], (string) $q) !== false
                    || stripos((string) $p['description'], (string) $q) !== false;
            }));
        }

        $total = count($products);
        $pageSize = 6; // items per page
        $pages = max(1, (int) ceil($total / $pageSize));
        if ($page > $pages) {
            $page = $pages;
        }
        $offset = ($page - 1) * $pageSize;
        $products = array_slice($products, $offset, $pageSize);

        $this->template->products = $products;
        $this->template->page = $page;
        $this->template->pages = $pages;
        $this->template->q = $q;
    }

    public function renderDetail(?int $id = null): void
    {
        $id = $id ?? $this->getParameter('id');
        $id = $id !== null ? (int) $id : null;
        if ($id === null || $id <= 0) {
            $this->flashMessage('Chybný požadavek: chybí id produktu.', 'error');
            $this->redirectUrl('/eshop/product/list');
            return;
        }

        $products = $this->loadProducts();
        foreach ($products as $product) {
            if ((int) $product['id'] === $id) {
                $this->template->product = $product;
                return;
            }
        }
        $this->error('Produkt nenalezen', 404);
    }

    public function actionAdd(?int $id = null): void
    {
        $id = $id ?? $this->getParameter('id');
        $id = $id !== null ? (int) $id : null;
        if ($id === null || $id <= 0) {
            $this->flashMessage('Chybný požadavek: chybí id produktu.', 'error');
            $this->redirectUrl('/eshop/product/list');
            return;
        }

        $qty = (int) max(1, $this->getParameter('qty') ?? 1);
        $section = $this->getSession()->getSection('cart');
        $products = $section->products ?? [];
        $products[$id] = ($products[$id] ?? 0) + $qty;
        $section->products = $products;
        $this->flashMessage('Produkt přidán do košíku.');

        $count = array_sum($section->products);
        if ($this->isAjax()) {
            $this->sendJson(['success' => true, 'count' => $count]);
        }

        $path = $this->getHttpRequest()->getUrl()->getPath();
        $this->redirectUrl($path ?: '/');
    }
}


