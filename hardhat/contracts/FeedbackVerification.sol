// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title FeedbackVerification
 * @dev Smart contract for verifying citizen feedback submissions on blockchain
 * @author Swaranusa Platform
 */
contract FeedbackVerification {
    // Struct to store feedback verification data
    struct FeedbackRecord {
        string feedbackHash;      // Hash of the feedback content
        uint256 timestamp;        // When the feedback was submitted
        address verifier;         // Address of the verifier (site owner)
        uint256 feedbackId;      // Original feedback ID from database
        bool exists;             // Flag to check if record exists
    }
    
    // Mapping from verification ID to feedback record
    mapping(uint256 => FeedbackRecord) public feedbackRecords;
    
    // Mapping from feedback hash to verification ID for quick lookup
    mapping(string => uint256) public hashToVerificationId;
    
    // Counter for verification IDs
    uint256 public verificationCounter;
    
    // Address of the site owner (only they can verify feedback)
    address public owner;
    
    // Events
    event FeedbackStored(
        uint256 indexed verificationId,
        string feedbackHash, 
        uint256 indexed feedbackId,
        uint256 timestamp,
        address indexed verifier
    );
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier validHash(string memory _hash) {
        require(bytes(_hash).length > 0, "Hash cannot be empty");
        _;
    }
    
    /**
     * @dev Constructor sets the contract deployer as the owner
     */
    constructor() {
        owner = msg.sender;
        verificationCounter = 0;
    }
    
    /**
     * @dev Store a feedback hash on the blockchain
     * @param _feedbackHash The hash of the feedback content
     * @param _feedbackId The original feedback ID from database
     * @param _timestamp The timestamp when feedback was submitted
     * @return verificationId The unique verification ID for this record
     */
    function storeFeedbackHash(
        string memory _feedbackHash,
        uint256 _feedbackId,
        uint256 _timestamp
    ) 
        public 
        onlyOwner 
        validHash(_feedbackHash)
        returns (uint256) 
    {
        require(hashToVerificationId[_feedbackHash] == 0, "Feedback hash already exists");
        require(_timestamp > 0, "Invalid timestamp");
        
        verificationCounter++;
        uint256 verificationId = verificationCounter;
        
        feedbackRecords[verificationId] = FeedbackRecord({
            feedbackHash: _feedbackHash,
            timestamp: _timestamp,
            verifier: msg.sender,
            feedbackId: _feedbackId,
            exists: true
        });
        
        hashToVerificationId[_feedbackHash] = verificationId;
        
        emit FeedbackStored(
            verificationId,
            _feedbackHash,
            _feedbackId,
            _timestamp,
            msg.sender
        );
        
        return verificationId;
    }
    
    /**
     * @dev Get feedback verification details by verification ID
     * @param _verificationId The verification ID to lookup
     * @return feedbackHash The hash of the feedback
     * @return feedbackId The original feedback ID
     * @return timestamp When the feedback was submitted
     * @return verifier Address of the verifier
     */
    function getFeedbackVerification(uint256 _verificationId) 
        public 
        view 
        returns (
            string memory feedbackHash,
            uint256 feedbackId,
            uint256 timestamp,
            address verifier
        ) 
    {
        require(feedbackRecords[_verificationId].exists, "Verification record not found");
        
        FeedbackRecord memory record = feedbackRecords[_verificationId];
        return (
            record.feedbackHash,
            record.feedbackId,
            record.timestamp,
            record.verifier
        );
    }
    
    /**
     * @dev Verify if a feedback hash exists on the blockchain
     * @param _feedbackHash The hash to verify
     * @return exists Whether the hash exists
     * @return verificationId The verification ID if exists
     * @return timestamp When it was verified
     * @return verifier Address of the verifier
     */
    function verifyFeedbackHash(string memory _feedbackHash) 
        public 
        view 
        validHash(_feedbackHash)
        returns (
            bool exists,
            uint256 verificationId,
            uint256 timestamp,
            address verifier
        ) 
    {
        verificationId = hashToVerificationId[_feedbackHash];
        
        if (verificationId == 0) {
            return (false, 0, 0, address(0));
        }
        
        FeedbackRecord memory record = feedbackRecords[verificationId];
        return (
            true,
            verificationId,
            record.timestamp,
            record.verifier
        );
    }
    
    /**
     * @dev Get total number of verified feedbacks
     * @return count Total verification count
     */
    function getTotalVerifications() public view returns (uint256) {
        return verificationCounter;
    }
    
    /**
     * @dev Transfer ownership to a new address
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        require(_newOwner != owner, "New owner must be different from current owner");
        
        address previousOwner = owner;
        owner = _newOwner;
        
        emit OwnershipTransferred(previousOwner, _newOwner);
    }
    
    /**
     * @dev Get contract information
     * @return contractOwner Address of the contract owner
     * @return totalVerifications Total number of verifications
     * @return contractBalance Contract balance in wei
     */
    function getContractInfo() 
        public 
        view 
        returns (
            address contractOwner,
            uint256 totalVerifications,
            uint256 contractBalance
        ) 
    {
        return (owner, verificationCounter, address(this).balance);
    }
}
