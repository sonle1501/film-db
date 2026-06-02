package dev.sonle.filmdb.importer.core;

import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CountingInputStreamTest {

    @Test
    void shouldCountBytesReadByteByByte() throws IOException {
        byte[] data = {1, 2, 3, 4, 5};
        try (CountingInputStream cis = new CountingInputStream(new ByteArrayInputStream(data))) {
            assertEquals(0, cis.getBytesRead());

            int b1 = cis.read();
            assertEquals(1, b1);
            assertEquals(1, cis.getBytesRead());

            int b2 = cis.read();
            assertEquals(2, b2);
            assertEquals(2, cis.getBytesRead());

            // Read the rest
            cis.read();
            cis.read();
            cis.read();
            assertEquals(5, cis.getBytesRead());

            // EOF read should not increase byte count
            int eof = cis.read();
            assertEquals(-1, eof);
            assertEquals(5, cis.getBytesRead());
        }
    }

    @Test
    void shouldCountBytesReadInBatches() throws IOException {
        byte[] data = new byte[100];
        for (int i = 0; i < 100; i++) {
            data[i] = (byte) i;
        }

        try (CountingInputStream cis = new CountingInputStream(new ByteArrayInputStream(data))) {
            byte[] buffer = new byte[50];
            
            int bytesRead = cis.read(buffer, 0, 30);
            assertEquals(30, bytesRead);
            assertEquals(30, cis.getBytesRead());

            bytesRead = cis.read(buffer, 0, 30);
            assertEquals(30, bytesRead);
            assertEquals(60, cis.getBytesRead());

            bytesRead = cis.read(buffer, 0, 50); // only 40 left
            assertEquals(40, bytesRead);
            assertEquals(100, cis.getBytesRead());

            // EOF read
            bytesRead = cis.read(buffer, 0, 10);
            assertEquals(-1, bytesRead);
            assertEquals(100, cis.getBytesRead());
        }
    }
}
