import { describe, expect, it, vi } from "vitest";
import type { ILessonCategoryRepository } from "../../../domain/repository/lesson-category-repository";
import { CreateLessonCategoryUseCase } from "./create-lesson-category-use-case";

describe("CreateLessonCategoryUseCase", () => {
  it("create lesson category", async () => {
    const mockLessonCategoryRepository: ILessonCategoryRepository = {
      save: vi
        .fn()
        .mockImplementation((lessonCategory) =>
          Promise.resolve(lessonCategory),
        ),
      findById: vi.fn(),
      findAll: vi.fn(),
    };

    const useCase = new CreateLessonCategoryUseCase(
      mockLessonCategoryRepository,
    );

    const result = await useCase.invoke({
      name: "テスト",
    });

    expect(result.name).toBe("テスト");
    expect(result.id).toBeDefined();
    expect(mockLessonCategoryRepository.save).toHaveBeenCalledOnce();
  });
});
