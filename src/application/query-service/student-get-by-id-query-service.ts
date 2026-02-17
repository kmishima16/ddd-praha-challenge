export type StudentGetByIdQueryServicePayload = {
  id: string;
  name: string;
  mailAddress: string;
  enrollmentStatus: string;
};

export interface IStudentGetByIdQueryService {
  invoke(id: string): Promise<StudentGetByIdQueryServicePayload | null>;
}
