module.exports = function () {
    Room.prototype.cacheSources =
    function() {;
        if (_.sum(this.sources) == 0) {
            if (Memory.roomVisibilities.indexOf(this.name) > -1) {
                this.sources = this.find(FIND_SOURCES);
            }
        }
    }

    Room.prototype.getSources =
    function () {
        this.cacheSources();
        //console.log(this.sources);
    }
};

Object.defineProperty(Room.prototype, 'sources', {
   get: function () {
       if (_.isUndefined(this.memory.sources)) {
           this.memory.sources = {};
       }
       if (!_.isObject(this.memory.sources)) {
           return undefined;
       }
       return this.memory.sources[this.id] = this.memory.sources[this.id] || {};
   },
   set: function (value) {
       if (_.isUndefined(this.memory.sources)) {
           this.memory.sources = {};
       }
       if (!_.isObject(this.memory.sources)) {
           throw new Error('Could not set link memory');
       }
       this.memory.sources[this.id] = value;
   }
});
