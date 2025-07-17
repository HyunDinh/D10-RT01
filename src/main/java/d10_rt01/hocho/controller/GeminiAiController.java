package d10_rt01.hocho.controller;

import d10_rt01.hocho.service.GeminiAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/ai")
public class GeminiAiController {
    private final GeminiAiService geminiAiService;

    public GeminiAiController(GeminiAiService geminiAiService) {
        this.geminiAiService = geminiAiService;
    }

    @PostMapping("/ask")
    public ResponseEntity<String> askGemini(@RequestBody Map<String, String> body) {
        String prompt = body.get("prompt");
        String result = geminiAiService.askGemini(prompt);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(result);
    }
} 