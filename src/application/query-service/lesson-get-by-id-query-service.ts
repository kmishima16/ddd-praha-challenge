export type LessonGetByIdQueryServicePayload = {
  id: string;
  name: string;
  content: string;
  lessonCategoryId: string;
  lessonCategoryName: string;
};

export interface ILessonGetByIdQueryService {
  invoke(id: string): Promise<LessonGetByIdQueryServicePayload | null>;
}
