import { describe, expect, it, vi } from "vitest";
import { Lesson } from "../model/lesson/lesson";
import { StudentId } from "../model/student/value-object/student-id";
import type { ILessonProgressRepository } from "../repository/lesson-progress-repository";
import type { ILessonRepository } from "../repository/lesson-repository";
import { AssignAllLessonsToNewStudentService } from "./assign-all-lessons-to-new-student.service";

const createService = () => {
  const lessonRepository: ILessonRepository = {
    findAll: vi.fn(),
  };
  const lessonProgressRepository: ILessonProgressRepository = {
    saveAll: vi.fn(),
  };

  return { lessonRepository, lessonProgressRepository };
};

describe("AssignAllLessonsToNewStudentService", () => {
  it("全てのレッスン進捗を作成して保存する", async () => {
    const { lessonRepository, lessonProgressRepository } = createService();
    const service = new AssignAllLessonsToNewStudentService(
      lessonRepository,
      lessonProgressRepository,
    );
    const studentId = StudentId.reconstruct("student-1");
    const lessons = [
      Lesson.create("lesson-1", "content-1"),
      Lesson.create("lesson-2", "content-2"),
    ];
    vi.mocked(lessonRepository.findAll).mockResolvedValue(lessons);
    vi.mocked(lessonProgressRepository.saveAll).mockResolvedValue();

    await service.execute(studentId);

    expect(lessonRepository.findAll).toHaveBeenCalledTimes(1);
    expect(lessonProgressRepository.saveAll).toHaveBeenCalledTimes(1);
  });
});
