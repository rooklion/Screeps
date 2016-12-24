require('prototype.creep')();
var roleUpgrader = require('role.upgrader');

module.exports = {
    run: function (creep) {
        if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());

            //if cached results fail and a new one must be generated
            if (result != -200 && result != -202) {
                creep.manageState();

                if (creep.memory.working == true) {
                    //find all conSites
                    var conSites = creep.room.find(FIND_CONSTRUCTION_SITES);

                    //first we want to build containers first.  This is crucial to mining being started or restored
                    var conSites_container  = _.filter(conSites, (cs) => cs.structureType == STRUCTURE_CONTAINER);
                    if (conSites_container.length > 0) {
                        conSites = conSites_container
                    }
                    //if none are found, we'll leave it be

                    if (conSites.length > 0) {  //this check is redundant if there are no containers
                        conSites.sort((a, b) => b.progress - a.progress);
                        //choose the first one.  Best way???
                        var conSite;
                        for (let c in conSites) {
                            conSite = conSites[c];
                            break;
                        }

                        if (conSites != undefined) {
                            creep.memory.objectTarget = conSite.id;
                            creep.memory.objectAction = 'build';
                            if (creep.build(conSite) == ERR_NOT_IN_RANGE) {
                                creep.moveToTest(conSite, { range: 3 });
                            }
                        }
                    }
                    else {
                        roleUpgrader.run(creep);
                    }
                }
                else {
                    creep.gatherEnergy();
                }
            }
        }
    }
};
