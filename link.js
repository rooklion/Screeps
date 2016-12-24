module.exports = {
    run: function () {
        var local = {};
        var queueTransfer = [];
        for (let l in Memory.links) {
            let link = Memory.links[l];
            let linkObj = Game.getObjectById(link.id);
            if (link.type == 'remote' && (linkObj.energy / linkObj.energyCapacity) > 0.25) {
                queueTransfer.push(linkObj);
            } else if (link.type == 'local') {
                local = linkObj;
            }
        }
        if (local.energy < local.energyCapacity) {
            for (let link in queueTransfer) {
                queueTransfer[link].transferEnergy(local);
            }
        }
    }
};