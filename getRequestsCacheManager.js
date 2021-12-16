const utilities = require('./utilities');
const serverVariables = require("./serverVariables");
let getRequestsCacheExpirationTime = serverVariables.get("main.getRequestscache.expirationTime");

// Get requests cache
let getRequestsCache = [];

class GetRequestsCacheManager {
   
    static add(url, content, ETag = "") {
        if (url != "") {
            getRequestsCache.push({url, content, ETag, expireIn: utilities.nowInSeconds() + getRequestsCacheExpirationTime});
            console.log("Response content added in GET requests cache");
        }
    }
    static find(url) {
        try {
            if (url != "") {
                for(let endpoint of getRequestsCache){
                    if (endpoint.url == url) {
                        // renew cached url
                        endpoint.expireIn = utilities.nowInSeconds() + getRequestsCacheExpirationTime;
                        console.log("Response content retreived from GET requests cache");
                        let content = endpoint.content;
                        let ETag = endpoint.ETag;
                        return {ETag, content};
                    }
                }
            }
        } catch(error) {
            console.log("GET requests cache error", error);
        }
        return null;
    }
    static clear(url) {
        if (url != "") {
            let indexToDelete = [];
            let index = 0;
            for(let endpoint of getRequestsCache){
                if (endpoint.url.indexOf(url) > -1) indexToDelete.push(index);
                index ++;
            }
            if (index > 0)
                utilities.deleteByIndex(getRequestsCache, indexToDelete);
        }
    }
    static flushExpired() {
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for(let endpoint of getRequestsCache){
            if (endpoint.expireIn < now) {
                console.log("Cached GET requests", endpoint.url + " expired");
                indexToDelete.push(index);
            }
            index ++;
        }
        utilities.deleteByIndex(getRequestsCache, indexToDelete);
    }
}

// periodic cleaning of expired cached GET request
setInterval(GetRequestsCacheManager.flushExpired, getRequestsCacheExpirationTime * 1000);
console.log("Periodic GET requests cache cleaning process started...");

module.exports = GetRequestsCacheManager;