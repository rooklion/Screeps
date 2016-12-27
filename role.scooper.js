
module.exports = {
    run: function (creep) {
        if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());

            if (result != -200) {

                var boolIdle = false;


                creep.manageState();
                //to be in line with other roles, the scooper is "working" if it's storing energy it has
                //picked up and "scooping" resources if it is not "working"
                if (creep.memory.working == true) {
                    if (!(creep.storeResources())) {
                        //boolIdle = true;
                    }
                }
                else {
                    let resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                    if (resource) {
                        creep.memory.objectTarget = resource.id;
                        creep.memory.objectAction = 'pickup';
                        if (creep.pickup(resource) == ERR_NOT_IN_RANGE) {
                            creep.moveToTest(resource, { range: 1 });
                        }
                    } else {
                        //if scooper finds no resources, but it is carrying something, just store now
                        if (_.sum(creep.carry) > 0) {
                            creep.memory.working = true;
                        }
                    }
                }
            }
        }
    }
};
