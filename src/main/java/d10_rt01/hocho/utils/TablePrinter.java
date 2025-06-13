package d10_rt01.hocho.utils;

import java.util.ArrayList;

public class TablePrinter {

    private static ArrayList<String> data = new ArrayList<>();

    public static void addRow(String item) {
        data.add(item);
    }

    public static void clearData(){
        data.clear();
    }

    public static void printTable() {
        int maxLength = 0;
        for (String item : data) {
            maxLength = Math.max(maxLength, item.length());
        }
        int lineLength = maxLength + 5;
        printLine(lineLength);
        for (String item : data) {
            String formatted = String.format("*  %-" + maxLength + "s  *", item);
            System.out.println(formatted);
        }
        printLine(lineLength);
    }

    private static void printLine(int length) {
        System.out.println("*".repeat(length));
    }
}