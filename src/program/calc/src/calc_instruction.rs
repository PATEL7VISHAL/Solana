use ::borsh::{BorshDeserialize, BorshSerialize};
use solana_program::msg;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct CalcInstruction {
    pub operation: u32,
    pub operator: u32,
}

impl CalcInstruction {
    pub fn evaluate(instruction: &CalcInstruction, value: &u32) -> u32 {
        let operator = instruction.operator;
        let mut ans = 0;
        match instruction.operation {
            0 => {
                ans = value + operator;
                msg!("{} + {} : {}", value, operator, ans);
            },
            1 => {
                ans = value - operator;
                msg!("{} - {} : {}", value, operator, ans);
            },
            2 => {
                ans = value * operator;
                msg!("{} * {} : {}", value, operator, ans);
            },
            3 => {
                ans = value / operator;
                msg!("{} / {} : {}", value, operator, ans);
            },
            _ => ans = 0 * value,
        };
        return ans;
    }
}
