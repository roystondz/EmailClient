import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "@/types";
import axios from "axios";

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async startSync() {
        // Sync
        try {
            const response = await axios.post<SyncResponse>('https://api.aurinko.io/v1/email/sync', {}, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: {
                    daysWith: 2,
                    bodyType: 'html',
                }
            });

            console.log("Sync response:", response.status, response.data);
            return response.data;
        } catch (error) {
            console.error("Error starting sync:", error);
            throw error; // Ensure you rethrow the error to handle it in the main sync process
        }
    }

    async getUpdatedEmails({ deltaToken, nextPageToken }: { deltaToken?: string, nextPageToken?: string }) {
        try {
            const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                },
                params: {
                    deltaToken: deltaToken,
                    nextPageToken: nextPageToken,
                }
            });

            console.log("Updated emails response:", response.status, response.data);
            return response.data;
        } catch (error) {
            console.error("Error getting updated emails:", error);
            throw error;
        }
    }

    async performInitialSync() {
        // Sync
        try {
            let syncResponse = await this.startSync();
            while (!syncResponse.ready) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                syncResponse = await this.startSync();
            }

            let storedDeltaToken: string = syncResponse.syncUpdatedToken;
            let updatedResponse = await this.getUpdatedEmails({ deltaToken: storedDeltaToken });

            if (!updatedResponse.nextDeltaToken) {
                storedDeltaToken = updatedResponse.nextDeltaToken;
            }

            let allEmails: EmailMessage[] = updatedResponse.records;

            // Fetch all pages
            while (updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails({ nextPageToken: updatedResponse.nextPageToken });
                allEmails = allEmails.concat(updatedResponse.records);
                if (updatedResponse.nextDeltaToken) {
                    storedDeltaToken = updatedResponse.nextDeltaToken;
                }
            }

            return {
                allEmails,
                storedDeltaToken,
            };
        } catch (e) {
            console.error("Error in performInitialSync:", e);
            throw new Error("Sync failed");
        }
    }
}
