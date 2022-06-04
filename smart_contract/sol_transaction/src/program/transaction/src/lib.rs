use solana_program::{program::invoke, system_instruction};

use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        account_info::{next_account_info, AccountInfo},
        entrypoint,
        entrypoint::ProgramResult,
        msg,
        program_error::ProgramError,
        pubkey::Pubkey,
    },
};

entrypoint!(transaction_instruction);

fn transaction_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let mut account_iter = accounts.iter();
    let from = next_account_info(&mut account_iter)?;
    let to = next_account_info(&mut account_iter)?;

    // if program_id != from.owner {
    //     msg!("Account not match");
    //     return Err(ProgramError::IncorrectProgramId);
    // } //? not needed.

    // let lamports = instruction_data.read_u32::<BinEnding>().unwarp();
    let lamports = u32::try_from_slice(instruction_data)?; // it thing here it's require the `u64` buid the instruction data size is `4 byte`
                                                      // so here use the u32.
                                                      // Serialize/Deserialize mistake.

    msg!("Sending the {}s lamports", lamports);

    invoke(
        &system_instruction::transfer(from.key, to.key, lamports as u64),
        &[from.clone(), to.clone()],
    );

    msg!("Transaction successfully");

    Ok(())
}

//

