package com.example.taskmanager;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public Task getTask(@PathVariable Long id) {
        return findTask(id);
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequest request) {
        Task task = new Task(
                request.title().trim(),
                descriptionOrEmpty(request.description()),
                Boolean.TRUE.equals(request.completed())
        );
        Task savedTask = taskRepository.save(task);
        return ResponseEntity.created(URI.create("/api/tasks/" + savedTask.getId())).body(savedTask);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        Task task = findTask(id);
        task.setTitle(request.title().trim());
        task.setDescription(descriptionOrEmpty(request.description()));
        task.setCompleted(Boolean.TRUE.equals(request.completed()));
        return taskRepository.save(task);
    }

    @PatchMapping("/{id}/completion")
    public Task updateTaskCompletion(@PathVariable Long id, @Valid @RequestBody TaskCompletionRequest request) {
        Task task = findTask(id);
        task.setCompleted(request.completed());
        return taskRepository.save(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        Task task = findTask(id);
        taskRepository.delete(task);
        return ResponseEntity.noContent().build();
    }

    private Task findTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Task not found"));
    }

    private String descriptionOrEmpty(String description) {
        return description == null ? "" : description.trim();
    }
}
