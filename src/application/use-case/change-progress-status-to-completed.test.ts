import { describe, expect, it, vi } from "vitest";
import { LessonProgress } from "../../domain/model/lesson-progress/lesson-progress";
import { LessonId } from "../../domain/model/lesson/value-object/lesson-id";
import { StudentId } from "../../domain/model/student/value-object/student-id";
import type { ILessonProgressRepository } from "../../domain/repository/lesson-progress-repository";
import { ChangeProgressStatusToCompletedUseCase } from "./change-progress-status-to-completed";

describe("ChangeProgressStatusToCompletedUseCase", () => {
  it("change progress status to completed", async () => {
    const studentId = StudentId.reconstruct("01JKXYZ1234567890ABCDEFGHI");
    const lessonId = LessonId.reconstruct("01JKXYZ1234567890ABCDEFGHJ");
    const mockLessonProgress = LessonProgress.create(studentId, lessonId);

    const mockLessonProgressRepository: ILessonProgressRepository = {
      saveAll: vi.fn(),
      save: vi.fn().mockImplementation((progress) => Promise.resolve(progress)),
      findByStudentIdAndLessonId: vi.fn().mockResolvedValue(mockLessonProgress),
    };

    const useCase = new ChangeProgressStatusToCompletedUseCase(
      mockLessonProgressRepository,
    );

    const result = await useCase.invoke({
      studentId: studentId.value,
      lessonId: lessonId.value,
    });

    expect(result.studentId).toBe(studentId.value);
    expect(result.lessonId).toBe(lessonId.value);
    expect(result.status).toBe("COMPLETED");
    expect(mockLessonProgressRepository.save).toHaveBeenCalledOnce();
  });

  it("throw error if lesson progress not found", async () => {
    const mockLessonProgressRepository: ILessonProgressRepository = {
      saveAll: vi.fn(),
      save: vi.fn(),
      findByStudentIdAndLessonId: vi.fn().mockResolvedValue(null),
    };

    const useCase = new ChangeProgressStatusToCompletedUseCase(
      mockLessonProgressRepository,
    );

    await expect(
      useCase.invoke({
        studentId: "01JKXYZ1234567890ABCDEFGHI",
        lessonId: "01JKXYZ1234567890ABCDEFGHJ",
      }),
    ).rejects.toThrow("lesson progress not found");
  });
});
