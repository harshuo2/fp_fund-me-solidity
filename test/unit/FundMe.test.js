const { deployments, getNamedAccounts, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const { DEVELOPMENT_CHAINS } = require("../../helper-hardhat-config")

// here more robust testing will be done. Mostly, we should try to group our tests around one function more collectively...
!DEVELOPMENT_CHAINS.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe, deployer, mockV3Aggregator // this is out of the beforeEach because this is to be used in further stages as well
      const sendValue = ethers.utils.parseEther("1") // this assigns the ether equivalent of the number in bracket
      beforeEach(async function () {
        // deploy fundme function
        // using contracts
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"]) // this fixture function of deployments deploys all contract of as many tags with just 1 line
        // all our contracts are deployed. now on to getting them...
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
        fundMe = await ethers.getContract("FundMe", deployer) // gets latest deployment of FundMe, a contract needs a name, and a deployer account
      })

      describe("constructor", function () {
        it("sets aggregator addresses correctly", async function () {
          const response = await fundMe.getPriceFeed()
          const addressFromMock = await mockV3Aggregator.address
          assert.equal(response, addressFromMock)
        })
        // these brackets are inside the above bracket.
        // for checking on the cntract address for local netowrks, we use the MockV3Aggregator, as constructor has 2 stuff to test
      })

      describe("fund", async function () {
        it("Fails if not enough ether is given", async function () {
          await expect(fundMe.fund()).to.be.reverted // can also give a message with .with() function aise end mein don't add
          // await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
          // this program is expected to give us a fail if not enough ether is send. this can be achieved through hardhat-waffle
        })
        it("updates the amount funded", async function () {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.getAddressToAmountFunded(deployer) // this is going to be an integer
          // so we must need an integer to measure it. this can be achieved through:
          assert.equal(response.toString(), sendValue.toString())
        })
        it("updates when funders are added", async function () {
          await fundMe.fund({ value: sendValue }) // we have created a transaction
          const response = await fundMe.getFunders(0) // check who did the last transaction
          assert.equal(response.toString(), deployer) // must be equal to our deployer
        })
      })

      describe("withdraw", async function () {
        const accounts = await ethers.getSigners() // we have imported all the local accounts connected through the getSigners()
        beforeEach(async function () {
          // this must have some balance on this before extracting
          await fundMe.fund({ value: sendValue })
        })

        it("withdraw only with a single funder", async function () {
          // we use provider.getBalance(<kiska lena hai>) to get their balance
          // Arrange
          const accounts = await ethers.getSigners()
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          // Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt // extract two functions which we extracted using debugger
          const gasCost = gasUsed.mul(effectiveGasPrice)
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Assert
          assert.equal(endingFundMeBalance.toString(), 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          ) // we did add here because bigNumber pe operations is difficult
        })
        it("for multple funders", async function () {
          const accounts = await ethers.getSigners()
          // Arrange
          for (i = 1; i < 6; i++) {
            // 0th account is of deployer
            const FundMeConnectedContract = await fundMe.connect(accounts[i]) // because for now the account is connected only with deployer
            await fundMe.fund({ value: sendValue }) // all accounts have sent their regards (money)...
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          const { gasUsed, effectiveGasPrice } = transactionReceipt // extract two functions which we extracted using debugger
          const gasCost = gasUsed.mul(effectiveGasPrice)
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Assert
          assert.equal(endingFundMeBalance.toString(), 0)
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )

          // also check if all the account balances are now zero(reset)
          await expect(fundMe.getFunders(0)).to.be.reverted // why should this throw an error?

          for (i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("Only allows owners to withdraw", async function () {
          // check if modifier is working
          const attacker = await accounts[1] // created an attacker
          const attackerConnectedAccount = await fundMe.connect(attacker) // connected his account
          await expect(attackerConnectedAccount.withdraw()).to.be.reverted // did the attack, failed
        })
      })
    })
