ALTER TABLE "challenge_categories" RENAME TO "lesson_categories";--> statement-breakpoint
ALTER TABLE "challenges" RENAME TO "lessons";--> statement-breakpoint
ALTER TABLE "lessons" RENAME COLUMN "challenge_category_id" TO "lesson_category_id";--> statement-breakpoint
ALTER TABLE "student_tasks" RENAME COLUMN "challenge_id" TO "lesson_id";--> statement-breakpoint
ALTER TABLE "lessons" DROP CONSTRAINT "challenges_challenge_category_id_challenge_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "student_tasks" DROP CONSTRAINT "student_tasks_challenge_id_challenges_id_fk";
--> statement-breakpoint
DROP INDEX "challenge_categories_name_unique";--> statement-breakpoint
DROP INDEX "challenges_challenge_category_id_idx";--> statement-breakpoint
DROP INDEX "student_tasks_challenge_id_idx";--> statement-breakpoint
ALTER TABLE "student_tasks" DROP CONSTRAINT "student_tasks_student_id_challenge_id_pk";--> statement-breakpoint
ALTER TABLE "student_tasks" ADD CONSTRAINT "student_tasks_student_id_lesson_id_pk" PRIMARY KEY("student_id","lesson_id");--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_lesson_category_id_lesson_categories_id_fk" FOREIGN KEY ("lesson_category_id") REFERENCES "public"."lesson_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_tasks" ADD CONSTRAINT "student_tasks_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_categories_name_unique" ON "lesson_categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "lessons_lesson_category_id_idx" ON "lessons" USING btree ("lesson_category_id");--> statement-breakpoint
CREATE INDEX "student_tasks_lesson_id_idx" ON "student_tasks" USING btree ("lesson_id");