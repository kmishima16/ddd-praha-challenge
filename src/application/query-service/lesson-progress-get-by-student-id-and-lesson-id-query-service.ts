export type LessonProgressGetByStudentIdAndLessonIdQueryServicePayload = {
  id: string;
  studentId: string;
  lessonId: string;
  status: string;
};

export interface ILessonProgressGetByStudentIdAndLessonIdQueryService {
  invoke(
    studentId: string,
    lessonId: string,
  ): Promise<LessonProgressGetByStudentIdAndLessonIdQueryServicePayload | null>;
}
