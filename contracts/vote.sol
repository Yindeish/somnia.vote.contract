// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VotingSystem {
    enum Role { None, Admin, Candidate, Voter }

    struct Candidate {
        address candidateAddress;
        string name;
        uint voteCount;
    }

    struct Vote {
        uint id;
        string title;
        bool active;
        mapping(address => bool) hasVoted;
        Candidate[] candidates;
    }

    mapping(address => Role) public roles;
    mapping(uint => Vote) public votes;

    uint public voteCounter;
    address public owner;

    uint public constant CREATE_VOTE_FEE = 0.5 ether;
    uint public constant CONTEST_FEE = 0.35 ether;
    uint public constant VOTE_FEE = 0.25 ether;

    constructor() {
        owner = msg.sender;
        roles[msg.sender] = Role.Admin; // Contract deployer is admin
    }

    modifier onlyAdmin() {
        require(roles[msg.sender] == Role.Admin, "Not admin");
        _;
    }

    modifier onlyCandidate() {
        require(roles[msg.sender] == Role.Candidate, "Not candidate");
        _;
    }

    modifier onlyVoter() {
        require(roles[msg.sender] == Role.Voter, "Not voter");
        _;
    }

    // Assign roles manually by admin
    function assignRole(address _user, Role _role) external onlyAdmin {
        require(_role != Role.None, "Invalid role");
        roles[_user] = _role;
    }

    // Admin creates a vote
    function createVote(string calldata _title) external payable onlyAdmin {
        require(msg.value == CREATE_VOTE_FEE, "Must pay 0.5 ETH");
        voteCounter++;
        Vote storage v = votes[voteCounter];
        v.id = voteCounter;
        v.title = _title;
        v.active = true;
    }

    // Candidate contests for a vote
    function contest(uint _voteId, string calldata _name) external payable onlyCandidate {
        require(msg.value == CONTEST_FEE, "Must pay 0.35 ETH");
        Vote storage v = votes[_voteId];
        require(v.active, "Vote not active");
        v.candidates.push(Candidate(msg.sender, _name, 0));
    }

    // Voter votes for a candidate
    function vote(uint _voteId, uint _candidateIndex) external payable onlyVoter {
        require(msg.value == VOTE_FEE, "Must pay 0.25 ETH");
        Vote storage v = votes[_voteId];
        require(v.active, "Vote not active");
        require(!v.hasVoted[msg.sender], "Already voted");
        require(_candidateIndex < v.candidates.length, "Invalid candidate");
        
        v.hasVoted[msg.sender] = true;
        v.candidates[_candidateIndex].voteCount++;
    }

    // End a vote
    function endVote(uint _voteId) external onlyAdmin {
        votes[_voteId].active = false;
    }

    // Withdraw contract balance (only owner)
    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }

    // Get candidates for a vote
    function getCandidates(uint _voteId) external view returns (Candidate[] memory) {
        return votes[_voteId].candidates;
    }
}
