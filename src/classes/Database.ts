import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import { DateTime } from 'luxon';

export class DataBaseManager {
    private database: GoogleSpreadsheet;
    private currentSheet?: {
        sheet: GoogleSpreadsheetWorksheet,
        acquired: DateTime
    };
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
        this.currentSheet = {
            sheet: this.database.sheetsByTitle[sheetName],
            acquired: DateTime.now()
        }
        this.cacheRows(this.currentSheet.sheet);
        return this.currentSheet;
    }

    public getHeaderKeys() {
        const headers = this.currentSheet?.sheet.headerValues;
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

        // if the path to minutes is undefined then just refetch the rows;
        if ((this.currentSheet?.acquired?.diffNow().minutes ?? 5) > 4) {
            const rows = await this.currentSheet?.sheet.getRows();
            this.loadedRows = rows;
        }

        if (this.loadedRows) {
            return this.loadedRows;
        }

        if (sheet) {
            await this.getSheet(sheet);
            return this.loadedRows;
        }

        // TODO: clean up logic flow
        return await this.currentSheet?.sheet.getRows();
    }

    public async addRow(rowData: { [key: string]: string }) {
        const row = await this.currentSheet?.sheet.addRow(rowData);
        if (row) {
            this.loadedRows?.push(row);
        }
        return row;
    }

}