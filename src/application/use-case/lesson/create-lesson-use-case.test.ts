import { describe, expect, it, vi } from "vitest";
import type { ILessonRepository } from "../../../domain/repository/lesson-repository";
import { CreateLessonUseCase } from "./create-lesson-use-case";

describe("CreateLessonUseCase", () => {
  it("create lesson", async () => {
    const mockLessonRepository: ILessonRepository = {
      findAll: vi.fn(),
      save: vi.fn().mockImplementation((lesson) => Promise.resolve(lesson)),
    };

    const useCase = new CreateLessonUseCase(mockLessonRepository);

    const result = await useCase.invoke({
      lessonCategoryId: "01JKXYZ1234567890ABCDEFGHI",
      name: "test lesson",
      content: "test content",
    });

    expect(result.name).toBe("test lesson");
    expect(result.content).toBe("test content");
    expect(result.lessonCategoryId).toBe("01JKXYZ1234567890ABCDEFGHI");
    expect(result.id).toBeDefined();
    expect(mockLessonRepository.save).toHaveBeenCalledOnce();
  });
});
