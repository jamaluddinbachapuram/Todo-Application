const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let database;
const initializeDBandServer = async () => {
  try {
    database = await open({
      filename: path.join(__dirname, "todoApplication.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DataBase error is ${error.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

// API - 1 //

const hasPriorityAndStatusProperties = (requestQuery) => {
 return (
  requestQuery.priority !== undefined && requestQuery.status !== undefined
 );
};

const hasPriorityProperty = (requestQuery) => {
 return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
 return requestQuery.status !== undefined;
};
const outPutResult = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority
    status: dbObject.status
  };
};

app.get("/todos/", async (request, response) => {
 let data = null;
 let getTodosQuery = "";
 const { search_q = "", priority, status } = request.query;


 switch (true) {
  case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
   break;
  case hasPriorityProperty(request.query):
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
   break;
  case hasStatusProperty(request.query):
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
   break;
  default:
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
 }


 data = await database.all(getTodosQuery);
 response.send(data);
});
// API - 2 //

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getToDoQuery = `select * from todo where id=${todoId};`;
  const responseResult = await database.get(getToDoQuery);
  response.send(outPutResult(responseResult));
});

// API - 3 //

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, } = request.body;
          const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status)
  VALUES
    (${id}, '${todo}',,'${priority}', '${status}',);`;
          await database.run(postTodoQuery);
          response.send("Todo Successfully Added");
});

// API - 4 //

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  console.log(requestBody);
  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await database.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status
  } = request.body;

  let updateTodoQuery;
  switch (true) {
    // update status
    case requestBody.status !== undefined:
      if (status === "DONE") {
        updateTodoQuery = `
    UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}' WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send(`Status Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    //update priority
    case requestBody.priority !== undefined:
      if (priority === "HIGH") {
        updateTodoQuery = `
    UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}' WHERE id = ${todoId};`;

        await database.run(updateTodoQuery);
        response.send(`Priority Updated`);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //update todo
    case requestBody.todo !== undefined:
        if (todo === "Some task") {
            updateTodoQuery = `
    UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', WHERE id = ${todoId};`;

      await database.run(updateTodoQuery);
      response.send(`Todo Updated`);
        } else {
            response.status(400);
            response.send("Invalid Todo");
        }
      break;
  }
});

// API - 5 //

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await database.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;