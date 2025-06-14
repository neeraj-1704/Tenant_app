import express, { Router } from 'express'
import { createUser, loginUser, getUser } from "../controller/userController"
import { requireAuth } from "../middlewares/auth";



const routerUser = Router();
routerUser.route("/register").post(createUser)
routerUser.route("/login").post(loginUser)
routerUser.route("/").post(requireAuth, getUser)



import { createCustomer, getCustomers, updateCustomer, deleteCustomer } from '../controller/customersController';
// Get the customers 
const customerUser = Router();
customerUser.route("/add").post(requireAuth, createCustomer);
customerUser.route("/").get(requireAuth, getCustomers);
customerUser.route("/update").put(requireAuth, updateCustomer);
customerUser.route("/delete").delete(requireAuth, deleteCustomer);


// Leads Controllers 
import { leadController, getLead, updateLead, deleteLead } from "../controller/leadsController"
const leadRoute = Router();
leadRoute.route("/leads/create").post(requireAuth, leadController);
leadRoute.route("/leads/get").get(requireAuth, getLead);
leadRoute.route("/leads/update").put(requireAuth, updateLead);
leadRoute.route("/leads/delete").delete(requireAuth, deleteLead);



// task Controllers 
import { createTask, getTasks, updateTask, deleteTask } from "../controller/taskController"
const taskRoute = Router();
taskRoute.route("/task/create").post(requireAuth, createTask);
taskRoute.route("/task/get").get(requireAuth, getTasks);
taskRoute.route("/task/update").put(requireAuth, updateTask);
taskRoute.route("/task/delete").delete(requireAuth, deleteTask);

// rate limiting , paginnations , sql injections , 

export  {
    routerUser,
    customerUser,
    leadRoute,
    taskRoute
};