import {
    Connection,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    Keypair,
    TransactionInstruction,
} from '@solana/web3.js';
// import * as borsh from 'borsh';
import * as path from 'path';
import fs from 'fs';

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
// const ROOT_PATH = path.resolve(__dirname, );
// const program_path = path.resolve(__dirname, "src/program/transaction/target/deploy/transaction-keypair.json");
const program_path = "/home/ak/code/solana/sol_transaction/src/program/transaction/target/deploy/transaction-keypair.json";
const programId = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(program_path, { encoding: 'utf8' })))).publicKey;


function parse_key(file_name: string): Keypair {
    let full_filename = path.resolve(__dirname, '../../users/', file_name);
    let secrete_key = Uint8Array.from(JSON.parse(fs.readFileSync(full_filename, { encoding: 'utf8' })));
    let key: Keypair = Keypair.fromSecretKey(secrete_key);

    return key;
}



function parse_amount(amount: number): Buffer {
    // let arr = Uint32Array.from([amount]); //? actually we can send here maximum u32 value only.
    let buf = Buffer.alloc(4, amount);
    // let len = arr.length
    //? we can use the bytelenthg to find the buffer size.
    return buf;
    //! need to test.
}
const TRANSACTION_SPACE = 4; // byte.
// const payer = parse_key("mayank.json");
async function send_lamports(from: Keypair, to: Keypair, amount: number) {
    console.log("Sending lamports ...");
    let data = parse_amount(amount);
    let ins = new TransactionInstruction({
        keys: [
            { pubkey: from.publicKey, isSigner: true, isWritable: false },
            { pubkey: to.publicKey, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: programId,
        data: data,
    });

    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ins),
        [from], // require realsender address.
    );

}

async function main() {
    const jenny = parse_key('jenny.json');
    // const mayank = parse_key('mayank.json');
    const cj = parse_key('cj.json');

    // console.log("jenny sends 100 lamports to mayand");
    // console.log("jenny :: ", jenny.publicKey.toBase58());
    // console.log("mayank :: ", mayank.publicKey.toBase58());
    // await send_lamports(jenny, mayank, 100);
    
    console.log("cj sends 1 sol lamports to mayand");
    console.log("cj :: ", cj.publicKey.toBase58());
    console.log("jenny :: ", jenny.publicKey.toBase58());
    await send_lamports(cj, jenny, 1000000);

}

main().then(
    () => process.exit(),
    err => {
        console.log(err);
        process.exit(-1);
    }
);

