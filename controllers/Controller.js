const Response = require('../response');
const utilities = require('../utilities');
const TokenManager = require('../tokenManager');
/////////////////////////////////////////////////////////////////////
// Important note about controllers:
// You must respect pluralize convention: 
// For ressource name RessourName you have to name the controller
// RessourceNamesController that must inherit from Controller class
// in order to have proper routing from request to controller action
/////////////////////////////////////////////////////////////////////
module.exports =
    class Controller {
        constructor(req, res, params, needAuthorization = false) {
            if (req != null && res != null) {
                this.req = req;
                this.res = res;
                this.response = new Response(res, this.req.url);
                this.params = params;
                // if true, will require a valid bearer token from request header
                this.needAuthorization = needAuthorization;
            }
        }
        requestAuthorized() {
            if (this.needAuthorization) {
                return TokenManager.requestAuthorized(this.req);
            }
            return true;
        }
        requestActionAuthorized() {
            return TokenManager.requestAuthorized(this.req);
        }
        queryStringParamsList() {
            let content = "<div style=font-family:arial>";
            content += "<h4>List of parameters in query strings:</h4>";
            content += "<h4>? sort=key <br> return all words sorted by key values (word)";
            content += "<h4>? sort=key,desc <br> return all words sorted by descending key values";
            content += "<h4>? key=value <br> return the word with key value = value";
            content += "<h4>? key=value* <br> return the word with key value that start with value";
            content += "<h4>? key=*value* <br> return the word with key value that contains value";
            content += "<h4>? key=*value <br> return the word with key value end with value";
            content += "<h4>page?limit=int&offset=int <br> return limit words of page offset";
            content += "</div>";
            return content;
        }
        queryStringHelp() {
            // expose all the possible query strings
            this.res.writeHead(200, { 'content-type': 'text/html' });
            this.res.end(this.queryStringParamsList());
        }
        paramsError(params, message) {
            if (params) {
                params["error"] = message;
                this.response.JSON(params);
            } else {
                this.response.JSON(message);
            }
            return false;
        }
        head() {
            this.response.notImplemented();
        }
        getAll() {
            this.response.notImplemented();
        }
        get(id) {
            this.response.notImplemented();
        }
        post(obj) {
            this.response.notImplemented();
        }
        put(obj) {
            this.response.notImplemented();
        }
        patch(obj) {
            this.response.notImplemented();
        }
        remove(id) {
            this.response.notImplemented();
        }
    }