export default class UCB {
    /*Upper Confidence Bound (UCB) multi-armed bandit

    Parameters
    ----------
    n_arms : int
        Number of arms.

    rho : float
        Positive real explore-exploit parameter.

    Q0 : float, default=np.inf
        Initial value for the arms.
    */
    constructor(n_arms, rho = 1.0, Q0 = Infinity) {
        this.rho = rho;
        this.history_rewards = [...Array(n_arms).keys()].map(e => []);
        this.Q = [...Array(n_arms).keys()].map(e => Q0);
        this.t = 1;
    }

    static randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    play() {
        return UCB.randomChoice(this.Q.map((v, i) => i).filter((i) => this.Q[i] == Math.max(...this.Q)));
    }

    update(arm, reward) {
        this.history_rewards[arm].push(reward);
        this.t += 1;
        this.Q[arm] = this.average(this.history_rewards[arm]) + Math.sqrt(
            this.rho * Math.log(this.t) / this.history_rewards[arm].length);

    }

    average(arr) {
        return arr.reduce((a, b) => a + b) / arr.length;
    }
}