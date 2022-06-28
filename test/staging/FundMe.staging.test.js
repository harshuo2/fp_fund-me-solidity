const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { DEVELOPMENT_CHAINS } = require("../../helper-hardhat-config")

DEVELOPMENT_CHAINS.includes(network.name)
  ? describe.skip
  : describe("FundMe Staging Tests", async function () {
      let deployer
      let fundMe
      const sendValue = ethers.utils.parseEther("0.1")
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw({
          gasLimit: 100000,
        })

        const endingFundMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        )
        console.log(
          endingFundMeBalance.toString() +
            " should equal 0, running assert equal..."
        )
        assert.equal(endingFundMeBalance.toString(), "0")
      })
    })
