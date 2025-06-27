package d10_rt01.hocho.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class SubtractTimeRequest {
    private Long childId;
    private Integer timeSpent;

}
