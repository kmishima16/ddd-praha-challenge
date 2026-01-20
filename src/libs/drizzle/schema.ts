import {
  pgTable,
  varchar,
  text,
  timestamp,
  index,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------
 * Users
 * ------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    mailAddress: varchar("mail_address", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return [
      uniqueIndex("users_mail_address_unique").on(
        table.mailAddress
      ),
    ];
  }
);

/* ------------------------------------------------------
 * Student Status
 * ------------------------------------------------------ */

export const studentStatus = pgTable(
  "student_status",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return [
      uniqueIndex("student_status_name_unique").on(table.name),
    ];
  }
);

/* ------------------------------------------------------
 * Teams
 * ------------------------------------------------------ */


export const teams = pgTable(
  "teams",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return [
      uniqueIndex("teams_name_unique").on(table.name),
    ];
  }
);

/* ------------------------------------------------------
 * Students
 * ------------------------------------------------------ */

export const students = pgTable(
  "students",
  {
    userId: varchar("user_id", { length: 26 })
      .primaryKey()
      .references(() => users.id),
    studentStatusId: varchar("student_status_id", { length: 26 })
      .notNull()
      .references(() => studentStatus.id),
    teamId: varchar("team_id", { length: 26 }).references(() => teams.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return [
      index("students_team_id_idx").on(table.teamId),
      index("students_student_status_id_idx").on(
        table.studentStatusId
      ),
    ];
  }
);

/* ------------------------------------------------------
 * lesson Categories
 * ------------------------------------------------------ */

export const lessonCategories = pgTable(
  "lesson_categories",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return [
      uniqueIndex("lesson_categories_name_unique").on(table.name),
    ];
  }
);

/* ------------------------------------------------------
 * lessons
 * ------------------------------------------------------ */

export const lessons = pgTable(
  "lessons",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    lessonCategoryId: varchar("lesson_category_id", { length: 26 })
      .notNull()
      .references(() => lessonCategories.id),
    name: varchar("name", { length: 255 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return [
      index(
        "lessons_lesson_category_id_idx"
      ).on(table.lessonCategoryId),
    ];
  }
);

/* ------------------------------------------------------
 * Task Status
 * ------------------------------------------------------ */

export const taskStatus = pgTable(
  "task_status",
  {
    id: varchar("id", { length: 26 }).primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return [
      uniqueIndex("task_status_name_unique").on(table.name),
    ];
  }
);

/* ------------------------------------------------------
 * Student Tasks
 * ------------------------------------------------------ */

export const studentTasks = pgTable(
  "student_tasks",
  {
    studentId: varchar("student_id", { length: 26 })
      .notNull()
      .references(() => students.userId),
    lessonId: varchar("lesson_id", { length: 26 })
      .notNull()
      .references(() => lessons.id),
    taskStatusId: varchar("task_status_id", { length: 26 })
      .notNull()
      .references(() => taskStatus.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => {
    return [
      primaryKey({ columns: [table.studentId, table.lessonId] }),
      index("student_tasks_lesson_id_idx").on(table.lessonId),
    ];
  }
);
