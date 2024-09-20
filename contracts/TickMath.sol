// contracts/TickMath.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library TickMath {
    int24 internal constant MIN_TICK = -887272;
    int24 internal constant MAX_TICK = -MIN_TICK;
}
