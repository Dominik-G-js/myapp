<?php

declare(strict_types=1);

namespace App\Core;

use Nette;
use Nette\Application\Routers\RouteList;


final class RouterFactory
{
	use Nette\StaticClass;

	public static function createRouter(): RouteList
	{
		$router = new RouteList;
		$router->addRoute('', 'Home:default');
		$router->addRoute('add-to-cart', 'Product:add');

		$router->addRoute('eshop[/]', 'Product:list');
		
		$router->addRoute('eshop/product/<id \d+>', 'Product:detail');
		
		$router->addRoute('eshop/product/add', 'Product:add');
		$router->addRoute('eshop/product/<action>[/<id>]', 'Product:<action>');
		
		$router->addRoute('eshop/cart/summary', 'Eshop:Cart:summary');
		$router->addRoute('eshop/cart/<action>[/<id>]', 'Eshop:Cart:<action>');
		$router->addRoute('eshop/cart[/]', 'Eshop:Cart:default');
		
		$router->addRoute('eshop/checkout[/]', 'Eshop:Checkout:default');
		$router->addRoute('eshop/checkout/<action>[/<id>]', 'Eshop:Checkout:<action>');
		
		$router->addRoute('eshop/<presenter>/<action>[/<id>]', '<presenter>:<action>');
		
		$router->addRoute('<presenter>/<action>[/<id>]', '<presenter>:<action>');
		return $router;
	}
}
