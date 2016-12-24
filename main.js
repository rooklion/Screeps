require('prototype.spawn')();
require('prototype.link')();

var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var roleWallRepairer = require('role.wallRepairer');
var roleLongDistanceHarvester = require('role.longDistanceHarvester');
var roleClaimer = require('role.claimer');
var roleMiner = require('role.miner');
var roleLorry = require('role.lorry');
var roleScooper = require('role.scooper');
var roleGather = require('role.gather');
var roleVision = require('role.vision');
var roleReserver = require('role.reserver');
var roleCTARefuge = require('role.CTARefuge');

//var link = require('link');
var profiler = require('screeps-profiler');

var HOME = 'W8N3';
var MAX_OVERFLOW_CREEPS = 4;
var tickCounter = 0;

profiler.enable();
module.exports.loop = function () {
	profiler.wrap(function() {

		//use PathFinder for better moving
		PathFinder.use(true);

		// clear memory
		for (let name in Memory.creeps) {
			if (Game.creeps[name] == undefined) {
				delete Memory.creeps[name];
			}
		}


		Memory.roomVisibilities = [];
		Memory.creepNeedsHeal = [];

		//Initialize CallToArms memory if it does not exist (only necessary on new server)
		if (!Memory.CTA) {
			Memory.CTA = {};
		} else {
			//otherwise we'll tick down each CTA tick timer
			for (let name in Memory.CTA) {
				let CTA = Memory.CTA[name];
				CTA.ticks--;
			}
		}

		for (let name in Game.creeps) {
			var creep = Game.creeps[name];

			if (creep.hits < creep.hitsMax) {
				Memory.creepNeedsHeal.push(creep);
			}
			//delete creep.memory.targetObject;
			//delete creep.memory.objectTarget;

			//uncomment to clear all creep movement caches
			//delete creep.memory._move;

			//add each available room to the visibilities list for lookup later
			if (Memory.roomVisibilities.indexOf(creep.room.name) == -1) {
				Memory.roomVisibilities.push(creep.room.name);
				//console.log('new vis: ' + creep.room.name);
			}

			//detect if creep moved after last tick
			if (creep.pos.isEqualTo(creep.memory.oldPos)) {
				creep.memory.moved = true;
			}
			else {
				creep.memory.moved = false;
			}
			creep.memory.oldPos = creep.pos;

			if (creep.memory.role == 'harvester') {
				roleHarvester.run(creep);
			}
			else if (creep.memory.role == 'upgrader') {
				roleUpgrader.run(creep);
			}
			else if (creep.memory.role == 'builder') {
				roleBuilder.run(creep);
			}
			else if (creep.memory.role == 'repairer') {
				roleRepairer.run(creep);
			}
			else if (creep.memory.role == 'wallRepairer') {
				roleWallRepairer.run(creep);
			}
			else if (creep.memory.role == 'longDistanceHarvester') {
				roleLongDistanceHarvester.run(creep);
			}
			else if (creep.memory.role == 'claimer') {
				roleClaimer.run(creep);
			}
			else if (creep.memory.role == 'miner') {
				roleMiner.run(creep);
			}
			else if (creep.memory.role == 'lorry') {
				roleLorry.run(creep);
			}
			else if (creep.memory.role == 'scooper') {
				roleScooper.run(creep);
			}
			else if (creep.memory.role == 'gather') {
				roleGather.run(creep);
			}
			else if (creep.memory.role == 'vision') {
				roleVision.run(creep);
			}
			else if (creep.memory.role == 'reserver') {
				roleReserver.run(creep);
			}
			else if (creep.memory.role == 'CTARefuge') {
				roleCTARefuge.run(creep);
			}
		}

		if (Memory.creepNeedsHeal.length > 0) {
			Memory.creepNeedsHeal.sort((a, b) => (a.hits / a.hitsMax) - (b.hits / b.hitsMax));
		}

		//Command all towers to attack the closest hostile creep
		var towers = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TOWER);
		;
		for (let tower of towers) {
			let target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (target != undefined) {
				tower.attack(target);
			} else if (Memory.creepNeedsHeal.length > 0) {
				tower.heal(Memory.creepNeedsHeal[0]);
				Memory.creepNeedsHeal.shift();
			}
		}

		var boolTriggerReport = false;

		var myRooms = {};
		var thisRoom = {};

		for (let spawnName in Game.spawns) {
			thisRoom = {};
			let spawn = Game.spawns[spawnName];


			//piggyback this loop to process links as well
			for (let l in spawn.room.memory.links) {
				let link = Game.getObjectById(l);
				link.checkTransfer();
				//console.log(spawn.room.memory.links[l]);
			}
			//console.log(Game.rooms['W8N3'].links);

			let creepsInRoom = spawn.room.find(FIND_MY_CREEPS);

			let CTACreeps = _.filter(creepsInRoom, (c) => c.memory.role == 'CTARefuge' && c.pos.isNearTo(spawn.pos));
			for (let c in CTACreeps) {
				spawn.recycleCreep(CTACreeps[c]);
			}

			thisRoom.name = spawn.room.name;
			myRooms[thisRoom.name] = thisRoom;
			//myRooms[thisRoom.name].name = thisRoom.name;
			//console.log(myRooms[thisRoom.name].name);


			//console.log(thisRoom);
			//count the number of creeps with each role
			thisRoom.numberOfHarvesters = _.sum(creepsInRoom, (c) => c.memory.role == 'harvester');
			thisRoom.numberOfUpgraders = _.sum(creepsInRoom, (c) => c.memory.role == 'upgrader');
			thisRoom.numberOfBuilders = _.sum(creepsInRoom, (c) => c.memory.role == 'builder');
			thisRoom.numberOfRepairers = _.sum(creepsInRoom, (c) => c.memory.role == 'repairer');
			thisRoom.numberOfWallRepairers = _.sum(creepsInRoom, (c) => c.memory.role == 'wallRepairer');
			thisRoom.numberOfMiners = _.sum(creepsInRoom, (c) => c.memory.role == 'miner');
			thisRoom.numberOfLorries = _.sum(creepsInRoom, (c) => c.memory.role == 'lorry');
			thisRoom.numberOfScoopers = _.sum(creepsInRoom, (c) => c.memory.role == 'scooper');
			thisRoom.numberOfGatherers = _.sum(creepsInRoom, (c) => c.memory.role == 'gather');
			thisRoom.numberOfLDH = _.sum(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester');
			thisRoom.numberOfLongDistanceHarvestersW8N2 = _.sum(Game.creeps, (c) =>
			c.memory.role == 'longDistanceHarvester'
			&& c.memory.target == 'W8N2'
		);
		thisRoom.numberOfLongDistanceHarvestersW7N3 = _.sum(Game.creeps, (c) =>
		c.memory.role == 'longDistanceHarvester'
		&& c.memory.target == 'W7N3'
	);


	var name = undefined;
	var energy = spawn.room.energyCapacityAvailable;


	//handle the need for "emergency repairers"
	//If a structure in a distant room is below a given percentage,
	//spawn a repairer and send them to the room

	//Needed to see if this execution spawned a repairer
	var boolSendRepairer = false;
	//Array of all the room targets for LDHs
	var roomTargets = [];

	//Populate the room targets array
	for (let creep of _.filter(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester')) {
		if (roomTargets.indexOf(creep.memory.target) == -1) {
			roomTargets.push(creep.memory.target);
			//console.log("new target: " + creep.memory.target);
		}
	}

	//iterate through the room targets
	for (let tar in roomTargets) {
		//if this room is in the visibilities list, otherwise .find will return an error
		if (Memory.roomVisibilities.indexOf(tar) != -1) {
			let roads = Game.rooms[creep.memory.target].find(FIND_STRUCTURES, (s) => s.structureType == STRUCTURE_ROAD);
			//iterate through the roads to find one in need of health
			for (let r of roads) {
				//if the health is below a given percentage (50% at the moment)
				if ((r.hits / r.hitsMax) <= 0.5) {
					//find out if there is already an emergency repairer spawned for this room
					if (!_.some(_.filter(Game.creeps, (c) => c.memory.role == 'repairer' && c.memory.target == creep.memory.target))) {
						//no repairer found, create one
						name = spawn.createEmergencyRepairer(energy, creep.memory.target);
						//console.log(name);
						//is it successful?
						if (_.isString(name) && Game.creeps[name] != undefined) {
							console.log("Sending emergency repairer to : " + creep.memory.target);
							//one was found, now to break the loop
							boolSendRepairer = true;
							break;
						}
					}
				}
			}
		}
		if (boolSendRepairer) {
			//repairer was spawned, break the loop
			break;
		}
	}

	if (boolSendRepairer) {
		//repairer was spawned, exit iteration for this spawn and move to the next one
		continue;
	}

	if (thisRoom.numberOfHarvesters == 0 && (thisRoom.numberOfMiners == 0 || thisRoom.numberOfLorries == 0)) {
		if (thisRoom.numberOfMiners > 0) {
			//Don't want to create a lorry above 300, but if that much isn't available, spawn one with whatever we have
			name = spawn.createCarry((spawn.room.energyAvailable > 300 ? 300 : spawn.room.energyAvailable), 'lorry');
		}
		else {
			name = spawn.createCustomCreep(spawn.room.energyAvailable, 'harvester');
		}
	}
	else {
		let sources = spawn.room.find(FIND_SOURCES);
		for (let source of sources) {
			if (!_.some(creepsInRoom, (c) => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {
				let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
					filter: (s) => s.structureType == STRUCTURE_CONTAINER
				});
				if (containers.length > 0) {
					name = spawn.createMiner(source.id);
					break;
				}
			}
		}
	}
	//if we created a miner, we don't need something else

	//check for need of vision creeps
	if (name == undefined) {
		let LDH = _.filter(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester');
		for (let name in LDH) {
			if (!(_.some(Game.creeps, (c) => c.memory.role == 'vision' && c.memory.target == LDH[name].memory.target))) {
				name = spawn.createVision(LDH[name].memory.target);
				break;
			}
		}
	}

	//now we check CTA targets to see if they need a vision to clear it
	if (name == undefined) {
		for (let r in Memory.CTA) {
			let CTA = Memory.CTA[r];
			if (CTA.ticks <= 0) {
				let vision = _.filter(Game.creeps, (c) => c.memory.role == 'vision' && c.memory.target == r);

				if (vision.length == 0) {
					name = spawn.createVision(r);
					break;
				}
			}
		}
	}

	//if we created vision, we don't need something else
	if (name == undefined) {
		if (spawn.memory.claimTarget != undefined) {
			name = spawn.createClaimer(spawn.memory.claimTarget);
			delete spawn.memory.claimTarget;
		}
	}

	//check for need of reserver creeps
	if (name == undefined) {
		let LDH = _.filter(Game.creeps, (c) => c.memory.role == 'longDistanceHarvester');
		for (let name in LDH) {
			if (!(_.some(Game.creeps, (c) => c.memory.role == 'reserver' && c.memory.target == LDH[name].memory.target))) {
				name = spawn.createReserver(LDH[name].memory.target);
				break;
			}
		}
	}
	//if we created a claimer, we don't need something else
	if (name == undefined) {
		if (thisRoom.numberOfHarvesters < spawn.memory.minHarv) {
			name = spawn.createCustomCreep(energy, 'harvester');
		}
		// have as many lorries as we have miners.  Removes need for min number setting?!
		else if (thisRoom.numberOfLorries < spawn.memory.minLor || thisRoom.numberOfLorries < thisRoom.numberOfMiners) {
			name = spawn.createCarry(300, 'lorry');
		}
		else if (spawn.memory.claimRoom != undefined) {
			name = spawn.createClaimer(spawn.memory.claimRoom);
			if (_.isString(name) && Game.creeps[name] != undefined) {
				delete spawn.memory.claimRoom;
			}
		}

		else if (thisRoom.numberOfUpgraders < spawn.memory.minUpg) {
			name = spawn.createCustomCreep(energy, 'upgrader');
		}
	}

	//break to check for build on demand creeps before doing anything else

	//If any structures with half hit points and we have no repairers, spawn one
	//Repairer on demand
	if (name == undefined) {
		let structures = spawn.room.find(FIND_STRUCTURES,
			{ filter: (s) => s.hits < (s.hitsMax / 2) && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART });
			if (structures.length > 0 && thisRoom.numberOfRepairers == 0) {
				if (spawn.room.energyCapacityAvailable >= 350) {
					name = spawn.createRepairer();
				} else {
					name = spawn.createCustomCreep(spawn.room.energyCapacityAvailable, 'repairer');
				}
			}
			else {
				//If any construction sites and no builder, spawn one
				//Builder on demand
				let conSite = spawn.room.find(FIND_CONSTRUCTION_SITES);
				let containers = spawn.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
				//if there are containers in the room, the minimum builders is 1.  Otherwise, we'll use 2 to speed the process up
				//  numberofBuilders <= 0 ensures 1 builder, <= 1 ensures 2 builders
				if (conSite.length > 0 && thisRoom.numberOfBuilders <= (containers.length > 0 ? 0 : 1)) {
					if (spawn.room.energyCapacityAvailable >= 350) {
						name = spawn.createBuilder();
					} else {
						name = spawn.createCustomCreep(spawn.room.energyCapacityAvailable, 'builder');
					}
				}
			}
		}

		if (name == undefined) {
			if (thisRoom.numberOfRepairers < spawn.memory.minRep) {
				if (spawn.room.energyCapacityAvailable >= 350) {
					name = spawn.createRepairer();
				} else {
					name = spawn.createCustomCreep(spawn.room.energyCapacityAvailable, 'repairer');
				}
			}
			else if (thisRoom.numberOfBuilders < spawn.memory.minBuild) {
				if (spawn.room.energyCapacityAvailable >= 350) {
					name = spawn.createBuilder();
				} else {
					name = spawn.createCustomCreep(spawn.room.energyCapacityAvailable, 'builder');
				}
			}
			else if (thisRoom.numberOfWallRepairers < spawn.memory.minWR) {
				name = spawn.createCustomCreep(energy, 'wallRepairer');
			}
			else if (thisRoom.numberOfScoopers < spawn.memory.minScoop) {
				name = spawn.createCarry(300, 'scooper');
			}
			else if (thisRoom.numberOfGatherers < spawn.memory.minGather) {
				name = spawn.createCarry(spawn.energyCapacityAvailable >= 450 ? 450 : 300, 'gather');
			}
			//hacking in a short fix to alternate the source IDs until I fix movement code
			else if (thisRoom.numberOfLongDistanceHarvestersW7N3 < spawn.memory.minLDW7N3 && !(Memory.CTA['W7N3'])) {

				name = spawn.createLongDistanceHarvester(energy, 3, (spawn.room.storage != undefined ? spawn.room.storage.pos : spawn.pos), 'W7N3', spawn.memory.sourceIDHack2);
				if (_.isString(name) && Game.creeps[name] != undefined) {
					if (spawn.memory.sourceIDHack2 == 0) {
						console.log('switched to 1');
						spawn.memory.sourceIDHack2 = 1;
					}
					else {
						console.log('switched to 0');
						spawn.memory.sourceIDHack2 = 0;
					}
				}
				//console.log(name);
			}
			//hacking in a short fix to alternate the source IDs until I fix movement code
			else if (thisRoom.numberOfLongDistanceHarvestersW8N2 < spawn.memory.minLDW8N2 && !(Memory.CTA['W8N2'])) {


				name = spawn.createLongDistanceHarvester(energy, 3, Game.getObjectById('78dfa23068a89ea').pos, 'W8N2', spawn.memory.sourceIDHack);
				if (_.isString(name) && Game.creeps[name] != undefined) {
					if (spawn.memory.sourceIDHack == 0) {
						console.log('switched to 1');
						spawn.memory.sourceIDHack = 1;
					}
					else {
						console.log('switched to 0');
						spawn.memory.sourceIDHack = 0;
					}
				}
				//console.log(name);
			}
			else {
				//if all else fails, this is the backup to Max_OVERFLOW
				if (thisRoom.numberOfUpgraders < MAX_OVERFLOW_CREEPS) {
					name = spawn.createCustomCreep(energy, 'upgrader');
					//if (spawn.room.energyCapacityAvailable >= 350) {
					//    name = spawn.createUpgrader();
					//} else {
					//    name = spawn.createCustomCreep(spawn.room.energyCapacityAvailable, 'upgrader');
					//}
				}
			}
		}
		//if (!(name < 0)) {
		if (_.isString(name) && Game.creeps[name] != undefined) {
			console.log("(" + spawn.room.name + ") Spawned new " + Game.creeps[name].memory.role + " creep: '" + name + "' with energy: " + Game.creeps[name].memory.energyUsed);
			boolTriggerReport = true;
			//console.log("H: " + numberOfHarvesters + ", U: " + numberOfUpgraders + ", B: " + numberOfBuilders + ", U: " + numberOfRepairers);
		}
		//console.log("(" + spawn.room.name + ") "
		//    + "H: " + numberOfHarvesters
		//    + ", M: " + numberOfMiners
		//    + ", L: " + numberOfLorries
		//    + ", U: " + numberOfUpgraders
		//    + ", B: " + numberOfBuilders
		//    + ", R: " + numberOfRepairers
		//    + ", WR: " + numberOfWallRepairers
		//    + ", S: " + numberOfScoopers
		//    + ", LD(W8N2): " + numberOfLongDistanceHarvestersW8N2
		//    );

	}
	tickCounter += 1;
	if (tickCounter == 20 || boolTriggerReport) {
		for (let roomName in myRooms) {
			let r = myRooms[roomName];
			console.log("(" + r.name + ") "
			+ "H: " + r.numberOfHarvesters
			+ ", M: " + r.numberOfMiners
			+ ", L: " + r.numberOfLorries
			+ ", U: " + r.numberOfUpgraders
			+ ", B: " + r.numberOfBuilders
			+ ", R: " + r.numberOfRepairers
			+ ", WR: " + r.numberOfWallRepairers
			+ ", G: " + r.numberOfGatherers
			+ ", LD: " + r.numberOfLDH
		);
	}
	//triggering a report resets the counter each time.
	tickCounter = 0;
}


});
}
