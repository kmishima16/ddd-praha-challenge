import { describe, expect, it, vi } from "vitest";
import type { ILessonProgressRepository } from "../../domain/repository/lesson-progress-repository";
import type { ILessonRepository } from "../../domain/repository/lesson-repository";
import type { IStudentRepository } from "../../domain/repository/student-repository";
import type { IUniqueStudentService } from "../../domain/specification/unique-student-service";
import { CreateStudentUseCase, MailAddressAlreadyExistsError } from "./create-student-use-case";

describe("CreateStudentUseCase", () => {
  it("create student", async () => {
    const mockStudentRepository: IStudentRepository = {
      save: vi.fn(),
      findById: vi.fn(),
    };
    const mockUniqueStudentService: IUniqueStudentService = {
      isSatisfiedBy: vi.fn().mockResolvedValue(true),
    };
    const mockLessonRepository: ILessonRepository = {
      findAll: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
    };
    const mockLessonProgressRepository: ILessonProgressRepository = {
      saveAll: vi.fn(),
      save: vi.fn(),
      findByStudentIdAndLessonId: vi.fn(),
    };

    const useCase = new CreateStudentUseCase(
      mockStudentRepository,
      mockUniqueStudentService,
      mockLessonRepository,
      mockLessonProgressRepository,
    );

    const result = await useCase.invoke({
      name: "test 太郎",
      mailAddress: "taro@example.com",
    });

    expect(result.name).toBe("test 太郎");
    expect(result.mailAddress).toBe("taro@example.com");
    expect(result.id).toBeDefined();
    expect(mockStudentRepository.save).toHaveBeenCalledOnce();
  });

  it("throw error if mail address already exists", async () => {
    const mockStudentRepository: IStudentRepository = {
      save: vi.fn(),
      findById: vi.fn(),
    };
    const mockUniqueStudentService: IUniqueStudentService = {
      isSatisfiedBy: vi.fn().mockResolvedValue(false),
    };
    const mockLessonRepository: ILessonRepository = {
      findAll: vi.fn(),
      save: vi.fn(),
    };
    const mockLessonProgressRepository: ILessonProgressRepository = {
      saveAll: vi.fn(),
      save: vi.fn(),
      findByStudentIdAndLessonId: vi.fn(),
    };

    const useCase = new CreateStudentUseCase(
      mockStudentRepository,
      mockUniqueStudentService,
      mockLessonRepository,
      mockLessonProgressRepository,
    );

    await expect(
      useCase.invoke({
        name: "test",
        mailAddress: "duplicate@example.com",
      }),
    ).rejects.toThrow(MailAddressAlreadyExistsError);
  });
});
