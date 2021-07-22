const express = require('express');
const cors = require('cors');

 const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  if(!username) response.status(400).json({error: 'username not received'});

  const user = users.find(u => u.username === username);
  if(!user) response.status(404).json({error: 'user not found'});

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { name,username } = request.body;

  const userAlreadyExist = users.find(u => u.username === username);

  if(userAlreadyExist) response.status(400).json({error: 'User already exists'})

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(user);

  response.status(201).json({user});
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const todos = user.todos;
  response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request
  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(todo)
  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find(t => t.id === id);
  if(!todo) response.status(404).json({error:'Todo not found'});

  if(title) todo.title = title;
  if(deadline) todo.deadline = deadline;

  response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(t => t.id === id);
  if(!todo) response.status(404).json({error:'Todo not found'});

  todo.done = true;

  response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(t => t.id === id);
  if(todoIndex === -1) response.status(404).json({error:'Todo not found'});

  user.todos.splice(todoIndex,1);
  
  response.status(204).send();
});

module.exports = app;