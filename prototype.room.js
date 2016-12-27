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

    Room.prototype.returnLowestEmptyExtFlag =
    function() {
        //COLOR_YELLOW is the color for extension flags
        let roomFlags = _.filter(Game.flags, (f) => f.room.name == this.name && f.color == COLOR_YELLOW);
        //highest secondary color is COLOR_WHITE == 10
        let secColor = COLOR_WHITE + 1;
        let flag = undefined;
        for (let key in roomFlags) {
            let f = roomFlags[key];
            if (f.secondaryColor < secColor) {
                let creeps = this.lookForAt(LOOK_CREEP, f);
                if (creep.length < 1) {
                    flag = f;
                    secColor = flag.secondaryColor;
                }
            }

            if (secColor == COLOR_RED) {
                //COLOR_RED is the first one
                break;
            }
        }
        return flag;
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
