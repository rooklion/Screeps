var movement = require('movement');
var utils = require('utils');

var MOV_ARRIVED = -100,
    MOV_NO_MOVE = -101,
    MOV_RET_NO_ACTION = -102;

var MOVEMENT_OK = -200,
    REPAIR_OK = -201,
    BUILD_OK = -202,
    HARVEST_OK = -203,
    UPGRADE_OK = -204;

//Number of ticks a creep will wait for movement before recalculating
var MAX_IDLE_TIME = 3;

module.exports = function () {


    Creep.prototype.manageRoomTarget =
        function () {
            if (this.memory.target != undefined && this.room.name != this.memory.target) {
                let exit = this.room.findExitTo(this.memory.target);
                this.moveToTest(this.pos.findClosestByRange(exit));
                return true;
            }
            else {
                this.moveFromRoomEdge();
                return false;
            }
        }

    Creep.prototype.manageState =
        function () {
            if (this.memory.working == true && _.sum(this.carry) == 0) {
                this.memory.working = false;
            }
            else if (this.memory.working == false && _.sum(this.carry) == this.carryCapacity) {
                this.memory.working = true;
            }
        }

    Creep.prototype.gatherEnergy =
        function (boolNoSources, target) {
            var local = {}
            for (let l in this.room.memory.links) {
                let link = Game.getObjectById(l);
                if (link.memory.type == 'local') {
                    local = link;
                    break;
                }
            }
            if (target == undefined) {
                if (local.energy > 0) {
                    target = local;
                } else if (this.room.storage) {
                    if (this.room.storage.store[RESOURCE_ENERGY] >= this.carryCapacity) {
                        target = this.room.storage;
                    }
                } else {
                    //lorries will take from any container if there is energy at all.  All others will wait for a surplus
                    //Energy should first route to spawning
                    let containers = this.room.find(FIND_STRUCTURES, {
                        filter: (s) => s.structureType == STRUCTURE_CONTAINER
                        && s.store[RESOURCE_ENERGY] >= (this.memory.role == 'lorry' ? 0 : this.carryCapacity)
                    });
                    //console.log(containers.length);
                    target = this.findClosestByPathFinder(containers, { range: 1 });
                }
            }

            //now check again
            if (target != undefined) {
                this.memory.objectTarget = target.id;
                this.memory.objectAction = 'gather';
                if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveToTest(target, {range: 1});
                }
                //consider changing the return code???
                return true;
            }
            else if (!(boolNoSources)) {
                this.harvestSource();
                //consider changing the return code???
                return true;
            } else {
                return false;
            }
        }



    Creep.prototype.storeEnergy =
        function (boolIncludeSpawner, boolNoContainers, target) {
            if (target == undefined) {
                if (boolIncludeSpawner) {
                    //fill towers and extensions first.  Spawn will fill itself constantly this way.
                    let structures = this.room.find(FIND_MY_STRUCTURES, {
                        filter: (s) => (
                               s.structureType == STRUCTURE_EXTENSION
                               || s.structureType == STRUCTURE_TOWER)
                               && s.energy < s.energyCapacity
                    })
                    target = this.findClosestByPathFinder(structures, { range: 1 });

                    //if none found, we'll fill the spawn up instead now
                    if (target == undefined) {
                        let structures = this.room.find(FIND_MY_STRUCTURES, {
                            filter: (s) => s.structureType == STRUCTURE_SPAWN
                            && s.energy < s.energyCapacity
                        })
                        target = this.findClosestByPathFinder(structures, { range: 1 });
                    }
                }
                else {
                    if (!(boolNoContainers)) {
                        let containers = this.room.find(FIND_STRUCTURES, {
                            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE)
                            && _.sum(s.store) < s.storeCapacity
                        });
                        target = this.findClosestByPathFinder(containers, { range: 1 });
                    }
                }
            }

            //now check again
            if (target != undefined) {
                this.memory.objectTarget = target.id;
                this.memory.objectAction = 'store';
                let result = this.transfer(target, RESOURCE_ENERGY);
                if (result == ERR_NOT_IN_RANGE) {
                    //If creep was previously parked, this will allow it to send messages again next time.
                    this.memory.boolSentMessage = false;
                    return this.moveToTest(target, {range: 1});

                } else {
                    return result;
                }
            }
        }

    Creep.prototype.storeResources =
        function (target) {
            if (target == undefined) {
                let containers = this.room.find(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE)
                    && _.sum(s.store) < s.storeCapacity
                });
                target = this.findClosestByPathFinder(containers, { range: 1 });
            }

            //check again now
            if (target != undefined) {
                this.memory.objectTarget = target.id;
                this.memory.objectAction = 'storeResource';
                var result = false;
                for (var resourceType in this.carry) {
                    if (_.some(this.carry, (amount, resource) => amount && this.transfer(target, resource) !== undefined)) {
                        this.moveToTest(target, {range: 1});
                        result = false;
                        break;
                    } else {
                        result = true;
                    }
                }
                return result;
            }
        }

    Creep.prototype.harvestSource =
        function (target) {
            if (target == undefined) {
                //var source = this.pos.findClosestByPath(FIND_SOURCES)
                target = this.pos.findClosestByPath(FIND_SOURCES);
            }

            if (target != undefined) {
                this.memory.objectTarget = target.id;
                this.memory.objectAction = 'harvest';
                if (this.harvest(target) == ERR_NOT_IN_RANGE) {
                    //this.moveTo(source);
                    this.moveToTest(target, {range: 1});
                }
            }
        }

    /*Creep.prototype.moveToTest =
        function (arg1, arg2, opts) {
            var [x,y,roomName] = utils.fetchXYArguments(arg1, arg2);
            roomName = roomName || this.pos.roomName;
            if(_.isUndefined(x) || _.isUndefined(y)) {
                return C.ERR_INVALID_TARGET;
            }

            var targetPos = new RoomPosition(x,y,roomName);

            if(_.isObject(arg1)) {
                opts = _.clone(arg2);
            }
            opts = opts || {};


                // We need to set the defaults costs higher so that we
                // can set the road cost lower in `roomCallback`
            opts.plainCost = 2;
            opts.swampCost = 10;

            opts.roomCallback = function (roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since PathFinder
                // supports searches which span multiple rooms you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_STRUCTURES).forEach(function (structure) {
                    if (structure.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
                        costs.set(structure.pos.x, structure.pos.y, 1);
                    } else if (structure.structureType !== STRUCTURE_CONTAINER &&
                               (structure.structureType !== STRUCTURE_RAMPART ||
                                !structure.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(structure.pos.x, structure.pos.y, 0xff);
                    }
                });

                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function (creep) {
                    costs.set(creep.pos.x, creep.pos.y, 0xff);
                });

                return costs;
            }

            var targetPos = new RoomPosition(x, y, roomName);
            //if (this.memory.role == 'builder') {
                //console.log(this.name);
                //console.log(targetPos);
            //}

            let res = this.moveToByPathFinder(targetPos, opts);

            //return this.moveTo(arg1, arg2, arg3);
        }*/

    Creep.prototype.moveToTest =
        function (arg1, arg2, opts) {
            var [x,y,roomName] = utils.fetchXYArguments(arg1, arg2);
            roomName = roomName || this.pos.roomName;
            if(_.isUndefined(x) || _.isUndefined(y)) {
                return ERR_INVALID_TARGET;
            }

            var targetPos = new RoomPosition(x,y,roomName);

            if(_.isObject(arg1)) {
                opts = _.clone(arg2);
            }
            opts = opts || {};


            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            opts.plainCost = 2;
            opts.swampCost = 10;

            opts.roomCallback = function (roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since PathFinder
                // supports searches which span multiple rooms you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_STRUCTURES).forEach(function (structure) {
                    if (structure.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
                        costs.set(structure.pos.x, structure.pos.y, 1);
                    } else if (structure.structureType !== STRUCTURE_CONTAINER &&
                               (structure.structureType !== STRUCTURE_RAMPART ||
                                !structure.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(structure.pos.x, structure.pos.y, 0xff);
                    }
                });

                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function (creep) {
                    costs.set(creep.pos.x, creep.pos.y, 0xff);
                });

                return costs;
            }

            var targetPos = new RoomPosition(x, y, roomName);
            //if (this.memory.role == 'builder') {
            //console.log(this.name);
            //console.log(targetPos);
            //}

            //let res = this.moveToByPathFinder(targetPos, opts);
            let res = this.moveTo(targetPos, opts);
            return res;
            //return this.moveTo(arg1, arg2, arg3);
        }

    Creep.prototype.findClosestByPathFinder = function (targets, opts) {
        var results = [];
        var goal = undefined;
        var range = 0;
        opts = opts || {};
        if ('range' in opts) {
            range = opts.range;
        }
        var cheapest;
        for (let t in targets) {
            let target = targets[t];
            if (target instanceof RoomPosition) {
                goal = { pos: target, range: range };
            }
            else if (target instanceof RoomObject) {
                goal = { pos: target.pos, range: range };
            }
            let result = PathFinder.search(this.pos, goal, opts);

            result.target = target;
            if (cheapest == undefined) {
                cheapest = result;
            } else {
                if (result.cost < cheapest.cost) {
                    cheapest = result;
                }
            }
            //results.push(result);
        }
        //var cheapest = results[0];
        //for (r of results) {
        //    if (r.cost < cheapest.cost) {
        //        cheapest = r;
        //    }
        //}
        if (cheapest) {
            return cheapest.target;
        }
        else {
            return undefined;
        }
    }

    /*Creep.prototype.moveToByPathFinder = function (targetPos, opts) {
        if (!_.isObject(opts)) {
            return ERR_INVALID_ARGS;
        }
        if (!this.my) {
            return ERR_NOT_OWNER;
        }
        if (this.spawning) {
            return ERR_BUSY
        }
        if (this.fatigue > 0) {
            return ERR_TIRED
        }
        //if (!this.hasActiveBodyparts(MOVE)) {
        if (this.getActiveBodyparts(MOVE) < 1) {
            return ERR_NO_BODYPART;
        }


        const reusePath = _.isObject(this.memory) && ('reusePath' in opts ? opts.reusePath : 3);

        //console.log(goals);
        let result = PathFinder.search(this.pos, targetPos, opts);
        const path = result.path;
        //const path = findPathPathFinder(this.pos, targetPos, opts);

        //const path = result.path;
        //const dest = path[path.length - 1];


        if (reusePath) {
            this.memory._move = {
                dest: {
                    x: targetPos.x,
                    y: targetPos.y,
                    room: targetPos.roomName,
                },
                time: Game.time,
                path: Room.serializePath(path),
                room: this.pos.roomName,
            }
        }

        return this.moveByPath(path);

        //var destRP = path[path.length - 1];

    }*/

    Creep.prototype.checkMovement = function () {
        if (this.memory.oldPos.x != this.pos.x || this.memory.oldPos.y != this.pos.y || this.memory.oldPos.roomName != this.pos.roomName) {
            this.memory.moved = true;
            this.memory.idleTime = 0;
        }
        else {
            this.memory.moved = false;
            this.memory.idleTime++;
        }

        if (this.memory.idleTime >= MAX_IDLE_TIME) {
            this.memory.idleTime = 0;
            delete this.memory._move;
        }


        var _move = this.memory._move;

        if (_.isObject(_move)) {

            //console.log(_move.path);
            const targetPos = new RoomPosition(_move.dest.x, _move.dest.y, _move.dest.room);

            if (this.pos.isNearTo(targetPos)) {
                if (this.pos.isEqualTo(targetPos)) {
                    return MOV_ARRIVED;
                } else {
                    //console.log(this.name + ": near");
                //  this.memory.moving = true;
                //  console.log(this.name);
                //  return this.move(this.pos.getDirectionTo(targetPos));
                }
            }
            else {
                this.memory.moving = true;
                var byPathResult = this.moveByPath(_move.path);
                return byPathResult;
            }
        }
        return MOV_NO_MOVE;

    }

    Creep.prototype.handleMovementCodes = function (code) {
        var result;
        var target = Game.getObjectById(this.memory.objectTarget);


        switch (code) {

            //No move or move arrived should have same action??  Think this one through..
            case MOV_NO_MOVE:
            case MOV_ARRIVED:
                delete this.memory._move;
                this.memory.moving = false;

                if (this.memory.objectAction) {
                    switch (this.memory.objectAction) {
                        case 'store':
                            //if (creep.memory.role == 'lorry') {
                            //    boolIncludeSpawner = true;
                            //    boolNoContainers = true;
                            //} else if (creep.memory.role == 'harvester') {
                            //    boolIncludeSpawner = true;
                            //    boolNoContainers = false;
                            //} else if (creep.memory.role == 'longDistanceHarvester') {
                            //    boolIncludeSpawner = false;
                            //    boolNoContainers = false;
                            //}
                            var boolIncludeSpawner = (this.memory.role == 'longDistanceHarvester') ? false : true;
                            var boolNoContainers = (this.memory.role == 'lorry') ? true : false;
                            result = this.storeEnergy(boolIncludeSpawner, boolNoContainers, target)
                            break;
                        case 'gather':
                            var boolNoSources = (this.memory.role == 'lorry') ? true : false;

                            result = this.gatherEnergy(boolNoSources, target);
                            break;

                        case 'build':
                            result = this.build(target);
                            if (result == OK) {
                                result = BUILD_OK;
                            }

                            break;

                        case 'claim':
                            break;

                        case 'harvest':
                            result = this.harvest(target);
                            if (result == OK) {
                                result = HARVEST_OK;
                            }
                            break;

                        case 'mine':
                            let container = Game.getObjectById(this.memory.containerId);
                            if (this.pos.isEqualTo(container)) {
                               result = this.harvest(target);
                               if (result == OK) {
                                   result = HARVEST_OK;
                               }
                            } else {
                                this.moveToTest(container.pos, { range: 0 });
                            }
                            break;

                        case 'repair':
                            result = this.repair(target);
                            if (result == OK) {
                                result = REPAIR_OK;
                            }
                            break;

                        case 'upgrade':

                            result = this.upgradeController(target);
                            if (result == OK) {
                                result = UPGRADE_OK;
                            }
                            break;

                        case 'pickup':
                            result = this.pickup(target);
                            break;

                        case 'storeResource':
                            for (var resourceType in this.carry) {
                                if (_.some(this.carry, (amount, resource) => amount && this.transfer(target, resource) !== undefined)) {
                                    this.moveToTest(target, {range: 1});
                                    result = MOV_RET_NO_ACTION;
                                    break;
                                }
                            }
                            result = -1;
                            break;

                        case 'gatherResource':
                            //this needs an action
                            return MOV_RET_NO_ACTION;
                            break;

                        default:
                            console.log("(" + this.name + ") Unhandled objectAction: " + this.memory.objectAction);
                    }
                } else {
                    return MOV_RET_NO_ACTION;
                }
                break;

            case OK:
                result = MOVEMENT_OK;
                break;

            case ERR_NOT_FOUND:
                //console.log(this.name + ": ERR_NOT_FOUND");
                break;

            case ERR_INVALID_ARGS:
                break;

            case ERR_NOT_OWNER:
                break;

            case ERR_BUSY:
                break;

            case ERR_TIRED:
                break;

            case ERR_NO_BODYPART:
                break;

            default:
                console.log('Unhandled error in creep movement: ' + code);
        }

        if (result == undefined) {
            delete this.memory.objectTarget;
            delete this.memory.objectAction;
        }
        return result;

    }

    Creep.prototype.moveFromRoomEdge =
    function () {
        if (this.pos.x == 0) {
            this.move(RIGHT);
            return true;
        } else if (this.pos.x == 49) {
            this.move(LEFT);
            return true;
        } else if (this.pos.y == 0) {
            this.move(BOTTOM);
            return true;
        } else if (this.pos.y == 49) {
            this.move(TOP);
            return true;
        }
        return false;
    }

    /**
    * Utility function turning a direction constant into a dx/dy difference.
    */
    //const directionToDxDy = function (dir) {
    //    switch (dir) {
    //        case TOP:
    //            return [0, -1];
    //        case TOP_RIGHT:
    //            return [1, -1];
    //        case RIGHT:
    //            return [1, 0];
    //        case BOTTOM_RIGHT:
    //            return [1, 1];
    //        case BOTTOM:
    //            return [0, 1];
    //        case BOTTOM_LEFT:
    //            return [-1, 1];
    //        case LEFT:
    //            return [-1, 0];
    //        case TOP_LEFT:
    //            return [-1, -1];
    //        default:
    //            return null;
    //    }
    //}

    /**
     * Utility function turning a dx/dy difference into a direction constant.
     *
     * Note: ignores magnitude of arguments, and only looks at sign.
     */
    //const dxDyToDirection = function (dx, dy) {
    //    if (dx < 0) {
    //        if (dy < 0) {
    //            return TOP_LEFT;
    //        } else if (dy > 0) {
    //            return BOTTOM_LEFT;
    //        } else {
    //            return LEFT;
    //        }
    //    } else if (dx > 0) {
    //        if (dy < 0) {
    //            return TOP_RIGHT;
    //        } else if (dy > 0) {
    //            return BOTTOM_RIGHT;
    //        } else {
    //            return RIGHT;
    //        }
    //    } else {
    //        if (dy < 0) {
    //            return TOP;
    //        } else if (dy > 0) {
    //            return BOTTOM;
    //        } else {
    //            // both dx and dy are 0!
    //            return null;
    //        }
    //    }
    //}

    /**
    * Searches for a path using PathFinder and the given opts, turns the path into a Room.findPath-compatible
    * serialized result, and returns that result.
    *
    * Please ensure that all arguments have been validated when passing in, and that targetPos is a raw position
    * (not a RoomObject with a pos property).
    */
    /*const findPathPathFinder = function (originPos, targetPos, options) {
        const result = PathFinder.search(
            originPos,
            {
                pos: targetPos,
                range: 'range' in options ? options.range : 1,
            },
            options
        );

        const path = result.path;
        var resultStringArray = []; // it's faster to use [...].join('') than to continuously add to a string.
        var roomToConvert = originPos.roomName;

        if (path.length < 1) {
            return '';
        }

        // The serialized format starts with the second position's x and y values, then the direction from the
        // first pos to second, then direction from second to third, etc.

        if (path[0].x > 9) {
            resultStringArray.push(path[0].x);
        } else {
            resultStringArray.push(0, path[0].x); // 0-pad
        }
        if (path[0].y > 9) {
            resultStringArray.push(path[0].y);
        } else {
            resultStringArray.push(0, path[0].y); // 0-pad
        }

        var last_x = originPos.x;
        var last_y = originPos.y;
        var pos, dx, dy, dir;
        for (var i = 0; i < path.length; i++) {
            pos = path[i];
            dx = pos.x - last_x;
            dy = pos.y - last_y;
            if (dx === -49) {
                dx = 1;
            } else if (dx === 49) {
                dx = -1;
            }
            if (dy === -49) {
                dy = 1;
            } else if (dy === 49) {
                dy = -1;
            }

            resultStringArray.push(dxDyToDirection(dx, dy));
            if (pos.roomName != roomToConvert) {
                break;
            }
            last_x = pos.x;
            last_y = pos.y;
        }
        return resultStringArray.join('');
    }

    Creep.prototype.defaultMoveByPath = Creep.prototype.moveByPath;
    */

    /**
     * Version of moveByPath, built to read raw serialized path strings without deserializing.
     *
     * If passed a non-string argument, this will just invoke the default moveByPath code.
     *
     * When passed a string, it should behave identically to the default moveByPath, but hopefully slightly faster.
     */
    /*Creep.prototype.moveByPath = function (path) {
        if (!_.isString(path)) {
            //console.log(this.name);
            return this.defaultMoveByPath(path);
        }
        var path_len = path.length;
        if (path_len < 5) {
            return ERR_NO_PATH;
        }
        var my_x = this.pos.x, my_y = this.pos.y;
        var x_to_check = +path.slice(0, 2);
        var y_to_check = +path.slice(2, 4);
        var dir, dxdy;
        // The path serialization format basically starts with the second position x, second position y, and then
        // follows with a list of directions *to get to each position*. To clarify, the first direction, at idx=4,
        // gives the direction *from the first position to the second position*. So, to find the first position,
        // we subtract that! I do think this is actually more performant than trying to do any more complicated
        // logic in the loop.
        dxdy = directionToDxDy(+path[4]);
        x_to_check -= dxdy[0];
        y_to_check -= dxdy[1];
        // Since we start at 4 again, we'll be re-adding what we just subtracted above - this lets us check both the
        // first and second positions correctly!
        for (var idx = 4; idx < path_len; idx++) {
            // Essentially at this point, *_to_check represent the point reached by the *last* movement (the pos
            // reached by the movement at (idx - 1) since idx just got incremented at the start of this loop)
            // Also, if this is the first iteration and x/y_to_check match the first pos, idx is at 4, the fifth
            // pos, directly after the initial x/y, and also the first direction to go!
            if (x_to_check === my_x && y_to_check == my_y) {
                dir = +path[idx];
                return this.move(dir);
            }
            dxdy = directionToDxDy(+path[idx]);
            if (dxdy === null) {
                return ERR_INVALID_ARGS;
            }
            x_to_check += dxdy[0];
            y_to_check += dxdy[1];
        }
        return ERR_NOT_FOUND;
    }*/



};
