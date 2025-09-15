import { Injectable } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { PaystackService } from '../services/paystack/paystack.service';
import { WalletVba } from './entities/wallet-vba.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletVba)
    private readonly walletVbaRepository: Repository<WalletVba>,
    private readonly dataSource: DataSource,
    private readonly paystackService: PaystackService,
  ) {}
  async create(createWalletDto: CreateWalletDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Create wallet
      const vbaData = await this.paystackService.createVBAAccount({
        customerId: createWalletDto.paystackCustomerCode,
      });
      const wallet = this.walletRepository.create({});
      const savedWallet = await queryRunner.manager.save(wallet);
      const walletVba = this.walletVbaRepository.create({
        accountName: vbaData.data.account_name,
        accountNumber: vbaData.data.account_number,
        bankName: vbaData.data.bank.name,
        bankCode: '100039', // Paystack code for Titan Bank,
        currency: vbaData.data.currency,
        vbaId: vbaData.data.id,
        wallet: savedWallet,
      });
      await queryRunner.manager.save(walletVba);
      await queryRunner.commitTransaction();
      return savedWallet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all wallet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wallet`;
  }

  update(id: number, updateWalletDto: UpdateWalletDto) {
    return `This action updates a #${id} wallet`;
  }

  remove(id: number) {
    return `This action removes a #${id} wallet`;
  }
}
