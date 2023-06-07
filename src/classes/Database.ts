import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

export class DataManager {
    private database: GoogleSpreadsheet;
    private currentSheet?: GoogleSpreadsheetWorksheet;
    private loadedRows?: GoogleSpreadsheetRow[] | Promise<GoogleSpreadsheetRow[]>;

    constructor(targetSheet: string) {
        this.database = new GoogleSpreadsheet(targetSheet);
    }

    public async authenticateAndLoad(credentials: { serviceEmail: string, privateKey: string }) {
        await this.database.useServiceAccountAuth({
            client_email: credentials.serviceEmail,
            private_key: credentials.privateKey
        });

        await this.database.loadInfo();
        console.log(`Loaded ${this.database.title}`);
    }

    private async cacheRows(sheet: GoogleSpreadsheetWorksheet) {
        const rows = await sheet.getRows();
        this.loadedRows = rows;
    }

    public getSheet(sheetName: string) {
        this.currentSheet = this.database.sheetsByTitle[sheetName];
        this.cacheRows(this.currentSheet);
        return this.currentSheet;
    }

    public getHeaderKeys() {
        const headers = this.currentSheet?.headerValues;
        if (!headers) {
            console.error('headerValues are undefined getRows() needs to be loaded first');
            return undefined;
        }
        return headers;
    }
}