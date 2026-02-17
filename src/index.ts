import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { createLessonProgressController } from "./presentation/lesson-progress/create-lesson-progress-controller";
import { changeLessonProgressStatusToInProgressController } from "./presentation/lesson-progress/change-lesson-progress-status-to-in-progress-controller";
import { changeLessonProgressStatusToInReviewController } from "./presentation/lesson-progress/change-lesson-progress-status-to-in-review-controller";
import { changeLessonProgressStatusToCompletedController } from "./presentation/lesson-progress/change-lesson-progress-status-to-completed-controller";
import { getLessonProgressByStudentIdController } from "./presentation/lesson-progress/get-lesson-progress-by-student-id-controller";
import { getLessonProgressListByStudentIdController } from "./presentation/lesson-progress/get-lesson-progress-list-by-student-id-controller";
import { createLessonCategoryController } from "./presentation/lesson-category/create-lesson-category-controller";
import { getLessonCategoryListController } from "./presentation/lesson-category/get-lesson-category-list-controller";
import { createLessonController } from "./presentation/lesson/create-lesson-controller";
import { getLessonByIdController } from "./presentation/lesson/get-lesson-by-id-controller";
import { getLessonListController } from "./presentation/lesson/get-lesson-list-controller";
import { changeEnrollmentStatusToEnrolledController } from "./presentation/student/change-enrollment-status-to-enrolled-controller";
import { changeEnrollmentStatusToOnLeaveController } from "./presentation/student/change-enrollment-status-to-on-leave-controller";
import { changeEnrollmentStatusToWithdrawnController } from "./presentation/student/change-enrollment-status-to-withdrawn-controller";
import { createStudentController } from "./presentation/student/create-student-controller";
import { getStudentByIdController } from "./presentation/student/get-student-by-id-controller";
import { getStudentListController } from "./presentation/student/get-student-list-controller";
import { addTeamMemberController } from "./presentation/team/add-team-member-controller";
import { createTeamController } from "./presentation/team/create-team-controller";
import { deleteTeamMemberController } from "./presentation/team/delete-team-member-controller";
import { disbandTeamController } from "./presentation/team/disband-team-controller";
import { getTeamByIdController } from "./presentation/team/get-team-by-id-controller";
import { getTeamListController } from "./presentation/team/get-team-list-controller";
import { splitTeamController } from "./presentation/team/split-team-controller";

const app = new Hono();

app.route("/", getLessonCategoryListController);
app.route("/", createLessonCategoryController);
app.route("/", createLessonController);
app.route("/", getLessonListController);
app.route("/", getLessonByIdController);
app.route("/", createStudentController);
app.route("/", getStudentListController);
app.route("/", getStudentByIdController);
app.route("/", changeEnrollmentStatusToEnrolledController);
app.route("/", changeEnrollmentStatusToOnLeaveController);
app.route("/", changeEnrollmentStatusToWithdrawnController);
app.route("/", createLessonProgressController);
app.route("/", getLessonProgressByStudentIdController);
app.route("/", getLessonProgressListByStudentIdController);
app.route("/", changeLessonProgressStatusToInProgressController);
app.route("/", changeLessonProgressStatusToInReviewController);
app.route("/", changeLessonProgressStatusToCompletedController);
app.route("/", createTeamController);
app.route("/", getTeamListController);
app.route("/", getTeamByIdController);
app.route("/", addTeamMemberController);
app.route("/", deleteTeamMemberController);
app.route("/", disbandTeamController);
app.route("/", splitTeamController);

const port = 3000;
console.log(`Server is running on port ${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

if (import.meta.hot) {
  // HMR時に同一ポートでサーバーが立ち上がろうとする為、リロードが発生する前にサーバーを閉じる
  import.meta.hot.on("vite:beforeFullReload", () => {
    server.close();
  });
}
