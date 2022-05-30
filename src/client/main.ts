import * as util from './util';

// console.log("Hello");
// console.log(util.PROGRAM_PATH);
async function main() {
    let operation: number;
    let operating_value: number;
    let options = 0;

    ///? TODO:
    // while (options < 5){
        // console.log("Enter the opration value");
        // console.log("1. add");
        // console.log("2. subtract");
        // console.log("3. multiply");
        // console.log("4. divide");
        // console.log("5. exit")
        // operation = input();

        // console.log("\nEnter the oprating value : ");
            // ...
    // }


    //! Multiple functoin calls not working. (IDK why ?)
    await util.calc(4, 100); //? invalid operatoin causes `0` (0* operation_value)
    // await util.calc(0, 100);
    // await util.calc(1, 3);
}

main().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    }
);
