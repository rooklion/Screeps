module.exports = function () {
    StructureSpawn.prototype.createCustomCreep =
        function (energy, roleName, target, opts) {
            var energyUsed = 0;
            var numParts = Math.floor(energy / 250);
            if (numParts > 12) {
                numParts = 12;
            }
            var body = [];
            for (let i = 0; i < numParts; i++) {
                body.push(WORK);
                energyUsed += 100;
            }
            for (let i = 0; i < numParts; i++) {
                body.push(CARRY);
                energyUsed += 50;
            }
            //should double up the move parts
            for (let i = 0; i < numParts * 2; i++) {
                body.push(MOVE);
                energyUsed += 50;
            }

            let newOpts = {
                role: roleName,
                energyUsed: energyUsed,
                working: false,
                target: target,
                homePos: this.pos
            };

            let result = this.createCreep(body, undefined, Object.assign(newOpts, opts));

            // return this.createCreep(body, undefined, {
            //     role: roleName,
            //     energyUsed: energyUsed,
            //     working: false,
            //     target: target,
            //     homePos: this.pos
            // });
            return result;
        };

    StructureSpawn.prototype.createRepairer =
        function (target, opts) {
            let newOpts = {
                role: 'repairer',
                energyUsed: 500,
                working: false,
                target: target,
                homePos: this.pos
            };
            return this.createCreep([WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], undefined, Object.assign(newOpts, opts));
        };

    StructureSpawn.prototype.createBuilder =
        function (target, opts) {
            let newOpts = {
                role: 'builder',
                energyUsed: 350,
                working: false,
                target: target,
                homePos: this.pos
            };
            return this.createCreep([WORK, CARRY, CARRY, CARRY, MOVE, MOVE], undefined, Object.assign(newOpts, opts));
        };

    StructureSpawn.prototype.createEmergencyRepairer =
        function (energy, target, opts) {
            var energyUsed = 0;
            var numParts = Math.floor(energy / 250);
            if (numParts > 12) {
                numParts = 12;
            }
            var body = [];
            for (let i = 0; i < numParts; i++) {
                body.push(WORK);
                energyUsed += 100;
            }
            for (let i = 0; i < numParts; i++) {
                body.push(CARRY);
                energyUsed += 50;
            }
            //should double up the move parts
            for (let i = 0; i < numParts * 2; i++) {
                body.push(MOVE);
                energyUsed += 50;
            }

            let newOpts = {
                role: 'repairer',
                energyUsed: energyUsed,
                target: target,
                working: false,
                homePos: this.pos
            };
            return this.createCreep(body, undefined, Object.assign(newOpts, opts));
        };

    StructureSpawn.prototype.createLongDistanceHarvester =
        function (energy, numOfWorkParts, homePos, target, sourceIndex, opts) {
            var energyUsed = 0;
            var body = [];
            for (let i = 0; i < numOfWorkParts; i++) {
                body.push(WORK);
                energyUsed += 100;
            }

            energy -= 150 * numOfWorkParts;

            var numParts = Math.floor(energy / 100);

            for (let i = 0; i < numParts; i++) {
                body.push(CARRY);
                energyUsed += 50;
            }
            for (let i = 0; i < numParts + numOfWorkParts; i++) {
                body.push(MOVE);
                energyUsed += 50;
            }

            let newOpts = {
                role: 'longDistanceHarvester',
                homePos: homePos,
                target: target,
                sourceIndex: sourceIndex,
                energyUsed: energyUsed,
                working: false
            };
            return this.createCreep(body, undefined, Object.assign(newOpts, opts));
        }

    StructureSpawn.prototype.createClaimer =
        function (target, opts) {
            let newOpts = {
                role: 'claimer',
                target: target,
                homePos: this.pos
            };
            return this.createCreep([CLAIM, MOVE], undefined, Object.assign(newOpts, opts))
        }

    StructureSpawn.prototype.createReserver =
        function (target, opts) {
            let newOpts = {
                role: 'reserver',
                target: target,
                homePos: this.pos
            };
            return this.createCreep([CLAIM, CLAIM, MOVE], undefined, Object.assign(newOpts, opts))
        }

    StructureSpawn.prototype.createMiner =
        function (sourceId, opts) {
            let newOpts = {
                role: 'miner',
                energyUsed: 550,
                sourceId: sourceId,
                homePos: this.pos
            };
            return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], undefined, Object.assign(newOpts, opts))
        }

    StructureSpawn.prototype.createCarry =
        function (energy, roleName, target, opts) {
            var energyUsed = 0;
            var numParts = Math.floor(energy / 150);
            var body = [];
            for (let i = 0; i < numParts * 2; i++) {
                body.push(CARRY);
                energyUsed += 50;
            }
            //should double up the move parts
            for (let i = 0; i < numParts; i++) {
                body.push(MOVE);
                energyUsed += 50;
            }

            let newOpts = {
                role: roleName,
                energyUsed: energyUsed,
                working: false,
                target: target,
                homePos: this.pos
            };
            return this.createCreep(body, undefined, Object.assign(newOpts, opts));
        };

    StructureSpawn.prototype.createVision =
        function (target, opts) {
            let exit = this.room.findExitTo(target);
            let newOpts = {
                role: 'vision',
                exit: exit,
                homePos: this.pos,
                target: target
            };
            return this.createCreep([MOVE], undefined, Object.assign(newOpts, opts))
        }

//TODO: merge this with createCarry and just add opts to the arguments
        StructureSpawn.prototype.createLDHauler =
            function (energy, container, homePos, opts) {
                //var energyUsed = 550;
                // var numParts = Math.floor(energy / 150);
                // var body = [];
                // for (let i = 0; i < numParts * 2; i++) {
                //     body.push(CARRY);
                //     energyUsed += 50;
                // }
                // //should double up the move parts
                // for (let i = 0; i < numParts; i++) {
                //     body.push(MOVE);
                //     energyUsed += 50;
                // }

                // return this.createCreep(body, undefined, {
                let newOpts = {
                    working: false,
                    container: container,
                    homePos: homePos
                };
                return this.createCarry(energy, 'LDHauler', undefined, Object.assign(newOpts, opts));
            };

            StructureSpawn.prototype.createExtCreep =
                function (flag, opts) {
                    let newOpts = {
                        role: 'extcreep',
                        energyUsed: 100,
                        working: false,
                        flag: flag
                    };
                    return this.createCreep([CARRY, MOVE], undefined, Object.assign(newOpts, opts));
                }

};
