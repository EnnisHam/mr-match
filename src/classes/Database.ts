import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';

export class DataBaseManager {
    private database: GoogleSpreadsheet;
    private currentSheet?: GoogleSpreadsheetWorksheet;
    private loadedRows?: GoogleSpreadsheetRow[];

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

    private async cacheRows(sheet: GoogleSpreadsheetWorksheet) {
        const rows = await sheet.getRows();
        this.loadedRows = rows;
    }

    public async getRows(sheet?: string): Promise<GoogleSpreadsheetRow[] | undefined> {
        if (this.loadedRows) {
            return this.loadedRows;
        }

        if (sheet) {
            await this.getSheet(sheet);
            return this.loadedRows;
        }

        return await this.currentSheet?.getRows();
    }

    public async addRow(rowData: { [key: string]: string }) {
        const row = await this.currentSheet?.addRow(rowData);
        if (row) {
            this.loadedRows?.push(row);
        }
        return row;
    }

}