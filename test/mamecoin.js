const mameCoin = artifacts.require('./mameCoin.sol');

contract('mameCoin', (accounts) => {
  let coin;

  beforeEach(async () => {
    coin = await mameCoin.new();
  });

  describe('初期化', () => {

    it('通貨名が正しいか', async () => {
      const expect = 'mameCoin';
      const actual = await coin.name();
      assert.strictEqual(actual, expect);
    });

    it('シンボルが正しいか', async () => {
      const expect = 'MAME';
      const actual = await coin.symbol();
      assert.strictEqual(actual, expect);
    });

    it('小数点の桁数が正しいか', async () => {
      const expect = 8;
      const actual = await coin.decimals();
      assert.strictEqual(actual.toNumber(), expect);
    });

    it('発行枚数が正しいか', async () => {
      const decimals = await coin.decimals();
      const expect = new web3.BigNumber(25000000000 * (10 ** decimals));
      const actual = await coin.totalSupply();
      assert.strictEqual(actual.toNumber(), expect.toNumber());
    });

    it('初回発行分のトークンが正しく配布されているか', async () => {
      const decimals = await coin.decimals();
      const expect = new web3.BigNumber(25000000000 * (10 ** decimals));
      const actual = await coin.balanceOf(accounts[0]);
      assert.strictEqual(actual.toNumber(), expect.toNumber());
    });
  });

  describe('独自関数', () => {

    it('正しくバーンできるか', async () => {
      const decimals = await coin.decimals();
      const initialBalance = await coin.balanceOf(accounts[0]);
      const burnAmount = new web3.BigNumber(10000000000 * (10 ** decimals));
      await coin.burn(accounts[0], burnAmount);
      const expectBalance = initialBalance.toNumber() - burnAmount.toNumber();
      const burnedBalance = await coin.balanceOf(accounts[0]);
      assert.strictEqual(burnedBalance.toNumber(), expectBalance);

      const totalSupply = await coin.totalSupply();
      assert.strictEqual(totalSupply.toNumber(), burnedBalance.toNumber());
    });

    it('正しくリファンドできるか', async () => {
      const decimals = await coin.decimals();
      const initialBalance = await coin.balanceOf(accounts[0]);
      const refundAmount = new web3.BigNumber(10000000000 * (10 ** decimals));
      await coin.refund(accounts[0], refundAmount);
      const expectBalance = initialBalance.toNumber() + refundAmount.toNumber();
      const refundBalance = await coin.balanceOf(accounts[0]);
      assert.strictEqual(refundBalance.toNumber(), expectBalance);

      const totalSupply = await coin.totalSupply();
      assert.strictEqual(totalSupply.toNumber(), refundBalance.toNumber());
    });

    it('正しくエアドロップできるか -> 正常系', async () => {
      const decimals = await coin.decimals();
      const initialBalance = await coin.balanceOf(accounts[0]);
      const addresses = [
        accounts[1], accounts[2], accounts[3], accounts[4], accounts[5],
        accounts[6], accounts[7], accounts[8], accounts[9]
      ];
      const amount = new web3.BigNumber(100000000 * (10 ** decimals));
      const totalAmount = amount.toNumber() * addresses.length;

      await coin.airdrop(addresses, amount);
      const distributedBalance = await coin.balanceOf(accounts[0]);

      assert.strictEqual(distributedBalance.toNumber(), initialBalance.toNumber() - totalAmount);

      const balance1 = await coin.balanceOf(accounts[1]);
      const balance5 = await coin.balanceOf(accounts[5]);
      const balance9 = await coin.balanceOf(accounts[9]);
      assert.strictEqual(balance1.toNumber(), amount.toNumber());
      assert.strictEqual(balance5.toNumber(), amount.toNumber());
      assert.strictEqual(balance9.toNumber(), amount.toNumber());
    });

    it('正しくエアドロップできるか -> 異常系', async () => {
      const decimals = await coin.decimals();
      const initialBalance = await coin.balanceOf(accounts[0]);
      const addresses = [
        accounts[1], accounts[2], accounts[3], accounts[4], accounts[5],
        accounts[6], accounts[7], accounts[8], accounts[9]
      ];
      const amount = new web3.BigNumber(100000000 * (10 ** decimals));

      const now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
      const releaseTime = now + 86400;
      await coin.lockup(accounts[5], releaseTime);

      const revertMessage = 'VM Exception while processing transaction: revert';

      try {
        await coin.airdrop(addresses, amount);
        throw null;
      } catch (e) {
        assert.strictEqual(e.message, revertMessage);
      }

      const distributedBalance = await coin.balanceOf(accounts[0]);
      assert.strictEqual(distributedBalance.toNumber(), initialBalance.toNumber());

      const balance1 = await coin.balanceOf(accounts[1]);
      const balance5 = await coin.balanceOf(accounts[5]);
      const balance9 = await coin.balanceOf(accounts[9]);
      assert.strictEqual(balance1.toNumber(), 0);
      assert.strictEqual(balance5.toNumber(), 0);
      assert.strictEqual(balance9.toNumber(), 0);
    });

    it('正しく一括送金できるか -> 正常系', async () => {
      const decimals = await coin.decimals();
      const initialBalance = await coin.balanceOf(accounts[0]);
      const addresses = [
        accounts[1], accounts[2], accounts[3], accounts[4], accounts[5],
        accounts[6], accounts[7], accounts[8], accounts[9]
      ];
      const amounts = [
        100000000, 200000000, 300000000, 400000000, 500000000,
        600000000, 700000000, 800000000, 900000000
      ];

      let bigNumberAmounts = [];
      let totalAmount = 0;
      for (let i = 0; i < addresses.length; i++) {
        const bigNumber = new web3.BigNumber(amounts[i] * (10 ** decimals)).toNumber();
        totalAmount += bigNumber;
        bigNumberAmounts.push(bigNumber);
      }

      await coin.distribute(addresses, bigNumberAmounts);
      const distributedBalance = await coin.balanceOf(accounts[0]);

      assert.strictEqual(distributedBalance.toNumber(), initialBalance.toNumber() - totalAmount);

      const balance1 = await coin.balanceOf(accounts[1]);
      const balance5 = await coin.balanceOf(accounts[5]);
      const balance9 = await coin.balanceOf(accounts[9]);
      assert.strictEqual(balance1.toNumber(), bigNumberAmounts[0]);
      assert.strictEqual(balance5.toNumber(), bigNumberAmounts[4]);
      assert.strictEqual(balance9.toNumber(), bigNumberAmounts[8]);
    });

    it('正しく一括送金できるか -> 異常系（ロックアップ混入）', async () => {
      const decimals = await coin.decimals();
      const initialBalance = await coin.balanceOf(accounts[0]);
      const addresses = [
        accounts[1], accounts[2], accounts[3], accounts[4], accounts[5],
        accounts[6], accounts[7], accounts[8], accounts[9]
      ];
      const amounts = [
        100000000, 200000000, 300000000, 400000000, 500000000,
        600000000, 700000000, 800000000, 900000000
      ];

      let bigNumberAmounts = [];
      for (let i = 0; i < addresses.length; i++) {
        const bigNumber = new web3.BigNumber(amounts[i] * (10 ** decimals)).toNumber();
        bigNumberAmounts.push(bigNumber);
      }

      const now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
      const releaseTime = now + 86400;
      await coin.lockup(accounts[5], releaseTime);

      const revertMessage = 'VM Exception while processing transaction: revert';

      try {
        await coin.distribute(addresses, bigNumberAmounts);
        throw null;
      } catch (e) {
        assert.strictEqual(e.message, revertMessage);
      }

      const distributedBalance = await coin.balanceOf(accounts[0]);
      assert.strictEqual(distributedBalance.toNumber(), initialBalance.toNumber());

      const balance1 = await coin.balanceOf(accounts[1]);
      const balance5 = await coin.balanceOf(accounts[5]);
      const balance9 = await coin.balanceOf(accounts[9]);
      assert.strictEqual(balance1.toNumber(), 0);
      assert.strictEqual(balance5.toNumber(), 0);
      assert.strictEqual(balance9.toNumber(), 0);
    });

    it('正しく一括送金できるか -> 異常系（amount 0以下混入）', async () => {
      const decimals = await coin.decimals();
      const initialBalance = await coin.balanceOf(accounts[0]);
      const addresses = [
        accounts[1], accounts[2], accounts[3], accounts[4], accounts[5],
        accounts[6], accounts[7], accounts[8], accounts[9]
      ];
      const amounts1 = [
        100000000, 200000000, 0, 400000000, 500000000,
        600000000, 700000000, 800000000, 900000000
      ];
      const amounts2 = [
        100000000, 200000000, -300000000, 400000000, 500000000,
        600000000, 700000000, 800000000, 900000000
      ];

      let bigNumberAmounts1 = [];
      let bigNumberAmounts2 = [];
      for (let i = 0; i < addresses.length; i++) {
        const bigNumber1 = new web3.BigNumber(amounts1[i] * (10 ** decimals)).toNumber();
        const bigNumber2 = new web3.BigNumber(amounts2[i] * (10 ** decimals)).toNumber();
        bigNumberAmounts1.push(bigNumber1);
        bigNumberAmounts2.push(bigNumber2);
      }

      const revertMessage1 = 'VM Exception while processing transaction: revert';

      try {
        await coin.distribute(addresses, bigNumberAmounts1);
        throw null;
      } catch (e) {
        assert.strictEqual(e.message, revertMessage1);
      }

      const revertMessage2 = 'VM Exception while processing transaction: invalid opcode';

      try {
        await coin.distribute(addresses, bigNumberAmounts2);
        throw null;
      } catch (e) {
        assert.strictEqual(e.message, revertMessage2);
      }

      const distributedBalance = await coin.balanceOf(accounts[0]);
      assert.strictEqual(distributedBalance.toNumber(), initialBalance.toNumber());

      const balance1 = await coin.balanceOf(accounts[1]);
      const balance5 = await coin.balanceOf(accounts[5]);
      const balance9 = await coin.balanceOf(accounts[9]);
      assert.strictEqual(balance1.toNumber(), 0);
      assert.strictEqual(balance5.toNumber(), 0);
      assert.strictEqual(balance9.toNumber(), 0);
    });

  });

});
