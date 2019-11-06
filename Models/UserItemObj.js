
class UserItemObj {
    constructor(item, rating, madeIt) {
        this.item = item;
        this.rating = rating;
        this.madeIt = madeIt;
    }
    setItem(item) {
        this.item = item;
    };
    getItem() {
        return this.item;
    }

    setRating(rating) {
        this.rating = rating;
    }

    getRating() {
        return rating;
    }

    setMadeIt(madeIt) {
        this.madeIt = madeIt;
    }

    getMadeIt() {
        return this.madeIt;
    }

}
module.exports = UserItemObj;
