module Move2::MatchEscrow {
    use std::signer;
    use aptos_std::table::{Self, Table};

    struct StakeEvent has drop, store {
        player_id: vector<u8>,
        amount: u64,
    }

    struct NikoKadiEvent has drop, store {
        player_id: vector<u8>,
        amount: u64,
    }

    struct WinnerPayoutEvent has drop, store {
        winner_id: vector<u8>,
        amount: u64,
    }

    struct Escrow has key {
        stakes: Table<vector<u8>, u64>,
        total: u64,
    }

    public entry fun init(account: &signer) {
        move_to(account, Escrow {
            stakes: table::new<vector<u8>, u64>(),
            total: 0,
        });
    }

    public entry fun deposit_stake(account: &signer, player_id: vector<u8>, amount: u64) acquires Escrow {
        let escrow = borrow_global_mut<Escrow>(signer::address_of(account));
        if (table::contains(&escrow.stakes, player_id)) {
            let prev = table::remove(&mut escrow.stakes, player_id);
            table::add(&mut escrow.stakes, player_id, prev + amount);
        } else {
            table::add(&mut escrow.stakes, player_id, amount);
        };
        escrow.total = escrow.total + amount;
    }

    public entry fun declare_niko_kadi(account: &signer, player_id: vector<u8>, amount: u64) acquires Escrow {
        let escrow = borrow_global_mut<Escrow>(signer::address_of(account));
        escrow.total = escrow.total + amount;
    }

    public entry fun settle_match(account: &signer, winner_id: vector<u8>) acquires Escrow {
        let escrow = borrow_global_mut<Escrow>(signer::address_of(account));
        let _payout = escrow.total;
        escrow.total = 0;
    }
}
}
