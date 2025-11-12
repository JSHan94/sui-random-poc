module random_poc::random_poc;

use sui::event;
use sui::random::{Random};
use sui::random::new_generator;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance::{Self, Balance};

const ENotActiveLottery: u64 = 1;
const EInvalidSlot: u64 = 2;
const EInsufficientPayment: u64 = 3;
const ENotCreator: u64 = 4;
const ENotWinner: u64 = 5;
const ENoWinner: u64 = 6;
const SLOT_COUNT: u64 = 9;
const LOTTERY_PRIZE: u64 = 100_000_000; // 0.1 SUI in MIST (1 SUI = 1,000,000,000 MIST)
const FEE: u64 = 15_000_000; // 0.015 SUI in MIST

public struct Lottery has key {
  id: UID,
  creator: address,
  slots: vector<bool>,
  winner: option::Option<address>,
  winning_slot: u64,
  prize: Balance<SUI>,
  remaining_fee: Balance<SUI>
}

public struct LotteryCreatedEvent has copy, drop, store {
  lottery_id: ID,
  creator: address,
  slot_count: u64,
  prize: u64
}

public struct PickedEvent has copy, drop, store {
  lottery_id: ID,
  slot_index: u64,
  won: bool,
  random_number: u64,
}

public fun create_lottery(payment: Coin<SUI>, ctx: &mut tx_context::TxContext) {
  // Verify payment
  assert!(coin::value(&payment) == LOTTERY_PRIZE, EInsufficientPayment);

  let creator = tx_context::sender(ctx);
  let lottery = Lottery {
    id: sui::object::new(ctx),
    creator,
    slots: make_empty_vec(SLOT_COUNT),
    winner: option::none(),
    winning_slot: 0,
    prize: coin::into_balance(payment),
    remaining_fee: balance::zero()
  };

  event::emit(LotteryCreatedEvent {
    lottery_id: object::id(&lottery),
    creator,
    slot_count: SLOT_COUNT,
    prize: LOTTERY_PRIZE
  });

  transfer::share_object(lottery);
}

fun fill(v: &mut vector<bool>, n: u64) {
    if (n == 0) return;
    vector::push_back(v, false);
    fill(v, n - 1);
}

fun make_empty_vec(n: u64): vector<bool> {
    let mut v = vector::empty<bool>();
    fill(&mut v, n);
    v
}

fun count_unpicked_slots(slots: &vector<bool>): u64 {
    let mut count = 0;
    let mut i = 0;
    let len = vector::length(slots);
    while (i < len) {
        if (*vector::borrow(slots, i) == false) {
            count = count + 1;
        };
        i = i + 1;
    };
    count
}

entry fun pick_slot(slot_index: u64, lottery:&mut Lottery, r: &Random, payment: Coin<SUI>, ctx: &mut tx_context::TxContext):u64 {
  assert!(option::is_none(&lottery.winner), ENotActiveLottery);
  assert!(lottery.slots[slot_index] == false, EInvalidSlot);
  assert!(coin::value(&payment) == FEE, EInsufficientPayment);

  // Collect the fee
  balance::join(&mut lottery.remaining_fee, coin::into_balance(payment));

  let slot = vector::borrow_mut(&mut lottery.slots, slot_index);
  * slot = true;

  // Count remaining unpicked slots
  let remaining_slots = count_unpicked_slots(&lottery.slots);

  // Generate random number and determine if won
  let random_number: u64;
  let won: bool;

  // If this is the last slot, winner is guaranteed
  if (remaining_slots == 0) {
    won = true;
    random_number = 0; // No random number needed for guaranteed win
  } else {
    let winning_number = 10000 / lottery.slots.length();
    let mut generator = new_generator(r, ctx);
    random_number = generator.generate_u64_in_range(0,10000);
    won = random_number < winning_number;
  };

  if (won) {
    lottery.winner = option::some(tx_context::sender(ctx));
    lottery.winning_slot = slot_index;
  };

  event::emit(PickedEvent {
    lottery_id: object::id(lottery),
    slot_index,
    won,
    random_number,
  });

  random_number
}

public fun collect_fee(lottery: &mut Lottery, ctx: &mut tx_context::TxContext) {
  // Only creator can collect fees
  assert!(tx_context::sender(ctx) == lottery.creator, ENotCreator);

  let fee_amount = balance::value(&lottery.remaining_fee);
  if (fee_amount > 0) {
    let fee_coin = coin::from_balance(balance::split(&mut lottery.remaining_fee, fee_amount), ctx);
    transfer::public_transfer(fee_coin, lottery.creator);
  };
}

public fun collect_prize(lottery: &mut Lottery, ctx: &mut tx_context::TxContext) {
  // Must have a winner
  assert!(option::is_some(&lottery.winner), ENoWinner);

  // Only winner can collect prize
  let winner_addr = *option::borrow(&lottery.winner);
  assert!(tx_context::sender(ctx) == winner_addr, ENotWinner);

  let prize_amount = balance::value(&lottery.prize);
  if (prize_amount > 0) {
    let prize_coin = coin::from_balance(balance::split(&mut lottery.prize, prize_amount), ctx);
    transfer::public_transfer(prize_coin, winner_addr);
  };
}

// Public accessor functions for testing
public fun is_active(lottery: &Lottery): bool {
  option::is_none(&lottery.winner)
}

public fun get_winner(lottery: &Lottery): option::Option<address> {
  lottery.winner
}

public fun get_slot(lottery: &Lottery, index: u64): bool {
  lottery.slots[index]
}

public fun get_slots_length(lottery: &Lottery): u64 {
  lottery.slots.length()
}

public fun get_winning_slot(lottery: &Lottery): u64 {
  lottery.winning_slot
}

public fun slot_count(): u64 {
  SLOT_COUNT
}

public fun get_creator(lottery: &Lottery): address {
  lottery.creator
}

public fun get_prize(lottery: &Lottery): u64 {
  balance::value(&lottery.prize)
}

public fun get_remaining_fee(lottery: &Lottery): u64 {
  balance::value(&lottery.remaining_fee)
}
