const utilities = require("../utilities");
const serverVariables = require("../serverVariables");
let repositoryCachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");

// Repository file data models cache
let repositoryCaches = [];

class RepositoryCachesManager {
    static add(model, data) {
        if (model != "") {
            RepositoryCachesManager.clear(model);
            repositoryCaches.push({
                model,
                data,
                expireIn: utilities.nowInSeconds() + repositoryCachesExpirationTime
            });
            console.log("File data of " + model + ".json added in respository cache");
        }
    }
    static clear(model) {
        if (model != "") {
            let indexToDelete = [];
            let index = 0;
            for (let cache of repositoryCaches) {
                if (cache.model == model) indexToDelete.push(index);
                index++;
            }
            utilities.deleteByIndex(repositoryCaches, indexToDelete);
        }
    }
    static find(model) {
        try {
            if (model != "") {
                for (let cache of repositoryCaches) {
                    if (cache.model == model) {
                        // renew cache
                        cache.expireIn = utilities.nowInSeconds() + repositoryCachesExpirationTime;
                        console.log("File data of " + model + ".json retreived from respository cache");
                        return cache.data;
                    }
                }
            }
        } catch (error) {
            console.log("repository cache error!", error);
        }
        return null;
    }
    static flushExpired() {
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for (let cache of repositoryCaches) {
            if (cache.expireIn < now) {
                console.log("Cached file data of " + cache.model + ".json expired");
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(repositoryCaches, indexToDelete);
    }
}
// periodic cleaning of expired cached repository data
setInterval(RepositoryCachesManager.flushExpired, repositoryCachesExpirationTime * 1000);
console.log("Periodic respository caches cleaning process started...");

module.exports = RepositoryCachesManager;