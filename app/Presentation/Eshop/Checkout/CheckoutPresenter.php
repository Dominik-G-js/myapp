<?php
declare(strict_types=1);

namespace App\Presentation\Eshop\Checkout;

use Nette\Application\UI\Presenter;

final class CheckoutPresenter extends Presenter
{
    public function renderDefault(): void
    {
        $section = $this->getSession()->getSection('cart');
        $cart = $section->products ?? [];

        $products = [];
        if ($cart) {
            $all = require __DIR__ . '/../../../../data/products.php';
            foreach ($all as $p) {
                $id = (int) $p['id'];
                if (isset($cart[$id]) && $cart[$id] > 0) {
                    $products[] = ['product' => $p, 'qty' => $cart[$id]];
                }
            }
        }

        $this->template->items = $products;

        // If form submitted, process order
        if ($this->getHttpRequest()->isMethod('post')) {
            $req = $this->getHttpRequest();
            $name = (string) ($req->getPost('name') ?? '');
            $address = (string) ($req->getPost('address') ?? '');
            $shipping = (string) ($req->getPost('shipping') ?? '');
            $payment = (string) ($req->getPost('payment') ?? '');

            if ($name === '' || $address === '') {
                $this->flashMessage('Vyplňte prosím jméno a adresu.', 'error');
                $this->redirect('this');
            }

            // mock order creation
            $orderId = (int) time();
            $order = [
                'id' => $orderId,
                'name' => $name,
                'address' => $address,
                'shipping' => $shipping,
                'payment' => $payment,
                'items' => $products,
            ];

            // store last order in session for confirmation page
            $this->getSession()->getSection('orders')->last = $order;

            // clear cart
            $this->getSession()->getSection('cart')->products = [];

            $this->flashMessage('Objednávka vytvořena (demo). Děkujeme!');
            $this->redirect('confirm');
        }
    }

    public function renderConfirm(): void
    {
        $order = $this->getSession()->getSection('orders')->last ?? null;
        if (!$order) {
            $this->redirect('default');
        }
        $this->template->order = $order;
    }
}


