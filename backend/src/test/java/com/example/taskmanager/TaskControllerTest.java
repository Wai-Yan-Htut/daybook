package com.example.taskmanager;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TaskControllerTest {

    private TaskRepository taskRepository;
    private TaskController taskController;

    @BeforeEach
    void setUp() {
        taskRepository = mock(TaskRepository.class);
        taskController = new TaskController(taskRepository);
    }

    @Test
    void returnsTasksInRepositoryOrder() {
        List<Task> tasks = List.of(new Task("First", "", false));
        when(taskRepository.findAllByOrderByCreatedAtDesc()).thenReturn(tasks);

        assertEquals(tasks, taskController.getAllTasks());
    }

    @Test
    void returnsOneTaskById() {
        Task task = new Task("Read a chapter", "", false);
        task.setId(2L);
        when(taskRepository.findById(2L)).thenReturn(Optional.of(task));

        assertEquals(task, taskController.getTask(2L));
    }

    @Test
    void createsTaskWithDefaults() {
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task saved = invocation.getArgument(0);
            saved.setId(7L);
            return saved;
        });

        ResponseEntity<Task> response = taskController.createTask(new TaskRequest("  Plan week  ", null, null));

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Plan week", response.getBody().getTitle());
        assertEquals("", response.getBody().getDescription());
        assertFalse(response.getBody().isCompleted());
        assertEquals("/api/tasks/7", response.getHeaders().getLocation().getPath());
    }

    @Test
    void updatesAnExistingTask() {
        Task task = new Task("Old title", "Old description", false);
        task.setId(3L);
        when(taskRepository.findById(3L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);

        Task updated = taskController.updateTask(3L, new TaskRequest("New title", "Details", true));

        assertEquals("New title", updated.getTitle());
        assertEquals("Details", updated.getDescription());
        assertTrue(updated.isCompleted());
    }

    @Test
    void returnsNotFoundForMissingTask() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> taskController.getTask(99L)
        );

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    void deletesAnExistingTask() {
        Task task = new Task("Remove me", "", false);
        task.setId(4L);
        when(taskRepository.findById(4L)).thenReturn(Optional.of(task));

        ResponseEntity<Void> response = taskController.deleteTask(4L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(taskRepository).delete(task);
    }
}
