require('prototype.creep')();
var roleScooper = require('role.scooper');
var roleCTARefuge = require('role.CTARefuge')

module.exports = {
    run: function (creep) {

        if (!Memory.CTA[creep.memory.target]) {
            if (creep.room.name == creep.room.target) {
                let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
                if (hostiles.length > 0) {
                    roleCTARefuge.callCTA(creep.room.name, hostiles);
                }
            }
        } else {
            creep.memory.role = 'CTARefuge';
            delete creep.memory._move;
            delete creep.memory.objectTarget;
            delete creep.memory.objectAction;
            roleCTARefuge.run(creep);
        }

        //LDH will act as scoopers in their target room
        let resource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
        if (creep.room.name == creep.memory.target && resource && (_.sum(creep.carry) < creep.carryCapacity)) {
            roleScooper.run(creep);
            return;
        }

        creep.manageState();
        let result = creep.handleMovementCodes(creep.checkMovement());

        if (result == ERR_NOT_ENOUGH_RESOURCES) {
            if (_.some(creep.carry)) {
                creep.memory.working = true;
                delete creep.memory.objectTarget;
                delete creep.memory.objectAction;
            }
        }
        //console.log(result);
        if (result != -200) {
            if (creep.memory.working == true) {
                if (creep.room.name == creep.memory.homePos.roomName) {
                    //var links = [];
                    // for (let link in creep.room.memory.links) {
                    //     //let linkObj = Game.getObjectById(Memory.links[link].id);
                    //     if (link.energy < link.energyCapacity && link.type == "remote") {
                    //         links.push(link);
                    //     }
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
                }
                else {
                    let homePos = new RoomPosition(creep.memory.homePos.x, creep.memory.homePos.y, creep.memory.homePos.roomName);
                    creep.moveToTest(homePos, {range: 1});
                }
            }
            else {

                if (creep.room.name == creep.memory.target) {
                    let memSources = Memory.sources[creep.room.name];
                    var sources = undefined;
                    if (memSources) {
                        sources = memSources;
                    } else {
                        sources = creep.room.find(FIND_SOURCES);
                    }
                    //let sources = memSources ? memSources : creep.room.find(FIND_SOURCES);
                    if (sources != undefined) {

                        //Cache the sources in each room to improve the behavior of harvester movement (they currently sit at exit if node has no energy)
                        if (!Memory.sources[creep.room.name]) {
                            Memory.sources[creep.room.name] = { cached: false }
                        }
                        if (Memory.sources[creep.room.name].cached == false) {
                            Memory.sources[creep.room.name].cached = true;
                            for (let s in sources) {
                                Memory.sources[creep.room.name][s] = { id: sources[s].id, pos: { x: sources[s].pos.x, y: sources[s].pos.y } };
                            }
                        }
                        let source = sources[creep.memory.sourceIndex];
                        source.pos = new RoomPosition(source.pos.x, source.pos.y, creep.room.name);
                        creep.memory.objectTarget = source.id;
                        creep.memory.objectAction = 'harvest';
                        if (creep.pos.isNearTo(source.pos)) {
                            creep.harvest(source);
                        } else {
                            creep.moveToTest(source, { range: 1 });
                        }
                    }
                } else {
                    if (creep.memory.targetPos) {
                        let targetPos = new RoomPosition(creep.memory.targetPos.x, creep.memory.targetPos.y, creep.memory.target);
                        let result = creep.moveToTest(targetPos);
                    } else if (Memory.sources[creep.memory.target]) {
                        let source = Memory.sources[creep.memory.target][creep.memory.sourceIndex];

                        let targetPos = new RoomPosition(source.pos.x, source.pos.y, creep.memory.target);
                        creep.memory.targetPos = targetPos;
                        creep.moveToTest(targetPos, { range: 1 });
                    } else {
                        var exit = creep.room.findExitTo(creep.memory.target);
                        creep.moveToTest(creep.pos.findClosestByRange(exit));
                    }

                }
            }
        }
    }
};
