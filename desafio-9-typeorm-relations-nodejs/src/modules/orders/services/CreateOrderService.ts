import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Customer not found.', 400);
    }

    const productsFromDb = await this.productsRepository.findAllById(products);
    const productsToCreateOrder: {
      product_id: string;
      price: number;
      quantity: number;
    }[] = [];

    const productsQuantityUpdate: IUpdateProductsQuantityDTO[] = products.map(
      product => {
        const productDb = productsFromDb.find(item => product.id === item.id);

        if (!productDb) {
          throw new AppError('Invalid product');
        }
        if (productDb.quantity - product.quantity < 0) {
          throw new AppError('Insufficient amount of product');
        }
        productsToCreateOrder.push({
          product_id: productDb.id,
          price: productDb.price,
          quantity: product.quantity,
        });
        return {
          id: productDb.id,
          quantity: productDb.quantity - product.quantity,
        } as IUpdateProductsQuantityDTO;
      },
    );

    await this.productsRepository.updateQuantity(productsQuantityUpdate);

    const order = await this.ordersRepository.create({
      customer,
      products: productsToCreateOrder,
    } as ICreateOrderDTO);

    return order;
  }
}

export default CreateOrderService;
