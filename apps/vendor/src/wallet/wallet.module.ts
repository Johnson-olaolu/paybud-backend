import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { Wallet } from './entities/wallet.entity';
import { WalletVba } from './entities/wallet-vba.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction, WalletVba])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
