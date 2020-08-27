import { getCustomRepository, getRepository } from 'typeorm';
import TransactionRepositories from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepositories = getCustomRepository(
      TransactionRepositories,
    );

    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepositories.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance', 400);
    }

    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategory);
    }

    // Verificar se a categoria já existe

    // Se ela existir Buscar o id da que foi retornada

    const transaction = transactionRepositories.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionRepositories.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
