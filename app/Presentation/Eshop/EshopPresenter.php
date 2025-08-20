<?php
declare(strict_types=1);

namespace App\Presentation\Eshop;

use Nette\Application\UI\Presenter;

final class EshopPresenter extends Presenter
{
    public function renderDefault(): void
    {
        $this->redirectUrl('/eshop/product/list');
    }
}


