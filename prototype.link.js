module.exports = function () {
    StructureLink.prototype.checkTransfer =
        function () {
            if ((this.energy / this.energyCapacity) > 0.25) {
                let local = this.findLocalLink();
                if (local != undefined) {
                    this.transferEnergy(local);
                }
            }
        }

    StructureLink.prototype.findLocalLink =
        function () {
            let links = this.room.memory.links;
            for (let l in links) {
                let link = Game.getObjectById(l);
                if (link.memory.type == 'local') {
                    return link;
                }
            }
            return undefined;
        }
};

 Object.defineProperty(StructureLink.prototype, 'memory', {
    get: function () {
        if (_.isUndefined(this.room.memory.links)) {
            this.room.memory.links = {};
        }
        if (!_.isObject(this.room.memory.links)) {
            return undefined;
        }
        return this.room.memory.links[this.id] = this.room.memory.links[this.id] || {};
    },
    set: function (value) {
        if (_.isUndefined(this.room.memory.links)) {
            Memory.links = {};
        }
        if (!_.isObject(this.room.memory.links)) {
            throw new Error('Could not set link memory');
        }
        this.room.memory.links[this.id] = value;
    }
});
