import { describe, expect, it } from "vitest";
import { Lesson } from "./lesson";

describe("Lesson", () => {
  it("Lessonの生成", () => {
    const lesson = Lesson.create("DDD基礎", "課題：値オブジェクトとは何か？");

    expect(lesson.getId.value).toBeTypeOf("string");
    expect(lesson.getId.value).not.toHaveLength(0);
    expect(lesson.getName).toBe("DDD基礎");
    expect(lesson.getContent).toBe("課題：値オブジェクトとは何か？");
  });

  it("Leesonのタイトル変更", () => {
    const lesson = Lesson.create("Old name", "Content");

    lesson.changeName("New name");

    expect(lesson.getName).toBe("New name");
  });

  it("Lessonの課題内容変更", () => {
    const lesson = Lesson.create("Lesson", "Old content");

    lesson.changeContent("Updated content");

    expect(lesson.getContent).toBe("Updated content");
  });
});
