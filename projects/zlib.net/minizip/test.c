// Generated with ChatGPT

#include <stdio.h>
#include <string.h>
#include "minizip/zip.h"
#include "minizip/unzip.h"

int main(int argc, char *argv[]) {
    zipFile zf = NULL;
    unzFile uf = NULL;
    const char *zip_file = "test.zip";
    const char *file_name = "test.txt";
    char *file_content = "Hello, world!";
    zip_fileinfo zfi;

    // Create a new zip file
    zf = zipOpen(zip_file, APPEND_STATUS_CREATE);
    if (zf == NULL) {
        printf("Error creating zip file\n");
        return 1;
    }

    // Fill in zip_fileinfo struct
    memset(&zfi, 0, sizeof(zfi));

    // Add a file to the zip
    if (zipOpenNewFileInZip(zf, file_name, &zfi, NULL, 0, NULL, 0, NULL, Z_DEFLATED, Z_DEFAULT_COMPRESSION) != ZIP_OK) {
        printf("Error adding file to zip archive\n");
        return 1;
    }

    // Write the file content
    if (zipWriteInFileInZip(zf, file_content, strlen(file_content)) != ZIP_OK) {
        printf("Error writing file content\n");
        return 1;
    }

    // Close the file and zip
    zipCloseFileInZip(zf);
    zipClose(zf, NULL);

    // Open the zip file for reading
    uf = unzOpen(zip_file);
    if (uf == NULL) {
        printf("Error opening zip file\n");
        return 1;
    }

    // Locate the file in the zip archive
    if (unzLocateFile(uf, file_name, 0) != UNZ_OK) {
        printf("Error locating file in zip archive\n");
        return 1;
    }

    // Extract the file
    if (unzOpenCurrentFile(uf) != UNZ_OK) {
        printf("Error opening file in zip archive\n");
        return 1;
    }

    // Read the file content
    char buffer[1024];
    int bytes_read = unzReadCurrentFile(uf, buffer, sizeof(buffer) - 1);
    if (bytes_read < 0) {
        printf("Error reading file from zip archive\n");
        return 1;
    }
    buffer[bytes_read] = '\0';

    // Close the file and zip
    unzCloseCurrentFile(uf);
    unzClose(uf);

    // Print the file content
    printf("Extracted content: %s\n", buffer);

    return 0;
}
