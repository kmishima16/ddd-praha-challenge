import { LessonProgress } from "../model/lesson-progress/lesson-progress";
import type { StudentId } from "../model/student/value-object/student-id";
import type { ILessonProgressRepository } from "../repository/lesson-progress-repository";
import type { ILessonRepository } from "../repository/lesson-repository";

export class AssignAllLessonsToNewStudentService {
  constructor(
    private readonly lessonRepository: ILessonRepository,
    private readonly lessonProgressRepository: ILessonProgressRepository,
  ) {}

  public async execute(studentId: StudentId): Promise<void> {
    const lessons = await this.lessonRepository.findAll();

    const lessonProgresses = lessons.map((lesson) => {
      return LessonProgress.create(studentId, lesson.id);
    });

    await this.lessonProgressRepository.saveAll(lessonProgresses);
  }
}
