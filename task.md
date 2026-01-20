
## infrastructure

repositoryフォルダと
query-serviceフォルダを用意する

例えばrepositoryなら
repository/postgre-task-repository.ts

```ts
import { eq, sql } from "drizzle-orm";
import { Task } from "../../domain/task/task";
import type { TaskRepositoryInterface } from "../../domain/task/task-repository";
import type { Database } from "../../libs/drizzle/get-database";
import { tasks } from "../../libs/drizzle/schema";

export class PostgresqlTaskRepository implements TaskRepositoryInterface {
  public constructor(private readonly database: Database) {}

  public async save(task: Task) {
    const [row] = await this.database
      .insert(tasks)
      .values({
        id: task.id,
        title: task.title,
        done: task.isDone,
      })
      .onConflictDoUpdate({
        target: tasks.id,
        set: {
          title: sql.raw(`excluded.${tasks.title.name}`),
          done: sql.raw(`excluded.${tasks.done.name}`),
        },
      })
      .returning({
        id: tasks.id,
        title: tasks.title,
        done: tasks.done,
      });

    if (!row) {
      throw new Error("Failed to save a task");
    }

    return new Task({
      id: row.id,
      title: row.title,
      done: row.done,
    });
  }

  public async findById(id: string) {
    const [row] = await this.database
      .select({
        id: tasks.id,
        title: tasks.title,
        done: tasks.done,
      })
      .from(tasks)
      .where(eq(tasks.id, id));

    if (!row) {
      return undefined;
    }

    return new Task({
      id: row.id,
      title: row.title,
      done: row.done,
    });
  }
}
```

query-serviceなら

infrastructure/query-service
```ts
import { eq } from "drizzle-orm";
import type {
  TaskQueryServiceInput,
  TaskQueryServiceInterface,
  TaskQueryServicePayload,
} from "../../application/query-service/task-query-service";
import type { Database } from "../../libs/drizzle/get-database";
import { tasks } from "../../libs/drizzle/schema";

export class PostgresqlTaskQueryService implements TaskQueryServiceInterface {
  public constructor(private readonly database: Database) {}

  public async invoke(
    input: TaskQueryServiceInput,
  ): Promise<TaskQueryServicePayload | undefined> {
    const [row] = await this.database
      .select({
        id: tasks.id,
        title: tasks.title,
        done: tasks.done,
      })
      .from(tasks)
      .where(eq(tasks.id, input.id));

    return row;
  }
}
```

### query-service/postgresql-task-list-query-service

```ts
import type {
  TaskListQueryServiceInterface,
  TaskListQueryServicePayload,
} from "../../application/query-service/task-list-query-service";
import type { Database } from "../../libs/drizzle/get-database";
import { tasks } from "../../libs/drizzle/schema";

export class PostgresqlTaskListQueryService
  implements TaskListQueryServiceInterface
{
  public constructor(private readonly database: Database) {}

  public async invoke(): Promise<TaskListQueryServicePayload> {
    return this.database
      .select({
        id: tasks.id,
        title: tasks.title,
        done: tasks.done,
      })
      .from(tasks);
  }
}
```

## presentation

honoでAPIを立てる

### presentation/index.ts

たとえば

```ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { createTaskController } from "./presentation/task/create-task-controller";
import { editTaskTitleController } from "./presentation/task/edit-task-title-controller";
import { getTaskController } from "./presentation/task/get-task-controller";
import { getTaskListController } from "./presentation/task/get-task-list-controller";
import { setTaskDoneController } from "./presentation/task/set-task-done-controller";

const app = new Hono();

app.route("/", getTaskController);
app.route("/", getTaskListController);
app.route("/", createTaskController);
app.route("/", editTaskTitleController);
app.route("/", setTaskDoneController);

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
```

vite-env.d.ts

```ts
/// <reference types="vite/client" />
/// <reference types="vitest" />
```

### presentation/create-task-controller.ts

```ts
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { CreateTaskUseCase } from "../../application/use-case/create-task-use-case";
import { PostgresqlTaskRepository } from "../../infrastructure/repository/postgresql-task-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    createTaskUseCase: CreateTaskUseCase;
  };
};

export const createTaskController = new Hono<Env>();

createTaskController.post(
  "/tasks/new",
  zValidator("json", z.object({ title: z.string() }), (result, c) => {
    if (!result.success) {
      return c.text("invalid title", 400);
    }

    return;
  }),
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const taskRepository = new PostgresqlTaskRepository(database);
    const createTaskUseCase = new CreateTaskUseCase(taskRepository);
    context.set("createTaskUseCase", createTaskUseCase);

    await next();
  }),
  async (context) => {
    const body = context.req.valid("json");

    const payload = await context.var.createTaskUseCase.invoke(body);
    return context.json(payload);
  },
);
```

### presentation/get-task-list-controller

```ts
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import type { TaskListQueryServiceInterface } from "../../application/query-service/task-list-query-service";
import type { TodoListQueryServiceInterface } from "../../application/query-service/todo-list-query-service";
import { PostgresqlTaskListQueryService } from "../../infrastructure/query-service/postgresql-task-list-query-service";
import { PostgresqlTodoListQueryService } from "../../infrastructure/query-service/postgresql-todo-list-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    taskListQueryService: TaskListQueryServiceInterface;
    todoListQueryService: TodoListQueryServiceInterface;
  };
};

export const getTaskListController = new Hono<Env>();

getTaskListController.get(
  "/tasks",
  zValidator(
    "query",
    z.object({ filter: z.string().optional() }),
    (result, c) => {
      if (!result.success) {
        return c.text("invalid query", 400);
      }

      return;
    },
  ),
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const taskListQueryService = new PostgresqlTaskListQueryService(database);
    const todoListQueryService = new PostgresqlTodoListQueryService(database);
    context.set("taskListQueryService", taskListQueryService);
    context.set("todoListQueryService", todoListQueryService);

    await next();
  }),
  async (context) => {
    const query = context.req.valid("query");

    if (query.filter === "todo") {
      const payload = await context.var.todoListQueryService.invoke();
      return context.json(payload);
    }

    const payload = await context.var.taskListQueryService.invoke();
    return context.json(payload);
  },
);
```