import { EntityRepository, getRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getRepository(Transaction);
    const transactions = await transactionsRepository.find();

    const income = transactions
      .filter(({ type }) => type === 'income')
      .reduce((sum, { value }) => sum + Number(value), 0);

    const outcome = transactions
      .filter(({ type }) => type === 'outcome')
      .reduce((sum, { value }) => (sum + Number(value)) as number, 0);
    const balance: Balance = { income, outcome, total: income - outcome };
    return balance;
  }
}

export default TransactionsRepository;
