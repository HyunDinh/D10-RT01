package d10_rt01.hocho.utils;

import org.slf4j.Logger;

public class CustomLogger {

    private final Logger logger;
    private final boolean isDebugging;

    // ANSI escape codes for green text
    private static final String ANSI_GREEN = "\u001B[32m";
    private static final String ANSI_YELLOW = "\u001B[33m";
    private static final String ANSI_RESET = "\u001B[0m";

    public CustomLogger(Logger logger, boolean isDebugging) {
        this.logger = logger;
        this.isDebugging = isDebugging;
    }

    public void task(String message, Object... arguments){
        if (isDebugging) {
            // Wrap the message with green color for terminal output
            String coloredMessage = ANSI_YELLOW + message + ANSI_RESET;
            logger.info(coloredMessage, arguments);
        }
    }

    public void info(String message, Object... arguments) {
        if (isDebugging) {
            // Wrap the message with green color for terminal output
            String coloredMessage = ANSI_GREEN + message + ANSI_RESET;
            logger.info(coloredMessage, arguments);
        }
    }

    public void warn(String message, Object... arguments) {
        if (isDebugging) {
            logger.warn(message, arguments);
        }
    }

    public void error(String message, Object... arguments) {
        if (isDebugging) {
            logger.error(message, arguments);
        }
    }
}