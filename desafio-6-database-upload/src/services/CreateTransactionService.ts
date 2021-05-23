import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: TransactionDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (Number(total) - value < 0) {
        throw new AppError('Not enough income', 400);
      }
    }

    let categoryExists = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryExists) {
      categoryExists = categoriesRepository.create({ title: category });
      await categoriesRepository.save(categoryExists);
    }
    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: categoryExists.id,
    });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
