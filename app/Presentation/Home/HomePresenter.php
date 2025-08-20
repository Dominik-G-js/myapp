<?php

declare(strict_types=1);

namespace App\Presentation\Home;

use Nette;


final class HomePresenter extends Nette\Application\UI\Presenter
{
    public function renderDefault(): void
    {
        $this->template->products = $this->loadProducts();
    }
    
    private function loadProducts(): array
    {
        $productsFile = __DIR__ . '/../../../data/products.php';
        if (file_exists($productsFile)) {
            $products = include $productsFile;
            return array_slice($products, 0, 4);
        }
        return [];
    }
}
