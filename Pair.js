class Pair {
    constructor(a, b) {
        this.a = a
        this.b = b

        this.fails = [0, 0]
    }

    pickSide() {
        if (this.fails[0] > maxFails)
            return 1
        if (this.fails[1] > maxFails)
            return 0
        return random(0, 2) | 0
    }

    isFailed() {
        return this.fails[0] > maxFails && this.fails[1] > maxFails
    }
}