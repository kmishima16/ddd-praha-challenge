import { describe, expect, it } from "vitest";
import { Student } from "./student";
import { MailAddress } from "./value-object/mail-address";

const createStudent = () =>
  Student.create(
    "test 太郎",
    MailAddress.create("taro@example.com"),
    "ENROLLED",
  );

describe("Student", () => {
  it("Studentの生成", () => {
    const student = createStudent();

    expect(student.id.value).toBeTypeOf("string");
    expect(student.name).toBe("test 太郎");
    expect(student.mailAddress.value).toBe("taro@example.com");
    expect(student.enrollmentStatus).toBe("ENROLLED");
  });

  it("Studentの氏名変更", () => {
    const student = createStudent();

    student.changeName("test 花子");

    expect(student.name).toBe("test 花子");
  });

  it("Studentのメールアドレス変更", () => {
    const student = createStudent();
    const newMailAddress = MailAddress.create("hanako@example.com");

    student.changeMailAddress(newMailAddress);

    expect(student.mailAddress.value).toBe("hanako@example.com");
  });

  it("Studentの在籍ステータス変更", () => {
    const student = createStudent();

    student.changeEnrollmentStatus("ON_LEAVE");

    expect(student.enrollmentStatus).toBe("ON_LEAVE");
  });
});
