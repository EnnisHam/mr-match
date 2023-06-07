import { config } from 'dotenv';
import { DataManager } from './classes/Database';

config();
main();

async function main() {
    const dataManager = new DataManager(process.env.TARGET_SHEET!);
    await dataManager.authenticateAndLoad({
        serviceEmail: process.env.GOOGLE_SERVICE_ACCOUNT!,
        privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY!
    });

    const sheet = dataManager.getSheet('Test');
    console.log(sheet);

    // getRows has a side effect where headerValues aren't populated until
    // the request for rows has been made
    const rows = await sheet.getRows();
    const rowHeaders = dataManager.getHeaderKeys();
    console.log(`row headers ${rowHeaders}`);

    const jsonObjects = rows.map((row) => {
        const jsonOutput: { [key: string]: any} = {}
        rowHeaders?.forEach((header) => {
            jsonOutput[header] = row[header];
        })

        return jsonOutput;
    });

    const jsonStrings = jsonObjects.map((data) => JSON.stringify(data));
    console.log(`rows ${jsonStrings}`);

    console.log('End of script');
}