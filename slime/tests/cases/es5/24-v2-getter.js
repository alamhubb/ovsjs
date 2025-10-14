// v2：测试getter/setter

var account = {
  _balance: 0,
  get balance() {
    return this._balance;
  },
  set balance(value) {
    this._balance = value;
  }
};

account.balance = 100;
var currentBalance = account.balance;

