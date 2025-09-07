import { expect } from "chai";
import { ethers } from "hardhat";

describe("VotingSystem", function () {
  let VotingSystem: any;
  let voting: any;
  let owner: any, admin: any, candidate: any, voter: any;

  beforeEach(async () => {
    [owner, admin, candidate, voter] = await ethers.getSigners();
    VotingSystem = await ethers.getContractFactory("VotingSystem");
    voting = await VotingSystem.deploy();
    await voting.waitForDeployment();

    // Assign roles
    await voting.connect(owner).assignRole(admin.address, 1); // Admin
    await voting.connect(owner).assignRole(candidate.address, 2); // Candidate
    await voting.connect(owner).assignRole(voter.address, 3); // Voter
  });

  it("should assign roles correctly", async () => {
    expect(await voting.roles(admin.address)).to.equal(1);
    expect(await voting.roles(candidate.address)).to.equal(2);
    expect(await voting.roles(voter.address)).to.equal(3);
  });

  it("should allow admin to create a vote with fee", async () => {
    await expect(
      voting
        .connect(admin)
        .createVote("Election 1", { value: ethers.parseEther("0.5") })
    )
      .to.emit(voting, "VoteCreated")
      .withArgs(1, "Election 1", true);

    const vote = await voting.votes(1);
    expect(vote.id).to.equal(1);
    expect(vote.title).to.equal("Election 1");
    expect(vote.active).to.true;
  });

  it("should allow candidate to contest after admin creates vote", async () => {
    await voting
      .connect(admin)
      .createVote("Election 1", { value: ethers.parseEther("0.5") });

    await voting.connect(candidate).contest(1, "Candidate A", {
      value: ethers.parseEther("0.35"),
    });

    const candidates = await voting.getCandidates(1);
    expect(candidates.length).to.equal(1);
    expect(candidates[0].name).to.equal("Candidate A");
  });

  it("should allow voter to vote for a candidate", async () => {
    await voting
      .connect(admin)
      .createVote("Election 1", { value: ethers.parseEther("0.5") });
    await voting.connect(candidate).contest(1, "Candidate A", {
      value: ethers.parseEther("0.35"),
    });

    await voting
      .connect(voter)
      .vote(1, 0, { value: ethers.parseEther("0.25") });

    const candidates = await voting.getCandidates(1);
    expect(candidates[0].voteCount).to.equal(1);
  });

  it("should not allow voter to vote twice", async () => {
    await voting
      .connect(admin)
      .createVote("Election 1", { value: ethers.parseEther("0.5") });
    await voting.connect(candidate).contest(1, "Candidate A", {
      value: ethers.parseEther("0.35"),
    });

    await voting
      .connect(voter)
      .vote(1, 0, { value: ethers.parseEther("0.25") });

    await expect(
      voting.connect(voter).vote(1, 0, { value: ethers.parseEther("0.25") })
    ).to.be.revertedWith("Already voted");
  });
});
