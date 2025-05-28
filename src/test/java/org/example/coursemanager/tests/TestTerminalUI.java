package org.example.coursemanager.tests;

import java.util.List;
import java.util.Map;

public class TestTerminalUI {

    private static final int DEFAULT_TABLE_WIDTH = 86;

    public static void printTestTitle(String title) {
        int totalWidth = DEFAULT_TABLE_WIDTH;
        int titleLength = title.length();

        int leftSpace = (totalWidth - titleLength - 2) / 2;
        int rightSpace = totalWidth - titleLength - 2 - leftSpace;

        String leftPadding = " ".repeat(leftSpace);
        String rightPadding = " ".repeat(rightSpace);

        System.out.println("\n \n \n");
        System.out.println("┌────────────────────────────────────────────────────────────────────────────────────┐");
        System.out.println("│" + leftPadding + title + rightPadding + "│");
        System.out.println("└────────────────────────────────────────────────────────────────────────────────────┘");
    }

    public static void printStatus(boolean status, String message) {
        if (status) {
            System.out.println("\n   ✅ " + message + "\n");
        } else {
            System.out.println("\n   ❌ " + message + "\n");
        }
    }

    public static void printKeyValueTable(String title, Map<String, String> data) {
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("Data cannot be null or empty");
        }

        // Fixed column widths for 86-char total width
        int keyWidth = 20;  // Fixed width for key column
        int valueWidth = DEFAULT_TABLE_WIDTH - keyWidth - 7; // Calculate value column width

        // Print table header
        printTableHeader(title, DEFAULT_TABLE_WIDTH);

        // Print column headers
        System.out.printf("│ %-" + keyWidth + "s │ %-" + valueWidth + "s │\n", "Field", "Value");

        // Print header separator
        System.out.println("├" + "─".repeat(keyWidth + 2) + "┴" + "─".repeat(valueWidth + 2) + "┤");

        // Print rows
        for (Map.Entry<String, String> entry : data.entrySet()) {
            System.out.printf("│ %-" + keyWidth + "s │ %-" + valueWidth + "s │\n",
                    entry.getKey(),
                    entry.getValue() != null ? entry.getValue() : "NULL");
        }

        // Print table footer
        System.out.println("└" + "─".repeat(keyWidth + 2) + "┴" + "─".repeat(valueWidth + 2) + "┘");
    }

    // OTHERS

    private static int[] calculateColumnWidths(String[] headers, List<String[]> rows, int availableWidth) {
        int[] columnWidths = new int[headers.length];
        int[] minWidths = new int[headers.length];

        // Initialize with header widths
        for (int i = 0; i < headers.length; i++) {
            minWidths[i] = headers[i].length();
        }

        // Check rows for minimum widths
        for (String[] row : rows) {
            if (row.length != headers.length) {
                throw new IllegalArgumentException("Row length doesn't match header count");
            }
            for (int i = 0; i < row.length; i++) {
                if (row[i] != null) {
                    minWidths[i] = Math.max(minWidths[i], row[i].length());
                }
            }
        }

        // Distribute available width proportionally
        int totalMinWidth = 0;
        for (int width : minWidths) {
            totalMinWidth += width;
        }

        if (totalMinWidth > availableWidth) {
            // If content is too wide, truncate columns proportionally
            for (int i = 0; i < columnWidths.length; i++) {
                columnWidths[i] = (minWidths[i] * availableWidth) / totalMinWidth;
            }
        } else {
            // Distribute remaining space proportionally
            int remainingSpace = availableWidth - totalMinWidth;
            int spacePerColumn = remainingSpace / columnWidths.length;

            for (int i = 0; i < columnWidths.length; i++) {
                columnWidths[i] = minWidths[i] + spacePerColumn;
            }

            // Distribute any remaining space
            int remaining = availableWidth - sum(columnWidths);
            for (int i = 0; i < remaining; i++) {
                columnWidths[i % columnWidths.length]++;
            }
        }

        return columnWidths;
    }

    private static int sum(int[] array) {
        int sum = 0;
        for (int value : array) {
            sum += value;
        }
        return sum;
    }

    private static void printTableHeader(String title, int width) {
        String headerTitle = " " + title + " ";
        int titlePadding = (width - headerTitle.length()) / 2;
        System.out.println("┌" + "─".repeat(width-2) + "┐");
        System.out.println("│" + " ".repeat(titlePadding-1) + headerTitle + " ".repeat(titlePadding-1) + "│");
        System.out.println("├" + "─".repeat(width-2) + "┤");
    }

    private static void printHeaderSeparator(String[] headers, int[] columnWidths) {
        System.out.print("├");
        for (int i = 0; i < headers.length; i++) {
            System.out.print("─".repeat(columnWidths[i] + 2));
            if (i < headers.length - 1) {
                System.out.print("┼");
            }
        }
        System.out.println("┤");
    }

}
