CREATE TABLE "challenge_categories" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"challenge_category_id" varchar(26) NOT NULL,
	"name" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_status" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_tasks" (
	"student_id" varchar(26) NOT NULL,
	"challenge_id" varchar(26) NOT NULL,
	"task_status_id" varchar(26) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_tasks_student_id_challenge_id_pk" PRIMARY KEY("student_id","challenge_id")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"user_id" varchar(26) PRIMARY KEY NOT NULL,
	"student_status_id" varchar(26) NOT NULL,
	"team_id" varchar(26),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_status" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"mail_address" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_challenge_category_id_challenge_categories_id_fk" FOREIGN KEY ("challenge_category_id") REFERENCES "public"."challenge_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_tasks" ADD CONSTRAINT "student_tasks_student_id_students_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_tasks" ADD CONSTRAINT "student_tasks_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_tasks" ADD CONSTRAINT "student_tasks_task_status_id_task_status_id_fk" FOREIGN KEY ("task_status_id") REFERENCES "public"."task_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_student_status_id_student_status_id_fk" FOREIGN KEY ("student_status_id") REFERENCES "public"."student_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_categories_name_unique" ON "challenge_categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "challenges_challenge_category_id_idx" ON "challenges" USING btree ("challenge_category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "student_status_name_unique" ON "student_status" USING btree ("name");--> statement-breakpoint
CREATE INDEX "student_tasks_challenge_id_idx" ON "student_tasks" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "students_team_id_idx" ON "students" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "students_student_status_id_idx" ON "students" USING btree ("student_status_id");--> statement-breakpoint
CREATE UNIQUE INDEX "task_status_name_unique" ON "task_status" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_name_unique" ON "teams" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_mail_address_unique" ON "users" USING btree ("mail_address");