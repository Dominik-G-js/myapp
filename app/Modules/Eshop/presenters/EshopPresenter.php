<?php
declare(strict_types=1);

namespace App\Modules\Eshop\Presenters;

use Nette\Application\UI\Presenter;

final class EshopPresenter extends Presenter
{
    public function renderDefault(): void
    {
        $this->redirect('Product:list');
    }
}


