const utilities = require('./utilities.js');
const Response = require('./response.js');
/*
// this function extract the JSON data from the body of the request
// and and pass it to controller Method
// if an error occurs it will send an error response
function processJSONBody_old(req, res, controller, methodName) {
    let response = new Response(res);
    let body = [];
    req.on('data', chunk => {
        body.push(chunk);
    }).on('end', () => {
        try {
            // we assume that the data is in JSON format
            if (req.headers['content-type'] === "application/json") {
                controller[methodName](JSON.parse(body));
            }
            else
                response.unsupported();
        } catch (error) {
            console.log(error);
            response.unprocessable();
        }
    });
}
*/
function isJSONContent(req, res) {
    if (req.headers['content-type'] !== "application/json") {
        let response = new Response(res);
        response.unsupported();
        return false;
    }
    return true;
}
function getJSONBody(req) {
    return new Promise((resolve) => {
        let body = [];
        req.on('data', chunk => {
            body.push(chunk);
        }).on('end', () => {
            resolve(JSON.parse(body));
        });
    })
}

function makeControllerName(modelName) {
    if (modelName != undefined)
        // by convention controller name -> NameController
        return utilities.capitalizeFirstLetter(modelName) + 'Controller';
    return undefined;
}


exports.dispatch_TOKEN_EndPoint = function (req, res) {
    return new Promise(async (resolve) => {
        let response = new Response(res);
        let url = utilities.removeQueryString(req.url);
        
        if (url == '/token' && req.method == "POST") {
            try {
                // dynamically import the targeted controller
                // if the controller does not exist the catch section will be called
                const Controller = require('./controllers/AccountsController');
                // instanciate the controller       
                let controller = new Controller(req, res);
                if (isJSONContent(req, res)) {
                    let JSONBody = await getJSONBody(req);
                    controller.login(JSONBody);
                }
                resolve(true);
            } catch (error) {
                console.log('endpoint not found');
                console.log(error);
                response.notFound();
                resolve(true);
            }
        }
        // request not consumed
        // must be handled by another middleware
        resolve(false);
    });
}

// {method, ControllerName, Action}
exports.dispatch_Registered_EndPoint = function (req, res) {
    return new Promise(async (resolve) => {
        const RouteRegister = require('./routeRegister');
        let response = new Response(res);
        let route = RouteRegister.find(req);
        if (route != null) {
            try {
                // dynamically import the targeted controller
                // if the controllerName does not exist the catch section will be called
                const Controller = require('./controllers/' + utilities.capitalizeFirstLetter(route.modelName) + "Controller");
                // instanciate the controller       
                let controller = new Controller(req, res);

                if (!controller.requestAuthorized()) {
                    console.log('unauthorized access!');
                    response.unAuthorized();
                    // request consumed
                    resolve(true);
                }

                if (route.method === 'POST' || route.method === 'PUT') {
                    if (isJSONContent(req, res)) {
                        let JSONBody = await getJSONBody(req);
                        controller[route.actionName](JSONBody);
                    }
                }
                else
                    controller[route.actionName](route.id);

                // request consumed
                resolve(true);

            } catch (error) {
                // catch likely called because of missing controller class
                // i.e. require('./' + controllerName) failed
                // but also any unhandled error...
                console.log('endpoint not found');
                console.log(error);
                response.notFound();
                // request consumed
                resolve(true);
            }
        }
        // not an registered endpoint
        // request not consumed
        // must be handled by another middleware
        resolve(false);
    });
}

//////////////////////////////////////////////////////////////////////
// dispatch_API_EndPoint middleware
// parse the req.url that must have the following format:
// /api/{ressource name} or
// /api/{ressource name}/{id}
// then select the targeted controller
// using the http verb (req.method) and optionnal id
// call the right controller function
// warning: this function does not handle sub resource
// of like the following : api/resource/id/subresource/id?....
//
// Important note about controllers:
// You must respect pluralize convention: 
// For ressource name RessourName you have to name the controller
// RessourceNamesController that must inherit from Controller class
/////////////////////////////////////////////////////////////////////
exports.dispatch_API_EndPoint = function (req, res) {
    return new Promise(async (resolve) => {
        let exit = false;
        if (req.url == "/api") {
            const Endpoints = require('./endpoints');
            Endpoints.list(res);
            // request consumed
            resolve(true);
            exit = true;
        }

        if (!exit) {
            let path = utilities.decomposePath(req.url);

            if (!path.isAPI) {
                resolve(false);
            } else {

                let controllerName = makeControllerName(path.model);
                let id = path.id;

                if (controllerName != undefined) {
                    let response = new Response(res);
                    try {
                        // dynamically import the targeted controller
                        // if the controllerName does not exist the catch section will be called
                        const Controller = require('./controllers/' + controllerName);
                        // instanciate the controller       
                        let controller = new Controller(req, res, path.params);

                        if (!controller.requestAuthorized()) {
                            console.log('unauthorized access!');
                            response.unAuthorized();
                            resolve(true);
                        }
                        if (req.method === 'HEAD') {
                            controller.head();
                            // request consumed
                            resolve(true);
                        }
                        if (req.method === 'GET') {
                            controller.get(id);
                            // request consumed
                            resolve(true);
                        }
                        if (req.method === 'POST') {
                            if (isJSONContent(req, res)) {
                                let JSONBody = await getJSONBody(req);
                                controller.post(JSONBody);
                            }
                            // request consumed
                            resolve(true);
                        }
                        if (req.method === 'PUT') {
                            if (isJSONContent(req, res)) {
                                let JSONBody = await getJSONBody(req);
                                controller.put(JSONBody);
                            }
                            // request consumed
                            resolve(true);
                        }
                        if (req.method === 'PATCH') {
                            processJSONBody(req, res, controller, "patch");
                            // request consumed
                            resolve(true);
                        }
                        if (req.method === 'DELETE') {
                            controller.remove(id);
                            // request consumed
                            resolve(true);
                        }
                    } catch (error) {
                        // catch likely called because of missing controller class
                        // i.e. require('./' + controllerName) failed
                        // but also any unhandled error...
                        console.log('endpoint not found');
                        console.log(error);
                        response.notFound();
                        // request consumed
                        resolve(true);
                    }
                } else {
                    // not an API endpoint
                    // request not consumed
                    // must be handled by another middleware
                    resolve(false);
                }
            }
        }
    });
}
