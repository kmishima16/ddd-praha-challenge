import { describe, expect, it } from "vitest";
import { Lesson } from "./lesson";

describe("Lesson", () => {
  it("Lessonの生成", () => {
    const lesson = Lesson.create("DDD基礎", "課題：値オブジェクトとは何か？");

    expect(lesson.id.value).toBeTypeOf("string");
    expect(lesson.name).toBe("DDD基礎");
    expect(lesson.content).toBe("課題：値オブジェクトとは何か？");
  });

  it("Leesonのタイトル変更", () => {
    const lesson = Lesson.create("Old name", "Content");

    lesson.changeName("New name");

    expect(lesson.name).toBe("New name");
  });

  it("Lessonの課題内容変更", () => {
    const lesson = Lesson.create("Lesson", "Old content");

    lesson.changeContent("Updated content");

    expect(lesson.content).toBe("Updated content");
  });
});
