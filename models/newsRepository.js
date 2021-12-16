const Repository = require('./repository');
const ImageFilesRepository = require('./imageFilesRepository.js');
const News = require('./news.js');
const utilities = require("../utilities");

module.exports = 
class NewsRepository extends Repository {
    constructor(req){
        super('News', true);
        this.users = new Repository('Users');
        this.req = req;
        this.setBindExtraDataMethod(this.bindUsernameAndImageURL);
    }
    /*
        Détails: Reçois une news en paramètre. Vérifie que la news n'est pas null, sinon retourne
        null. 
    */


    bindUsernameAndImageURL(news){
        if (news) {
            let user = this.users.get(news.UserId);
            let username = "unknown";
            let imageProfile = "";
            if (user !== null)
            {
                username = user.Name;
                imageProfile = user.AvatarGUID;
            }

            let bindedImage = {...news};
            bindedImage["Username"] = username;
            bindedImage["imageProfile"] = imageProfile;
            bindedImage["Date"] = utilities.secondsToDateString(news["PublicationDate"]);
            if (news["ImageGUID"] != ""){
                bindedImage["OriginalURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(news["ImageGUID"]);
                bindedImage["ThumbnailURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getThumbnailFileURL(news["ImageGUID"]);
            } else {
                bindedImage["OriginalURL"] = "";
                bindedImage["ThumbnailURL"] = "";
            }
            return bindedImage;
        }
        return null;
    }



    bindImageURL(news){
        if (news) {
            //Ajoute à une liste qui est retourné...
            let bindedUser = {...news};
            if (news["ImageGUID"] != ""){
                bindedUser["ImageURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(news["ImageGUID"]);
            } else {
                bindedUser["AvatarURL"] = "";
            }
            return bindedUser;
        }
        return null;
    }

    bindImageURLS(images){
        let bindedUsers = [];
        for(let image of images) {
            bindedUsers.push(this.bindAvatarURL(image));
        };
        return bindedUsers;
    }


    //PAS DE BESOIN ?? -> VA DIRECTEMENT CHERCHER get et getAll de Repository.js

    /*get(id) {
        return this.bindAvatarURL(super.get(id));
    }*/

    /*getAll() {
        return this.bindImagesURLS(super.getAll()); // retourne contenu + l'image..
    }*/

    //APPELER PAR POST DE NewsController.js
    add(news) {
        news["PublicationDate"] = utilities.nowInSeconds();
        if (News.valid(news)) {
            news["ImageGUID"] = ImageFilesRepository.storeImageData("", news["ImageData"]);
            delete news["ImageData"];
            return this.bindImageURL(super.add(news));
        }
        return null;
    }

    //APPELER PAR PUT DE NewsController.js
    update(news) {
        news["PublicationDate"] = 0; // will take the original creation date, see lower
        if (News.valid(news)) { //VOIR LA VALIDATION DANS News.js -> AVANT LA MODIFICATION
            let foundNews = super.get(news.Id);
            if (foundNews != null) { // SI NOUS AVONS TROUVÉ LA NEWS DANS LA BANQUE DE DONNÉES
                news["PublicationDate"] = foundNews["PublicationDate"]; //-> Garde la date de création d'origine
                /* À REVOIR */
                news["ImageGUID"] = ImageFilesRepository.storeImageData(foundNews["ImageGUID"], news["ImageData"]); // ImageData ?
                delete news["ImageData"]; //C'EST QUOI ÇA
                
                return super.update(news);
            }
        }
        return false; // MODIFICATION NON EFFECTUÉ
    }


    //APPELER PAR REMOVE DE NewsController.js
    remove(id){       
        let foundNews = super.get(id);
        if (foundNews) { //NOT NULL (Trouvé)
            ImageFilesRepository.removeImageFile(foundNews["ImageGUID"]);
            return super.remove(id);
        }
        return false;
    }
}