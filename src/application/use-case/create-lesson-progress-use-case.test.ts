import { describe, expect, it, vi } from "vitest";
import type { ILessonProgressRepository } from "../../domain/repository/lesson-progress-repository";
import { CreateLessonProgressUseCase } from "./create-lesson-progress-use-case";

describe("CreateLessonProgressUseCase", () => {
  it("create lesson progress", async () => {
    const mockLessonProgressRepository: ILessonProgressRepository = {
      saveAll: vi.fn(),
      save: vi.fn().mockImplementation((progress) => Promise.resolve(progress)),
      findByStudentIdAndLessonId: vi.fn(),
    };

    const useCase = new CreateLessonProgressUseCase(
      mockLessonProgressRepository,
    );

    const result = await useCase.invoke({
      studentId: "01JKXYZ1234567890ABCDEFGHI",
      lessonId: "01JKXYZ1234567890ABCDEFGHJ",
    });

    expect(result.studentId).toBe("01JKXYZ1234567890ABCDEFGHI");
    expect(result.lessonId).toBe("01JKXYZ1234567890ABCDEFGHJ");
    expect(result.status).toBeDefined();
    expect(result.id).toBeDefined();
    expect(mockLessonProgressRepository.save).toHaveBeenCalledOnce();
  });
});
