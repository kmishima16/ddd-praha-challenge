import { describe, expect, it } from "vitest";
import { LessonCategoryId } from "./value-object/lesson-category-id";
import { LessonCategory } from "./lesson-category";

describe("LessonCategory", () => {
  it("LessonCategoryの生成", () => {
    const lessonCategory = LessonCategory.create("データベース");

    expect(lessonCategory.id.value).toBeTypeOf("string");
    expect(lessonCategory.name).toBe("データベース");
  });

  it("LessonCategoryの名前変更", () => {
    const lessonCategory = LessonCategory.create("Old name");

    lessonCategory.changeName("New name");

    expect(lessonCategory.name).toBe("New name");
  });

  it("reconstructで復元したLessonCategoryが同一性を持つ", () => {
    const id = LessonCategoryId.create();
    const reconstructed = LessonCategory.reconstruct({
      id,
      name: "設計",
    });

    expect(reconstructed.id.equals(id)).toBe(true);
    expect(reconstructed.name).toBe("設計");
  });
});
