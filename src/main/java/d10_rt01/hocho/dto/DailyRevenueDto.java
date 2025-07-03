package d10_rt01.hocho.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.sql.Date;  // Import java.sql.Date for database compatibility
import java.time.LocalDateTime;  // Convert to LocalDateTime if necessary
import java.time.LocalTime;  // For time handling

@Data
@AllArgsConstructor
public class DailyRevenueDto {
    private LocalDateTime date;  // Change from LocalDate to LocalDateTime
    private Long revenue;

    public DailyRevenueDto(Date date, Long revenue) {
        // Convert java.sql.Date to LocalDateTime, assuming time is 00:00:00
        this.date = (date != null) ? date.toLocalDate().atTime(LocalTime.MIDNIGHT) : null;  // Use midnight (00:00:00)
        this.revenue = revenue;
    }
}
