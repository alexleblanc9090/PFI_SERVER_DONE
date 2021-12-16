module.exports = 
class News{
    constructor(userId, publicationDate, titre, imageGUID, description)
    {
        //AJOUTER UN SHARED COMME PROPRIÉTÉ ???
        this.Id = 0;
        //Validation plus tard sur l'entré ??? ** À voir **
        this.UserId = userId !== undefined ? userId : 0;
        //À revoir pour donner les temps de création
        this.PublicationDate = publicationDate !== undefined ? publicationDate : new Date().getTime();
        this.Titre = titre !== undefined ? titre : "";
        this.ImageGUID = imageGUID !== undefined ? imageGUID : "";
        this.Description = description !== undefined ? description : "";
    }

    //Valid les entrés
    static valid(instance) {
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('Titre','string');
        validator.addField('Description','string');
        validator.addField('UserId','integer');
        return validator.test(instance);
    }
}