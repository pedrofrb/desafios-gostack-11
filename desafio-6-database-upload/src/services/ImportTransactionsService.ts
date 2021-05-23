import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';
import uploadConfig from '../config/upload';

interface Request {
  csvFilePath: string;
}

type LineTuple = [title: string,
  type:'income'|'outcome',
  value:number,
  category:string,]
class ImportTransactionsService {
  async execute({ csvFilePath }: Request): Promise<Transaction[]> {
    const completeFilePath = path.join(uploadConfig.directory, csvFilePath);
    const readCSVStream = fs.createReadStream(completeFilePath);
    const createTransactionService = new CreateTransactionService();

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines = Array<LineTuple>();
    const transactions = Array<Transaction>();

    parseCSV.on('data', async line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

  for(const line of lines){
    const [title, type, value, category] = line;
    const transaction = await createTransactionService.execute({
      title,
      type,
      value,
      category,
    });
    transactions.push(transaction);
  }

    return transactions;
  }
}

export default ImportTransactionsService;
