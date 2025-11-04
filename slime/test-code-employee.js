class Employee {
    constructor(id, name, salary) {
        this.id = id
        this.name = name
        this.salary = salary
    }
    
    giveRaise(amount) {
        this.salary += amount
        return this.salary
    }
    
    getInfo() {
        return `${this.name} (ID: ${this.id}): $${this.salary}`
    }
}








