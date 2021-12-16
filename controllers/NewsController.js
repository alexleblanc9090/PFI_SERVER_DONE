/*
    Auteurs: Olivier Cooke et Alexandre Leblanc
    Date: 13 décembre 2021
    Travail: PFI échange de données

    DONE FUCK
*/

//Pour la gestion des données des news
const newsRepository = require('../models/newsRepository');

module.exports = 
class NewsController extends require('./Controller') {
    constructor(req, res, params){
        super(req, res, params,  false /* needAuthorization */);
        //Essais de construire une news avec les détails de la requête.
        this.newsRepository = new newsRepository(req);
    }
   
    head() {
        //Regarder si le système de Etag est intégré avec le repository de news
        this.response.JSON(null, this.newsRepository.ETag);
    }

    authors(){
        let authors = [];
        let collection = this.newsRepository.getAll()
        for (let item of collection) {
            if(!authors.includes(item.Username))
                authors.push(item.Username);
        }
        return this.response.JSON(authors, this.newsRepository.ETag)
    }
    //POUR LE CALL DES NEWS...
    get(id){
        // if we have no parameter, expose the list of possible query strings
        if (this.params === null) { 
            if(!isNaN(id)) {
                this.response.JSON(this.newsRepository.get(id));
            }
            else  
                this.response.JSON( this.newsRepository.getAll(), 
                                    this.newsRepository.ETag);
        }
        else {
            if (Object.keys(this.params).length === 0) /* ? only */{
                this.queryStringHelp();
            } 
            else {
                this.response.JSON(this.newsRepository.getAll(this.params), this.newsRepository.ETag);
            }
        }
    }

    //POST -> AJOUT DE NEWS!
    post(news){  
        if (true || this.requestActionAuthorized()) {
            let newNews = this.newsRepository.add(news); // DOIT RETOURNER NULL SI NON VALIDE
            if (newNews) //NOT NULL
                this.response.created(newNews);
            else
                this.response.unprocessable();
        } else 
            this.response.unAuthorized();
    }

    //PUT -> MODIFICATION DE NEWS!
    put(news){
        if (this.requestActionAuthorized()) {
            if (this.newsRepository.update(news))
                this.response.ok(); //ACCEPTED
            else
                this.response.unprocessable();
        } else
            this.response.unAuthorized();
    }

    //REMOVE -> SUPPRESSION DE NEWS!
    remove(id){
        if (this.requestActionAuthorized()) {
            if (this.newsRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        } else
            this.response.unAuthorized();
    }
}