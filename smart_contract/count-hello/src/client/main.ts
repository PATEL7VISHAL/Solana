import {
    Keypair,
    PublicKey,
    Connection,
    sendAndConfirmTransaction, //? suer for creating the new account.
    SystemProgram,
    Transaction, //? make transaction with your older own account.
    LAMPORTS_PER_SOL,
    TransactionInstruction,
} from '@solana/web3.js';

import fs from 'fs';
// import Borsh from 'borsh'
import * as borsh from 'borsh';

import Path from 'path';

// create the Connection:
// const connection = new Connection("https://api.devnet/solana.com", "confirmed");
let connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Get the program id:
// const PROGRAM_PATH = Path.resolve("/home/ak/code/solana/count-hello/src/program/hello_count/target/deploy/", 'helloworld-keypair.json');
const PROGRAM_PATH = Path.resolve(__dirname, "../program/hello_count/target/deploy/", "helloworld-keypair.json")
const secreatKeyString = fs.readFileSync(PROGRAM_PATH, { encoding: 'utf8' });
const secreatKey = Uint8Array.from(JSON.parse(secreatKeyString));
const program_id = Keypair.fromSecretKey(secreatKey).publicKey;
//! I skip it.
// here is need to chack the program is executable or not.
console.log("Our program_id is : " + program_id.toBase58());

//! other Serializeing stuff.
class GreetingAccount {
    counter = 4;
    constructor(fields: { counter: number } | undefined = undefined) {
        if (fields) {
            this.counter = fields.counter;
        }
    }
}

/**
 * Borsh schema definition for greeting accounts
 */
const GreetingSchema = new Map([
    [GreetingAccount, { kind: 'struct', fields: [['counter', 'u32']] }],
]);

/**
 * The expected size of each greeting account.
 */
const GREETING_SIZE = borsh.serialize(
    GreetingSchema,
    new GreetingAccount(),
).length;


// Craete the player which can to transaction. it's require some sol in order to do transaction.
async function gen_payer_key(): Promise<Keypair> {
    // let key: Keypair = Keypair.generate();
    //! Every time it's create the new Account thant why the new account/address is generated for payer.
    //! which makes this greeting to `1` every time.
    //! other Trick is not working. 

    const PAYER_PATH = Path.resolve(__dirname, "../../payer/", 'key.json');
    const PAYER_KEY_STRING = fs.readFileSync(PAYER_PATH, { encoding: 'utf8' });
    const key_buffer = Uint8Array.from(JSON.parse(PAYER_KEY_STRING));
    const payer_key = Keypair.fromSecretKey(key_buffer);

    // console.log(key.publicKey.toBytes());
    // console.log(Uint8Array.from(key.secretKey));

    let transaction = await connection.requestAirdrop(payer_key.publicKey, LAMPORTS_PER_SOL);

 
    console.log("! payer :" + payer_key.publicKey);
    // let info = await connection.getBalance(key.publicKey);
    // console.log("The balance of "+ key.publicKey.toBase58()+ " is :=> "+ info.toString());

    return payer_key;
}


// let payer = await gen_payer_key(); //? it's not valid way to do this.
async function check_and_get_user_key(payer: Keypair): Promise<PublicKey> {
    let seed = "test12";
    //* it's just testing purpose, may be there  are not need the poublic key of the payer.
    let usekey = await PublicKey.createWithSeed(payer.publicKey, seed, program_id); //? here we are creating the signature which ave access of the program.
    //? it's the account created by the payer for run/executing the program.


    let userInfo = await connection.getAccountInfo(usekey);
    if (userInfo === null) {
        //? if this key is first time generate then it's required to create and allocate some space for this account.

        // let lamports = LAMPORTS_PER_SOL / 70; //it's just guess it need to calculate.
        const lamports = await connection.getMinimumBalanceForRentExemption(
            GREETING_SIZE,
        );
        // console.log("Cost of trancation is may be :"+lamports.toString());

        let transaction = new Transaction().add(
            SystemProgram.createAccountWithSeed({
                basePubkey: payer.publicKey,
                fromPubkey: payer.publicKey,
                lamports: lamports,
                seed: seed,
                newAccountPubkey: usekey,
                programId: program_id, //? it's make the owner the program.
                space: GREETING_SIZE //? it's reqire exate size ?
            })
        );
        let sign = await sendAndConfirmTransaction(connection, transaction, [payer]);
        let result = await connection.confirmTransaction(sign);
    }
    let info = await connection.getBalance(usekey);

    return usekey;
}

async function say_helo(): Promise<PublicKey> {
    let payer = await gen_payer_key(); //? it's not valid way to do this.
    let userkey = await check_and_get_user_key(payer);

    const transaction = new TransactionInstruction({ //? TransactionInstruction, may it's use to executing the program.
        keys: [{ pubkey: userkey, isSigner: false, isWritable: true }],
        programId: program_id,
        data: Buffer.alloc(0)
    });

    // let result = await new Transaction().add(transaction);    
    await sendAndConfirmTransaction(connection, new Transaction().add(transaction), [payer]);
    return userkey;
}


async function report_greet(userpubKey: PublicKey) {
    // let userpubKey = await check_and_get_user_key();
    let user_account_info = await connection.getAccountInfo(userpubKey);

    if (user_account_info === null) {
        console.log("not found the user account");
        throw "Error: not found the account.";
    }

    const greetAccount = borsh.deserialize(
        GreetingSchema,
        GreetingAccount,
        user_account_info.data,
    )

    console.log(`Greeted on Account:  ${userpubKey.toBase58()}`)
    console.log(`There are ${greetAccount.counter} times greet on this account.\n\n`)

}

async function main() {
    let userkey = await say_helo(); // it's need some change are make it's real life use.
    await report_greet(userkey);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);