const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FeedbackVerification", function () {
  let feedbackVerification;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const FeedbackVerification = await ethers.getContractFactory("FeedbackVerification");
    feedbackVerification = await FeedbackVerification.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await feedbackVerification.owner()).to.equal(owner.address);
    });

    it("Should start with zero verifications", async function () {
      expect(await feedbackVerification.getTotalVerifications()).to.equal(0);
    });

    it("Should start with zero verification counter", async function () {
      expect(await feedbackVerification.verificationCounter()).to.equal(0);
    });
  });

  describe("Storing Feedback", function () {
    const feedbackHash = "0x1234567890abcdef1234567890abcdef12345678";
    const feedbackId = 1;
    const timestamp = Math.floor(Date.now() / 1000);

    it("Should store feedback hash successfully", async function () {
      await expect(
        feedbackVerification.storeFeedbackHash(feedbackHash, feedbackId, timestamp)
      ).to.emit(feedbackVerification, "FeedbackStored")
        .withArgs(1, feedbackHash, feedbackId, timestamp, owner.address);

      expect(await feedbackVerification.getTotalVerifications()).to.equal(1);
    });

    it("Should fail when non-owner tries to store feedback", async function () {
      await expect(
        feedbackVerification.connect(addr1).storeFeedbackHash(feedbackHash, feedbackId, timestamp)
      ).to.be.revertedWith("Only owner can perform this action");
    });

    it("Should fail with empty hash", async function () {
      await expect(
        feedbackVerification.storeFeedbackHash("", feedbackId, timestamp)
      ).to.be.revertedWith("Hash cannot be empty");
    });

    it("Should fail with invalid timestamp", async function () {
      await expect(
        feedbackVerification.storeFeedbackHash(feedbackHash, feedbackId, 0)
      ).to.be.revertedWith("Invalid timestamp");
    });

    it("Should fail when storing duplicate hash", async function () {
      await feedbackVerification.storeFeedbackHash(feedbackHash, feedbackId, timestamp);
      
      await expect(
        feedbackVerification.storeFeedbackHash(feedbackHash, feedbackId + 1, timestamp)
      ).to.be.revertedWith("Feedback hash already exists");
    });

    it("Should return correct verification ID", async function () {
      const tx = await feedbackVerification.storeFeedbackHash(feedbackHash, feedbackId, timestamp);
      const receipt = await tx.wait();
      
      // Get the verification ID from the event
      const event = receipt.logs.find(log => {
        try {
          const parsed = feedbackVerification.interface.parseLog(log);
          return parsed.name === 'FeedbackStored';
        } catch {
          return false;
        }
      });
      
      expect(event).to.not.be.undefined;
      const parsed = feedbackVerification.interface.parseLog(event);
      expect(parsed.args[0]).to.equal(1); // First verification should have ID 1
    });
  });

  describe("Retrieving Feedback", function () {
    const feedbackHash = "0x1234567890abcdef1234567890abcdef12345678";
    const feedbackId = 1;
    const timestamp = Math.floor(Date.now() / 1000);

    beforeEach(async function () {
      await feedbackVerification.storeFeedbackHash(feedbackHash, feedbackId, timestamp);
    });

    it("Should retrieve feedback by verification ID", async function () {
      const result = await feedbackVerification.getFeedbackVerification(1);
      
      expect(result.feedbackHash).to.equal(feedbackHash);
      expect(result.feedbackId).to.equal(feedbackId);
      expect(result.timestamp).to.equal(timestamp);
      expect(result.verifier).to.equal(owner.address);
    });

    it("Should fail when retrieving non-existent verification ID", async function () {
      await expect(
        feedbackVerification.getFeedbackVerification(999)
      ).to.be.revertedWith("Verification record not found");
    });

    it("Should verify existing feedback hash", async function () {
      const result = await feedbackVerification.verifyFeedbackHash(feedbackHash);
      
      expect(result.exists).to.be.true;
      expect(result.verificationId).to.equal(1);
      expect(result.timestamp).to.equal(timestamp);
      expect(result.verifier).to.equal(owner.address);
    });

    it("Should return false for non-existent feedback hash", async function () {
      const result = await feedbackVerification.verifyFeedbackHash("0xnonexistent");
      
      expect(result.exists).to.be.false;
      expect(result.verificationId).to.equal(0);
      expect(result.timestamp).to.equal(0);
      expect(result.verifier).to.equal(ethers.ZeroAddress);
    });

    it("Should fail when verifying empty hash", async function () {
      await expect(
        feedbackVerification.verifyFeedbackHash("")
      ).to.be.revertedWith("Hash cannot be empty");
    });
  });

  describe("Multiple Feedbacks", function () {
    it("Should handle multiple feedback submissions", async function () {
      const feedbacks = [
        { hash: "0xhash1", id: 1, timestamp: 1000 },
        { hash: "0xhash2", id: 2, timestamp: 2000 },
        { hash: "0xhash3", id: 3, timestamp: 3000 }
      ];

      for (let i = 0; i < feedbacks.length; i++) {
        await feedbackVerification.storeFeedbackHash(
          feedbacks[i].hash,
          feedbacks[i].id,
          feedbacks[i].timestamp
        );
      }

      expect(await feedbackVerification.getTotalVerifications()).to.equal(3);

      // Verify each feedback
      for (let i = 0; i < feedbacks.length; i++) {
        const result = await feedbackVerification.verifyFeedbackHash(feedbacks[i].hash);
        expect(result.exists).to.be.true;
        expect(result.verificationId).to.equal(i + 1);
      }
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership successfully", async function () {
      await expect(
        feedbackVerification.transferOwnership(addr1.address)
      ).to.emit(feedbackVerification, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);

      expect(await feedbackVerification.owner()).to.equal(addr1.address);
    });

    it("Should fail when non-owner tries to transfer ownership", async function () {
      await expect(
        feedbackVerification.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWith("Only owner can perform this action");
    });

    it("Should fail when transferring to zero address", async function () {
      await expect(
        feedbackVerification.transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWith("New owner cannot be zero address");
    });

    it("Should fail when transferring to same owner", async function () {
      await expect(
        feedbackVerification.transferOwnership(owner.address)
      ).to.be.revertedWith("New owner must be different from current owner");
    });

    it("Should allow new owner to store feedback", async function () {
      await feedbackVerification.transferOwnership(addr1.address);
      
      const feedbackHash = "0x1234567890abcdef1234567890abcdef12345678";
      const feedbackId = 1;
      const timestamp = Math.floor(Date.now() / 1000);

      await expect(
        feedbackVerification.connect(addr1).storeFeedbackHash(feedbackHash, feedbackId, timestamp)
      ).to.emit(feedbackVerification, "FeedbackStored");
    });
  });

  describe("Contract Info", function () {
    it("Should return correct contract information", async function () {
      const info = await feedbackVerification.getContractInfo();
      
      expect(info.contractOwner).to.equal(owner.address);
      expect(info.totalVerifications).to.equal(0);
      expect(info.contractBalance).to.equal(0);
    });

    it("Should update total verifications in contract info", async function () {
      const feedbackHash = "0x1234567890abcdef1234567890abcdef12345678";
      const feedbackId = 1;
      const timestamp = Math.floor(Date.now() / 1000);

      await feedbackVerification.storeFeedbackHash(feedbackHash, feedbackId, timestamp);
      
      const info = await feedbackVerification.getContractInfo();
      expect(info.totalVerifications).to.equal(1);
    });
  });

  describe("Gas Usage", function () {
    it("Should use reasonable gas for storing feedback", async function () {
      const feedbackHash = "0x1234567890abcdef1234567890abcdef12345678";
      const feedbackId = 1;
      const timestamp = Math.floor(Date.now() / 1000);

      const tx = await feedbackVerification.storeFeedbackHash(feedbackHash, feedbackId, timestamp);
      const receipt = await tx.wait();
      
      console.log(`Gas used for storing feedback: ${receipt.gasUsed.toString()}`);
      
      // Should use less than 230,000 gas
      expect(receipt.gasUsed).to.be.below(230000);
    });

    it("Should emit event with correct parameters", async function () {
      const feedbackHash = "0x1234567890abcdef1234567890abcdef12345678";
      const feedbackId = 1;
      const timestamp = Math.floor(Date.now() / 1000);

      const tx = await feedbackVerification.storeFeedbackHash(feedbackHash, feedbackId, timestamp);
      const receipt = await tx.wait();
      
      // Find the FeedbackStored event
      const event = receipt.logs.find(log => {
        try {
          const parsed = feedbackVerification.interface.parseLog(log);
          return parsed.name === 'FeedbackStored';
        } catch {
          return false;
        }
      });
      
      expect(event).to.not.be.undefined;
      
      const parsed = feedbackVerification.interface.parseLog(event);
      expect(parsed.args[0]).to.equal(1); // verificationId
      expect(parsed.args[1]).to.equal(feedbackHash); // feedbackHash (not hashed)
      expect(parsed.args[2]).to.equal(feedbackId); // feedbackId
      expect(parsed.args[3]).to.equal(timestamp); // timestamp
      expect(parsed.args[4]).to.equal(owner.address); // verifier
    });
  });
});


