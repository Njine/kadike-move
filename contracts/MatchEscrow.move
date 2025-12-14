module Move2 {
    use std::signer;
    use std::event;
    use std::string;
    use std::address;
    use std::vector;
    use std::coin;

    struct StakeEvent has copy, drop, store {
        player_id: vector<u8>,
        amount: u64,
    }

    struct NikoKadiEvent has copy, drop, store {
        player_id: vector<u8>,
        amount: u64,
    }

    struct WinnerPayoutEvent has copy, drop, store {
        winner_id: vector<u8>,
        amount: u64,
    }

    struct Escrow has key {
        stakes: table::Table<vector<u8>, u64>,
        total: u64,
        event_handle_stake: event::EventHandle<StakeEvent>,
        event_handle_niko: event::EventHandle<NikoKadiEvent>,
        event_handle_payout: event::EventHandle<WinnerPayoutEvent>,
    }

    public fun init(account: &signer) {
        move_to(account, Escrow {
            stakes: table::new<vector<u8>, u64>(),
            total: 0,
            event_handle_stake: event::new_event_handle<StakeEvent>(account),
            event_handle_niko: event::new_event_handle<NikoKadiEvent>(account),
            event_handle_payout: event::new_event_handle<WinnerPayoutEvent>(account),
        });
    }

    public fun deposit_stake(account: &signer, player_id: vector<u8>, amount: u64) {
        let escrow = borrow_global_mut<Escrow>(signer::address_of(account));
        let prev = table::remove(&mut escrow.stakes, &player_id).unwrap_or(0);
        table::insert(&mut escrow.stakes, player_id.clone(), prev + amount);
        escrow.total = escrow.total + amount;
        event::emit_event(&mut escrow.event_handle_stake, StakeEvent { player_id, amount });
    }

    public fun declare_niko_kadi(account: &signer, player_id: vector<u8>, amount: u64) {
        let escrow = borrow_global_mut<Escrow>(signer::address_of(account));
        escrow.total = escrow.total + amount;
        event::emit_event(&mut escrow.event_handle_niko, NikoKadiEvent { player_id, amount });
    }

    public fun settle_match(account: &signer, winner_id: vector<u8>) {
        let escrow = borrow_global_mut<Escrow>(signer::address_of(account));
        let payout = escrow.total;
        escrow.total = 0;
        event::emit_event(&mut escrow.event_handle_payout, WinnerPayoutEvent { winner_id, amount: payout });
        // payout logic would go here
    }
}
