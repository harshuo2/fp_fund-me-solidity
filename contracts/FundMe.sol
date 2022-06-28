//SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity 0.6.0;
// 2. Imports
import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
//import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";
import "./PriceConvertor.sol";

// 3. Interfaces, Libraries, errors, Contracts
// Error should be written as <ContractName>__<name of error>
// error FundMe__NotOwner(); // this shit is too advanced for our solidity version

/**@title A sample Funding Contract   // what this contract is
 * @author Patrick Collins   // name of author
 * @notice This contract is for creating a sample funding contract  // a note to the people(imporves readability)
 * @dev This implements price feeds as our library  // note for devs.
 */
contract FundMe {
  // Type Declarations
  using SafeMathChainlink for uint256;
  using PriceConvertor for uint256; // ab iss var type (uint256) ke saare instance aise treat honge ki agar koi
  // var ka use ho, to isko as parameter ki jagah, func ko iska func maan ke use kar sakte hain
  // State variables
  mapping(address => uint256) private addressToAmountFunded;
  address payable private owner;
  address[] private funders;
  uint256 public constant MINIMUM_USD = 50 * 10**18;
  AggregatorV3Interface private priceFeed; // this gives us the abi. abi along with address gives us a contract to interact with

  // jo uske type ka wahi na value store karega. isliye AggregatorV3Interface ke type ka var banaya hai
  // Events (we have none!)

  // Modifiers
  modifier checkOwner() {
    require(msg.sender == owner, "You're not the owner! Stop");
    //if (msg.sender != owner) revert FundMe__NotOwner(); // do this if error can be written at the top
    _;
  }

  // Functions Order:
  //// constructor
  //// receive
  //// fallback
  //// external
  //// public
  //// internal
  //// private
  //// view / pure

  constructor(address priceFeedAddress) public {
    // ek baar jo value construcor mein def hojaye, usko kisi ka baap nahi badal sakta
    owner = msg.sender;
    priceFeed = AggregatorV3Interface(priceFeedAddress); // by passing the address, a contract is not created.
  }

  /// @notice Funds our contract based on the ETH/USD price
  function fund() public payable {
    addressToAmountFunded[msg.sender] += msg.value; //+ add karna hai
    require(
      msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
      "Aur paisa do madarchod"
    );
    funders.push(msg.sender);
  }

  function withdraw() public payable checkOwner {
    owner.transfer(address(this).balance);
    for (
      uint256 fundersIndex = 0;
      fundersIndex < funders.length;
      fundersIndex++
    ) {
      address funder = funders[fundersIndex];
      addressToAmountFunded[funder] = 0;
    }
    funders = new address[](0);
  }

  function getAddressToAmountFunded(address funder)
    public
    view
    returns (uint256)
  {
    return (addressToAmountFunded[funder]);
  }

  function getOwner() public view returns (address) {
    return owner;
  }

  function getFunders(uint256 index) public view returns (address) {
    return funders[index];
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return priceFeed;
  }
}
// FOR FUNCTIONS IN PRICECONVERTOR.sol
/** @notice Gets the amount that an address has funded
 *  @param fundingAddress the address of the funder
 *  @return the amount funded
 */
// recieve aur fallback do special functions hain. one is called if no data is passed through 'transact'-> lower level
// this is recieve(). Fallback is called if some value is passed which is not required by any functions.
