export type LessonProgressListByStudentIdQueryServicePayload = Array<{
  id: string;
  studentId: string;
  lessonId: string;
  status: string;
}>;

export interface ILessonProgressListByStudentIdQueryService {
  invoke(
    studentId: string,
  ): Promise<LessonProgressListByStudentIdQueryServicePayload>;
}
