import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { changeToCompletedController } from "./presentation/lesson-progress/change-to-completed-controller";
import { changeToInProgressController } from "./presentation/lesson-progress/change-to-in-progress-controller";
import { changeToInReviewController } from "./presentation/lesson-progress/change-to-in-review-controller";
import { createLessonProgressController } from "./presentation/lesson-progress/create-lesson-progress-controller";
import { createLessonController } from "./presentation/lesson/create-lesson-controller";
import { createStudentController } from "./presentation/student/create-student-controller";
import { getStudentListController } from "./presentation/student/get-student-list-controller";
import { addTeamMemberController } from "./presentation/team/add-team-member-controller";
import { createTeamController } from "./presentation/team/create-team-controller";
import { deleteTeamMemberController } from "./presentation/team/delete-team-member-controller";
import { disbandTeamController } from "./presentation/team/disband-team-controller";
import { splitTeamController } from "./presentation/team/split-team-controller";

const app = new Hono();

app.route("/", createLessonController);
app.route("/", createStudentController);
app.route("/", getStudentListController);
app.route("/", createLessonProgressController);
app.route("/", changeToInProgressController);
app.route("/", changeToInReviewController);
app.route("/", changeToCompletedController);
app.route("/", createTeamController);
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
