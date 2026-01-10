import { Injectable, OnModuleInit } from '@nestjs/common';
import { Aptos, AptosConfig, Network, Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';

/**
 * Blockchain service for handling escrow and settlements on Movement blockchain.
 * 
 * Integrates with Movement (Aptos-based) testnet for:
 * - Depositing player stakes into MatchEscrow contract
 * - Recording Niko Kadi declarations with micropayments
 * - Settling matches and distributing prizes
 * - Gas sponsorship via relayer account
 */
@Injectable()
export class BlockchainService implements OnModuleInit {
  private aptos: Aptos;
  private relayerAccount: Account | null = null;
  private escrowAddress: string;

  onModuleInit() {
    try {
      // Initialize Aptos client for Movement testnet
      const config = new AptosConfig({
        network: Network.CUSTOM,
        fullnode: process.env.MOVEMENT_RPC_URL || 'https://aptos.testnet.porto.movementlabs.xyz/v1',
      });
      this.aptos = new Aptos(config);

      // Initialize relayer account for gas sponsorship
      const privateKeyHex = process.env.MOVEMENT_PRIVATE_KEY;
      if (!privateKeyHex || privateKeyHex === '0x0000000000000000000000000000000000000000000000000000000000000001') {
        console.warn('[BLOCKCHAIN] ⚠️  No valid private key - running in DEMO MODE');
        console.warn('[BLOCKCHAIN] Set MOVEMENT_PRIVATE_KEY in .env for real transactions');
        this.relayerAccount = null;
      } else {
        const privateKey = new Ed25519PrivateKey(privateKeyHex);
        this.relayerAccount = Account.fromPrivateKey({ privateKey });
        console.log('[BLOCKCHAIN] ✅ Relayer account initialized:', this.relayerAccount.accountAddress.toString());
      }

      // Contract address
      this.escrowAddress = process.env.ESCROW_CONTRACT_ADDRESS || '0x1';
      if (this.escrowAddress === '0x1') {
        console.warn('[BLOCKCHAIN] ⚠️  Using placeholder contract address');
        console.warn('[BLOCKCHAIN] Deploy MatchEscrow.move and set ESCROW_CONTRACT_ADDRESS in .env');
      } else {
        console.log('[BLOCKCHAIN] ✅ Contract address:', this.escrowAddress);
      }

      console.log('[BLOCKCHAIN] ✅ Movement integration initialized');
    } catch (error) {
      console.error('[BLOCKCHAIN] ❌ Initialization failed:', error.message);
      console.warn('[BLOCKCHAIN] Falling back to DEMO MODE');
      this.relayerAccount = null;
    }
  }

  /**
   * Deposit player stake into escrow contract.
   * 
   * @param playerId - Player identifier
   * @param amount - Stake amount in KADI tokens
   * @returns Transaction hash or demo message
   */
  async depositStake(playerId: string, amount: number): Promise<string> {
    console.log(`[BLOCKCHAIN] 💰 Depositing stake - Player: ${playerId}, Amount: ${amount} KADI`);

    if (!this.relayerAccount) {
      console.log('[BLOCKCHAIN] 🎬 DEMO MODE: Would call Move2::deposit_stake(${playerId}, ${amount})');
      return 'demo-tx-deposit-' + Date.now();
    }

    try {
      // Convert playerId to vector<u8> for Move contract
      const playerIdBytes = Array.from(new TextEncoder().encode(playerId));

      // Submit transaction (relayer pays gas)
      const txn = await this.aptos.transaction.build.simple({
        sender: this.relayerAccount.accountAddress,
        data: {
          function: `${this.escrowAddress}::Move2::deposit_stake`,
          functionArguments: [playerIdBytes, amount],
        },
      });

      const committedTxn = await this.aptos.signAndSubmitTransaction({
        signer: this.relayerAccount,
        transaction: txn,
      });

      const executedTxn = await this.aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      console.log('[BLOCKCHAIN] ✅ Stake deposited - TX:', committedTxn.hash);
      return committedTxn.hash;
    } catch (error) {
      console.error('[BLOCKCHAIN] ❌ Deposit failed:', error.message);
      return 'error-' + Date.now();
    }
  }

  /**
   * Settle match and transfer pool to winner.
   * 
   * @param winnerId - Winner player identifier
   * @param amount - Payout amount (after platform fee)
   * @returns Transaction hash or demo message
   */
  async settleMatch(winnerId: string, amount: number): Promise<string> {
    console.log(`[BLOCKCHAIN] 🏆 Settling match - Winner: ${winnerId}, Payout: ${amount} KADI`);

    if (!this.relayerAccount) {
      console.log('[BLOCKCHAIN] 🎬 DEMO MODE: Would call Move2::settle_match(${winnerId})');
      return 'demo-tx-settle-' + Date.now();
    }

    try {
      // Convert winnerId to vector<u8>
      const winnerIdBytes = Array.from(new TextEncoder().encode(winnerId));

      // Submit transaction
      const txn = await this.aptos.transaction.build.simple({
        sender: this.relayerAccount.accountAddress,
        data: {
          function: `${this.escrowAddress}::Move2::settle_match`,
          functionArguments: [winnerIdBytes],
        },
      });

      const committedTxn = await this.aptos.signAndSubmitTransaction({
        signer: this.relayerAccount,
        transaction: txn,
      });

      const executedTxn = await this.aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      console.log('[BLOCKCHAIN] ✅ Match settled - TX:', committedTxn.hash);
      return committedTxn.hash;
    } catch (error) {
      console.error('[BLOCKCHAIN] ❌ Settlement failed:', error.message);
      return 'error-' + Date.now();
    }
  }

  /**
   * Record Niko Kadi declaration on-chain.
   * 
   * @param playerId - Player who declared Niko Kadi
   * @param amount - Micropayment amount (10 KADI)
   * @returns Transaction hash or demo message
   */
  async recordNikoKadi(playerId: string, amount: number): Promise<string> {
    console.log(`[BLOCKCHAIN] 🃏 Recording Niko Kadi - Player: ${playerId}, Amount: ${amount} KADI`);

    if (!this.relayerAccount) {
      console.log('[BLOCKCHAIN] 🎬 DEMO MODE: Would call Move2::declare_niko_kadi(${playerId}, ${amount})');
      return 'demo-tx-niko-' + Date.now();
    }

    try {
      // Convert playerId to vector<u8>
      const playerIdBytes = Array.from(new TextEncoder().encode(playerId));

      // Submit transaction
      const txn = await this.aptos.transaction.build.simple({
        sender: this.relayerAccount.accountAddress,
        data: {
          function: `${this.escrowAddress}::Move2::declare_niko_kadi`,
          functionArguments: [playerIdBytes, amount],
        },
      });

      const committedTxn = await this.aptos.signAndSubmitTransaction({
        signer: this.relayerAccount,
        transaction: txn,
      });

      const executedTxn = await this.aptos.waitForTransaction({
        transactionHash: committedTxn.hash,
      });

      console.log('[BLOCKCHAIN] ✅ Niko Kadi recorded - TX:', committedTxn.hash);
      return committedTxn.hash;
    } catch (error) {
      console.error('[BLOCKCHAIN] ❌ Niko Kadi recording failed:', error.message);
      return 'error-' + Date.now();
    }
  }
}
