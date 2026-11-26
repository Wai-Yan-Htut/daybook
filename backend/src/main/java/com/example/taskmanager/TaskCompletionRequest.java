package com.example.taskmanager;

import jakarta.validation.constraints.NotNull;

public record TaskCompletionRequest(
        @NotNull(message = "Completed status is required")
        Boolean completed
) {
}
