require('prototype.creep')();
var roleScooper = require('role.scooper');
var roleCTARefuge = require('role.CTARefuge')

module.exports = {
    run: function (creep) {
        let container = Game.getObjectById(creep.memory.container);
        if (!Memory.CTA[container.pos.roomName]) {
            if (creep.room.name == container.pos.roomName) {
                let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                if (hostiles.length > 0) {
                    roleCTARefuge.callCTA(creep.room.name, hostiles);
                    roleCTARefuge.run(creep);
                    return;
                }
            }
        } else {
            creep.memory.role = 'CTARefuge';
            delete creep.memory._move;
            delete creep.memory.objectTarget;
            delete creep.memory.objectAction;
            roleCTARefuge.run(creep);
            return;
        }

        //if (!(creep.manageRoomTarget())) {
            let result = creep.handleMovementCodes(creep.checkMovement());
            if (result != -200) {
                creep.manageState();
                if (creep.memory.working == true) {
                    if (creep.room.name == creep.memory.homePos.roomName) {
                        // if (creep.room.storage) {
                        //     creep.memory.objectTarget = creep.room.storage.id;
                        //     creep.memory.objectAction = 'storeResources';
                        //     if (creep.storeResources(creep.room.storage) == false) {
                        //         creep.moveToTest(creep.room.storage, { range: 1 });
                        //     }
                        // } else {
                        //     //if there is no storage, just deposit anywhere.  This is not ideal though...
                        //     creep.storeEnergy(true);
                        // }
                        let containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (s) => ((s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE)
                            && _.sum(s.store) < s.storeCapacity)
                            || (s.structureType == STRUCTURE_LINK && s.energy < s.energyCapacity && s.memory.type == 'remote')
                        });
                        //containers = links.concat(containers);
                        let container = creep.findClosestByPathFinder(containers, { range: 1 });

                        if (container != undefined) {
                            creep.memory.objectTarget = container.id;
                            creep.memory.objectAction = 'store';
                            let result = creep.transfer(container, RESOURCE_ENERGY);
                            if (result == ERR_NOT_IN_RANGE) {
                                creep.moveToTest(container, { range: 1 });
                            } else if (result == ERR_FULL) {
                                delete this.memory.objectTarget;
                                delete this.memory.objectAction;
                                delete this.memory._move;
                            }
                        }
                    } else {
                        let homePos = new RoomPosition(creep.memory.homePos.x, creep.memory.homePos.y, creep.memory.homePos.roomName);
                        creep.moveToTest(homePos, {range: 1});
                    }
                }
                else {
                    //let container = Game.getObjectById(creep.memory.container);
                    if (creep.room.name == container.pos.roomName) {
                        let resources = creep.room.find(FIND_DROPPED_RESOURCES);
                        if (container == undefined || (resources.length > 0 && _.sum(container.store) < container.storeCapacity / 2)) {
                            roleScooper.run(creep);
                            return;
                        } else {
                            creep.memory.objectTarget = container.id;
                            creep.memory.objectAction = 'gatherResource';


                            if (creep.pos.isNearTo(container.pos)) {
                                if (_.sum(container.store) >= creep.carryCapacity) {
                                    for (var resourceType in container.store) {
                                        if (_.sum(creep.carry) < creep.carryCapacity) {
                                            creep.withdraw(container, resourceType);
                                        }
                                    }
                                }
                        } else {
                            return creep.moveToTest(container.pos, { range: 1 });
                        }
                    }
                } else {
                    creep.moveToTest(container.pos, {range: 1});
                }
            }
        }
        //}
    }
};
