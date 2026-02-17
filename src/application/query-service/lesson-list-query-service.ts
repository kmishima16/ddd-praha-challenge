export type LessonListQueryService = {
  id: string;
  lessonCategoryId: string;
  lessonCategoryName: string;
  name: string;
  content: string;
};

export interface ILessonListQueryService {
  invoke(): Promise<LessonListQueryService[]>;
}
