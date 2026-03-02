// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CyberFusionGuard
 * @dev Re-deploy this on Sepolia Testnet via Remix IDE.
 * This contract acts as an on-chain firewall, blocking transfers from flagged mule accounts.
 */
contract CyberFusionGuard {
    address public owner;

    struct BlacklistInfo {
        bool isBlacklisted;
        string reason;
        uint256 flaggedAt;
        uint256 blockedAttempts;
    }

    struct BlockedHistory {
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string reason;
    }

    mapping(address => BlacklistInfo) public blacklisted;
    BlockedHistory[] public history;

    event AccountFlagged(address indexed account, string reason, uint256 timestamp);
    event AccountUnflagged(address indexed account, uint256 timestamp);
    event TransactionBlocked(address indexed from, address indexed to, uint256 amount, string reason);
    event TransactionAllowed(address indexed from, address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Mark a wallet as a suspicious mule account.
     */
    function flagAccount(address account, string calldata reason) external onlyOwner {
        blacklisted[account] = BlacklistInfo({
            isBlacklisted: true,
            reason: reason,
            flaggedAt: block.timestamp,
            blockedAttempts: 0
        });
        emit AccountFlagged(account, reason, block.timestamp);
    }

    /**
     * @dev Clear a wallet's blacklist status.
     */
    function unflagAccount(address account) external onlyOwner {
        blacklisted[account].isBlacklisted = false;
        emit AccountUnflagged(account, block.timestamp);
    }

    /**
     * @dev A proxy transfer function that blocks transactions if the sender is blacklisted.
     * Use "CYBERFUSION BLOCK:" prefix in revert so the frontend can catch it easily.
     */
    function safeTransfer(address payable to) external payable {
        BlacklistInfo storage info = blacklisted[msg.sender];
        
        if (info.isBlacklisted) {
            info.blockedAttempts++;
            history.push(BlockedHistory({
                from: msg.sender,
                to: to,
                amount: msg.value,
                timestamp: block.timestamp,
                reason: info.reason
            }));
            
            // Critical: Revert with a specific prefix for the frontend to parse
            revert(string(abi.encodePacked("CYBERFUSION BLOCK: ", info.reason)));
        }

        (bool success, ) = to.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit TransactionAllowed(msg.sender, to, msg.value);
    }

    /**
     * @dev Utility to check account status on-chain.
     */
    function getAccountStatus(address account) external view returns (bool, string memory, uint256, uint256) {
        BlacklistInfo storage info = blacklisted[account];
        return (info.isBlacklisted, info.reason, info.flaggedAt, info.blockedAttempts);
    }

    /**
     * @dev Get last 50 blocked transaction records.
     */
    function getBlockedHistory() external view returns (BlockedHistory[] memory) {
        return history;
    }

    // Allow the owner to withdraw any ETH sent to the contract by mistake
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
