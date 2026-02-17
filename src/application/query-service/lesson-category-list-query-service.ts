export type LessonCategoryListQueryService = {
  id: string;
  name: string;
};

export interface ILessonCategoryListQueryService {
  invoke(): Promise<LessonCategoryListQueryService[]>;
}
