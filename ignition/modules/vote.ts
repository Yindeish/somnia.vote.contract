import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VoteModule = buildModule("VoteModule", (m) => {
  const votingSystem = m.contract("VotingSystem", []);

  return { votingSystem };
});

export default VoteModule;
