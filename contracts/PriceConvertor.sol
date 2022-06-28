// SPDX-License-Identifier: MIT

pragma solidity 0.6.0;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";

library PriceConvertor {
  // libraries cannot have constant state variables

  function getVersion() public view returns (uint256) {
    AggregatorV3Interface latestPrice = AggregatorV3Interface(
      0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
    );
    return latestPrice.version();
  }

  function getLatestPrice(AggregatorV3Interface latestPrice)
    public
    view
    returns (uint256)
  {
    // AggregatorV3Interface latestPrice = AggregatorV3Interface(
    //   0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
    // );
    (, int256 answer, , , ) = latestPrice.latestRoundData();
    return uint256(answer);
  }

  function getConversionRate(
    uint256 ethAmounts,
    AggregatorV3Interface priceFeed
  ) internal view returns (uint256) {
    //this ethAmounts is a value this func
    // needs to run. Ye number hum input karenge
    uint256 ethPriceInUSD = getLatestPrice(priceFeed);
    uint256 ethAmountInUSD = ethAmounts * ethPriceInUSD;
    return ethAmountInUSD / 10**8;
  }
}
