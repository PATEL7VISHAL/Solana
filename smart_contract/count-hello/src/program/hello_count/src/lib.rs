use borsh::{BorshSerialize, BorshDeserialize};
// use solana_program::account_info::{AccountInfo, next_account_info};
use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey
};

// #[derive(BorshSerialize, BorshDeserialize, Debug)]
// struct GreetAccount{
//     count: u32, // public private consider ?
// }
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GreetingAccount {
    /// number of greetings
    pub counter: u32,
}

entrypoint!(program_instruction);

fn program_instruction(
    program_id: &Pubkey, //? IDK what's this program_id denotes.
    accounts: &[AccountInfo],
    instruction_data: &[u8]
)-> ProgramResult{

    let mut account_iter = accounts.iter();
    let account = next_account_info(&mut account_iter)?;

    // validate the use.
    
    if account.owner != program_id{
        msg!("Greeted program does not have the correct program ID");
        return Err(ProgramError::IncorrectProgramId);
    }

    msg!("Hello ");
    // let mut pure_data = &mut account.data.borrow_mut()[..]; wight but may be not safe to use as global.
    let mut obj = GreetingAccount::try_from_slice(&account.data.borrow_mut())?; //! need to take the value from the instuction_data.
    obj.counter+=1;

    // let res = obj.serialize(&mut pure_data);
    // let etc = &mut (account.data.borrow_mut()[..]);
    // let etc1 = &mut *account.data.borrow_mut();

    // let res2 = obj.serialize(etc); // move.
    // let res3 = obj.serialize(etc1);

    // let res = obj.serialize(&mut &mut account.data.borrow_mut()[..]);
    let res = obj.serialize(&mut *account.data.borrow_mut()); //* be I prefer this 


    msg!("Value added to the Account :: {}",program_id);
    msg!("Greeted {} time(s)!\n", obj.counter);
    Ok(())
    
}

// Program ID
// BdUbVBs65YKTzFGLahUcuzsKLLqdx2CScbrb2eRna8gm:





































