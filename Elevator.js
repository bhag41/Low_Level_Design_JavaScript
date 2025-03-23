class Elevator {
    constructor(id, numFloors) {
        this.id = id;
        this.currentFloor = 1; // Assuming ground floor is 1
        this.direction = 'IDLE'; // 'UP', 'DOWN', 'IDLE'
        this.isMoving = false;
        this.doorOpen = false;
        this.numFloors = numFloors;
        this.destinationQueue = []; // Array of target floors
    }

    getDetails() {
        return {
            id: this.id,
            currentFloor: this.currentFloor,
            direction: this.direction,
            isMoving: this.isMoving,
            doorOpen: this.doorOpen,
            destinationQueue: this.destinationQueue
        };
    }

    requestFloor(floor) {
        if (floor >= 1 && floor <= this.numFloors && !this.destinationQueue.includes(floor)) {
            this.destinationQueue.push(floor);
            this.destinationQueue.sort((a, b) => a - b); // Keep the queue sorted
            this.determineDirection();
            console.log(`Elevator ${this.id} received request to floor ${floor}. Current queue: ${this.destinationQueue}`);
        } else {
            console.log(`Invalid floor request (${floor}) for elevator ${this.id} or floor already in queue.`);
        }
    }

    determineDirection() {
        if (this.destinationQueue.length === 0) {
            this.direction = 'IDLE';
            this.isMoving = false;
        } else if (this.destinationQueue[0] > this.currentFloor) {
            this.direction = 'UP';
            this.isMoving = true;
        } else if (this.destinationQueue[0] < this.currentFloor) {
            this.direction = 'DOWN';
            this.isMoving = true;
        } else {
            this.direction = 'IDLE'; // Should ideally open the door
            this.isMoving = false;
        }
    }

    move() {
        if (this.isMoving && this.destinationQueue.length > 0) {
            const nextDestination = this.destinationQueue[0];
            if (this.currentFloor < nextDestination) {
                this.currentFloor++;
                console.log(`Elevator ${this.id} moving up to floor ${this.currentFloor}...`);
            } else if (this.currentFloor > nextDestination) {
                this.currentFloor--;
                console.log(`Elevator ${this.id} moving down to floor ${this.currentFloor}...`);
            }

            if (this.currentFloor === nextDestination) {
                this.openDoor();
                this.destinationQueue.shift(); // Remove reached destination
                setTimeout(() => this.closeDoor(), 2000); // Simulate door open time
                this.determineDirection();
            }
        } else if (this.destinationQueue.length === 0) {
            this.direction = 'IDLE';
            this.isMoving = false;
        }
    }

    openDoor() {
        this.doorOpen = true;
        console.log(`Elevator ${this.id} doors opening on floor ${this.currentFloor}.`);
    }

    closeDoor() {
        this.doorOpen = false;
        console.log(`Elevator ${this.id} doors closing on floor ${this.currentFloor}.`);
        this.determineDirection(); // Re-evaluate direction after closing
    }
}

class ElevatorSystem {
    constructor(numElevators, numFloors) {
        this.elevators = [];
        this.numFloors = numFloors;
        for (let i = 1; i <= numElevators; i++) {
            this.elevators.push(new Elevator(i, numFloors));
        }
        this.requests = []; // Queue of external floor requests
        this.intervalId = setInterval(() => this.updateElevators(), 1000); // Update every second
    }

    requestElevator(fromFloor, toFloor) {
        if (fromFloor < 1 || fromFloor > this.numFloors || toFloor < 1 || toFloor > this.numFloors || fromFloor === toFloor) {
            console.log("Invalid floor request.");
            return;
        }
        const request = { from: fromFloor, to: toFloor };
        this.requests.push(request);
        console.log(`Elevator requested from floor ${fromFloor} to floor ${toFloor}.`);
        this.dispatchElevator(request);
    }

    dispatchElevator(request) {
        const { from, to } = request;
        let bestElevator = null;
        let minDistance = Infinity;

        for (const elevator of this.elevators) {
            const distance = Math.abs(elevator.currentFloor - from);
            if (elevator.direction === 'IDLE' && distance < minDistance) {
                minDistance = distance;
                bestElevator = elevator;
            } else if (elevator.direction === 'UP' && from > elevator.currentFloor && to > from) {
                if (distance < minDistance) {
                    minDistance = distance;
                    bestElevator = elevator;
                }
            } else if (elevator.direction === 'DOWN' && from < elevator.currentFloor && to < from) {
                if (distance < minDistance) {
                    minDistance = distance;
                    bestElevator = elevator;
                }
            }
        }

        if (bestElevator) {
            console.log(`Dispatching elevator ${bestElevator.id} to floor ${from}.`);
            bestElevator.requestFloor(from);
            bestElevator.requestFloor(to);
        } else {
            console.log("No available elevator at the moment. Please wait.");
            // In a more advanced system, you might have a more sophisticated dispatching strategy.
        }
    }

    updateElevators() {
        for (const elevator of this.elevators) {
            elevator.move();
        }
        // You could add logic here to handle external requests if no elevator is dispatched immediately
        // For example, if there are pending requests in this.requests
    }

    getElevatorStatus() {
        return this.elevators.map(elevator => elevator.getDetails());
    }
}

// Example Usage:
const numElevators = 2;
const numFloors = 10;
const building = new ElevatorSystem(numElevators, numFloors);

// Simulate some requests
building.requestElevator(1, 5);
building.requestElevator(8, 2);
building.requestElevator(3, 7);

// You can observe the elevator movements over time
setTimeout(() => {
    console.log("\nElevator Status After 5 seconds:");
    console.log(building.getElevatorStatus());
}, 5000);

setTimeout(() => {
    building.requestElevator(6, 1);
    console.log("\nElevator Status After another 3 seconds:");
    console.log(building.getElevatorStatus());
}, 8000);

setTimeout(() => {
    building.requestElevator(2, 9);
    console.log("\nElevator Status After another 7 seconds:");
    console.log(building.getElevatorStatus());
}, 15000);