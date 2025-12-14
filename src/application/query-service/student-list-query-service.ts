export type StudentListQueryServicePayload = Array<{
  id: string;
  name: string;
  mailAddress: string;
  enrollmentStatus: string;
}>;

export interface IStudentListQueryService {
  invoke(): Promise<StudentListQueryServicePayload>;
}
