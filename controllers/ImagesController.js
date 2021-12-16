const ImagesRepository = require('../models/imagesRepository');
module.exports = 
class ImagesController extends require('./Controller') {
    constructor(req, res, params){
        super(req, res, params,  false /* needAuthorization */);
        this.imagesRepository = new ImagesRepository(req);
    }
   
    head() {
        this.response.JSON(null, this.imagesRepository.ETag);
    }
    get(id){
        // if we have no parameter, expose the list of possible query strings
        if (this.params === null) { 
            if(!isNaN(id)) {
                this.response.JSON(this.imagesRepository.get(id));
            }
            else  
                this.response.JSON( this.imagesRepository.getAll(), 
                                    this.imagesRepository.ETag);
        }
        else {
            if (Object.keys(this.params).length === 0) /* ? only */{
                this.queryStringHelp();
            } else {
                this.response.JSON(this.imagesRepository.getAll(this.params), this.imagesRepository.ETag);
            }
        }
    }
    post(image){  
        if (this.requestActionAuthorized()) {
            let newImage = this.imagesRepository.add(image);
            if (newImage)
                this.response.created(newImage);
            else
                this.response.unprocessable();
        } else 
            this.response.unAuthorized();
    }
    put(image){
        if (this.requestActionAuthorized()) {
            if (this.imagesRepository.update(image))
                this.response.ok();
            else
                this.response.unprocessable();
        } else
            this.response.unAuthorized();
    }
    remove(id){
        if (this.requestActionAuthorized()) {
            if (this.imagesRepository.remove(id))
                this.response.accepted();
            else
                this.response.notFound();
        } else
            this.response.unAuthorized();
    }
}