// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title AgentRegistry — Escovra Agent Registry
/// @notice On-chain registry for AI agents and humans on Escovra marketplace
contract AgentRegistry {

    struct Agent {
        address wallet;
        string name;
        string bio;
        bytes32[] skills;
        uint256 minPriceWei;
        bool isActive;
        uint256 registeredAt;
    }

    mapping(address => Agent) public agents;
    mapping(address => bool) public isRegistered;
    address[] public agentList;

    event AgentRegistered(address indexed wallet, string name, bytes32[] skills, uint256 minPriceWei);
    event AgentUpdated(address indexed wallet, string name, bytes32[] skills, uint256 minPriceWei);
    event AgentDeactivated(address indexed wallet);
    event AgentActivated(address indexed wallet);

    error AlreadyRegistered();
    error NotRegistered();
    error TooManySkills();
    error EmptyName();

    function register(
        string calldata name,
        string calldata bio,
        bytes32[] calldata skills,
        uint256 minPriceWei
    ) external {
        if (isRegistered[msg.sender]) revert AlreadyRegistered();
        if (bytes(name).length == 0) revert EmptyName();
        if (skills.length > 8) revert TooManySkills();

        agents[msg.sender] = Agent({
            wallet: msg.sender,
            name: name,
            bio: bio,
            skills: skills,
            minPriceWei: minPriceWei,
            isActive: true,
            registeredAt: block.timestamp
        });

        isRegistered[msg.sender] = true;
        agentList.push(msg.sender);

        emit AgentRegistered(msg.sender, name, skills, minPriceWei);
    }

    function update(
        string calldata name,
        string calldata bio,
        bytes32[] calldata skills,
        uint256 minPriceWei
    ) external {
        if (!isRegistered[msg.sender]) revert NotRegistered();
        if (bytes(name).length == 0) revert EmptyName();
        if (skills.length > 8) revert TooManySkills();

        Agent storage a = agents[msg.sender];
        a.name = name;
        a.bio = bio;
        a.skills = skills;
        a.minPriceWei = minPriceWei;

        emit AgentUpdated(msg.sender, name, skills, minPriceWei);
    }

    function deactivate() external {
        if (!isRegistered[msg.sender]) revert NotRegistered();
        agents[msg.sender].isActive = false;
        emit AgentDeactivated(msg.sender);
    }

    function activate() external {
        if (!isRegistered[msg.sender]) revert NotRegistered();
        agents[msg.sender].isActive = true;
        emit AgentActivated(msg.sender);
    }

    function getAgent(address wallet) external view returns (Agent memory) {
        return agents[wallet];
    }

    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    function getAgentsBatch(uint256 from, uint256 to) external view returns (Agent[] memory) {
        if (to > agentList.length) to = agentList.length;
        Agent[] memory result = new Agent[](to - from);
        for (uint256 i = from; i < to; i++) {
            result[i - from] = agents[agentList[i]];
        }
        return result;
    }
}
