// Copyright Epic Games, Inc. All Rights Reserved.

import { Logger } from '../Logger/Logger';

/**
 * Utility function for populate file information from byte buffers.
 */
export class FileUtil {
    /**
     * Processes a files extension when received over data channel
     * @param view - the file extension data
     */
    static setExtensionFromBytes(view: Uint8Array, file: FileTemplate) {
        // Reset file if we got a file message and we are not "receiving" it yet
        if (!file.receiving) {
            file.mimetype = '';
            file.extension = '';
            file.receiving = true;
            file.valid = false;
            file.chunks = 0;
            file.data = [];
            file.timestampStart = new Date().getTime();
            Logger.Log(
                Logger.GetStackTrace(),
                'Received first chunk of file',
                6
            );
        }

        const extensionAsString = new TextDecoder('utf-16').decode(
            view.slice(1)
        );
        Logger.Log(Logger.GetStackTrace(), extensionAsString, 6);
        file.extension = extensionAsString;
    }

    /**
     * Processes a files mime type when received over data channel
     * @param view - the file mime type data
     */
    static setMimeTypeFromBytes(view: Uint8Array, file: FileTemplate) {
        // Reset file if we got a file message and we are not "receiving" it yet
        if (!file.receiving) {
            file.mimetype = '';
            file.extension = '';
            file.receiving = true;
            file.valid = false;
            file.chunks = 0;
            file.data = [];
            file.timestampStart = new Date().getTime();
            Logger.Log(
                Logger.GetStackTrace(),
                'Received first chunk of file',
                6
            );
        }

        const mimeAsString = new TextDecoder('utf-16').decode(view.slice(1));
        Logger.Log(Logger.GetStackTrace(), mimeAsString, 6);
        file.mimetype = mimeAsString;
    }

    /**
     * Processes a files contents when received over data channel
     * @param view - the file contents data
     */
    static setContentsFromBytes(view: Uint8Array, file: FileTemplate) {
        // If we haven't received the initial setup instructions, return
        if (!file.receiving) return;

        const typeSize = 1;
        const intSize = 4;
        const maxMessageSize = 16 * 1024;
        const headerSize = typeSize + intSize;
        const maxPayloadSize = maxMessageSize - headerSize;

        // Calculate total number of chunks from the total file size
        file.chunks = Math.ceil(new DataView(view.slice(typeSize, headerSize).buffer).getInt32(0, true) / maxPayloadSize);

        // Get the file part of the payload
        const fileBytes = view.slice(headerSize);

        // Append to existing data that holds the file
        file.data.push(fileBytes);

        // Uncomment for debug
        Logger.Log(
            Logger.GetStackTrace(),
            `Received file chunk: ${file.data.length}/${file.chunks}`,
            6
        );

        if (file.data.length === file.chunks) {
            file.receiving = false;
            file.valid = true;
            Logger.Log(Logger.GetStackTrace(), 'Received complete file', 6);
            const transferDuration = new Date().getTime() - file.timestampStart;
            const transferBitrate = Math.round((file.chunks * maxPayloadSize) / transferDuration);
            Logger.Log(
                Logger.GetStackTrace(),
                `Average transfer bitrate: ${transferBitrate}kb/s over ${
                    transferDuration / 1000
                } seconds`,
                6);

            // File reconstruction
            /**
             * Example code to reconstruct the file
             *
             * This code reconstructs the received data into the original file based on the mime type and extension provided and then downloads the reconstructed file
             */
            const received = new Blob(file.data, { type: file.mimetype });
            const a = document.createElement('a');
            a.setAttribute('href', URL.createObjectURL(received));
            a.setAttribute('download', `transfer.${file.extension}`);
            document.body.append(a);
            // if you are so inclined to make it auto-download, do something like: a.click();
            a.remove();
        } else if (file.data.length > file.chunks) {
            file.receiving = false;
            Logger.Error(
                Logger.GetStackTrace(),
                `Received bigger file than advertised: ${file.data.length}/${file.chunks}`
            );
        }
    }
}

/**
 * A class that represents a template for a downloaded file
 */
export class FileTemplate {
    mimetype = '';
    extension = '';
    receiving = false;
    chunks = 0;
    data: Array<Uint8Array> = [];
    valid = false;
    timestampStart: number;
}
