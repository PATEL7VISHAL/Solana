use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

mod calc_instruction;
use calc_instruction::CalcInstruction;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Calculator {
    pub value: u32,
}

entrypoint!(program_instruction);

fn program_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account = next_account_info(&mut accounts.iter())?;

    if program_id != account.owner {
        msg!("Sorry you are unable to access this account.");
        return Err(ProgramError::IncorrectProgramId);
    }

    let data = &mut *account.data.borrow_mut();
    // let account = Calculator::(&mut *data.borrow_mut());
    let mut calc: Calculator = BorshDeserialize::try_from_slice(data)?;

    let instruction: CalcInstruction = BorshDeserialize::try_from_slice(instruction_data)?;
    calc.value = CalcInstruction::evaluate(&instruction, &calc.value);

    // Writing the data.
    BorshSerialize::serialize(&calc, data)?;

    Ok(())
}
// FLSGF4oWxLJcaMRCHHQFjp2BPdy8GAiTry5m44tNgMv2