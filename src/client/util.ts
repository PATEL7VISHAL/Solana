import {
    Connection,
    PublicKey,
    Transaction,
    Keypair,
    LAMPORTS_PER_SOL,
    SystemProgram,
    sendAndConfirmTransaction,
    TransactionInstruction,
} from '@solana/web3.js';
import fs from 'fs';
import * as borsh from 'borsh'
import path from 'path';
import * as BufferLayout from '@solana/buffer-layout';
import { Buffer } from 'buffer';


const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const ROOT_DIR = path.resolve(__dirname, '../../');

// getting program id:
const PROGRAM_PATH = path.resolve(ROOT_DIR, 'src/program/calc/target/deploy/', 'calc-keypair.json');
const program_secreatString = JSON.parse(fs.readFileSync(PROGRAM_PATH, { encoding: 'utf8' }));
const program_keypair = Keypair.fromSecretKey(Uint8Array.from(program_secreatString));
export const program_id = program_keypair.publicKey;

// getting payer keypair
const PAYER_PATH = path.resolve(ROOT_DIR, "payer/", "key.json");
const payer_secreatekey = JSON.parse(fs.readFileSync(PAYER_PATH, { encoding: 'utf8' }));
const payer = Keypair.fromSecretKey(Uint8Array.from(payer_secreatekey));

//? Serializeing and Deserializing stuff..
// class for conveted struct to class for ts.
class Calculator {
    value = 0;
    constructor(fields: { value: number } | undefined = undefined) {
        if (fields) {
            this.value = fields.value;
        }
    }
}

const CalculatorScheme = new Map([
    [Calculator, { kind: 'struct', fields: [['value', 'u32']] }],
]);

const ACCOUNT_SPACE = borsh.serialize(CalculatorScheme, new Calculator()).length;
const ACCOUNT_COST = LAMPORTS_PER_SOL / 2; //! NEED TO CHANGE. (it's just assumption of higer value.)


async function addreass_gen(seed: string): Promise<PublicKey> {
    // await get_payer(); //? but it's set.
    let address_key = await PublicKey.createWithSeed(payer.publicKey, seed, program_id);
    let result = await connection.getAccountInfo(address_key);

    // if the address is not created then we need to create it.
    if (result === null) {
        //? just pre
        let signature = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
        await connection.confirmTransaction(signature);
        
        
        let transaction = new Transaction().add(
            SystemProgram.createAccountWithSeed({
                basePubkey: payer.publicKey,
                fromPubkey: payer.publicKey,
                lamports: ACCOUNT_COST, //! need  for change.
                seed: seed,
                space: ACCOUNT_SPACE,
                newAccountPubkey: address_key,
                programId: program_id,
            })
        );
        let sing = await sendAndConfirmTransaction(connection, transaction, [payer]);
        await connection.confirmTransaction(sing);
    }

    return address_key;
}

async function write_data(data: Buffer, address_key: PublicKey) {
    let transaction_instruction = new TransactionInstruction({
        keys: [
            { isSigner: false, isWritable: true, pubkey: address_key }, // it's denote account detail. may be denote the owner of the data which denotes the  
        ], programId: program_id, data: data //? not sure about the address_key, as program_id
    });

    let transaction = new Transaction().add(transaction_instruction);
    await sendAndConfirmTransaction(connection, transaction, [payer]);

}

async function gen_calc_instruction(operation: number, operating_value: number): Promise<Buffer> {
    const bufferLayout: BufferLayout.Structure<any> = BufferLayout.struct([
        BufferLayout.u32('operation'),
        BufferLayout.u32('operator')
    ]);

    const buffer = Buffer.alloc(bufferLayout.span);
    bufferLayout.encode({
        operation: operation,
        operator: operating_value,
    }, buffer);

    return buffer;
}

async function show_account_data(user: PublicKey) {
    let account_info = await connection.getAccountInfo(user);
    if (account_info === null) {
        console.log("Sorry The data for this account not found  !");
        throw Error("Account not found");
    }

    let data = account_info.data;
    let obj = borsh.deserialize(CalculatorScheme, Calculator, data);
    console.log("Ans is : " + obj.value.toString());
}

export async function calc(operation: number, operating_value: number) {

    let address = await addreass_gen("test");
    await write_data(
        await gen_calc_instruction(operation, operating_value),
        address,
    )
    await show_account_data(address);

    /// multiple opration can be performed.
    // await write_profile(
    //     await gen_calc_instruction(0,  operating_value),
    //     address,
    // )
    // await show_profile(address);

    // await write_profile(
    //     await gen_calc_instruction(2,  operating_value),
    //     address,
    // )
    // await show_profile(address);
}