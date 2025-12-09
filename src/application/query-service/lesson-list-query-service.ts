export type LessonListQueryService = {
  id: string;
  name: string;
  content: string;
};

export interface ILessonListQueryService {
  invoke(): Promise<LessonListQueryService[]>;
}
